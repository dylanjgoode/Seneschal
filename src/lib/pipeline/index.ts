import { eq } from "drizzle-orm";
import { type Address } from "viem";
import { db } from "../db";
import { skus, suppliers, transactions } from "../db/schema";
import { writeAuditLog } from "../audit";
import { checkPolicy } from "./policy";
import { sendUsdcTransfer } from "../tempo/transfer";

interface RestockSignal {
  operatorId: string;
  skuCode: string;
  quantity: number;
}

interface PipelineResult {
  success: boolean;
  transactionId: string | null;
  status: string;
  error: string | null;
  settlementTimeMs: number | null;
  txHash: string | null;
}

/**
 * Main pipeline: restock signal → SKU lookup → policy check → transfer → log.
 */
export async function executePipeline(
  signal: RestockSignal
): Promise<PipelineResult> {
  const { operatorId, skuCode, quantity } = signal;

  // 1. Log signal received
  await writeAuditLog({
    eventType: "signal_received",
    operatorId,
    notes: `Restock signal: SKU ${skuCode}, qty ${quantity}`,
  });

  // 2. SKU lookup
  const [sku] = await db
    .select()
    .from(skus)
    .where(eq(skus.skuCode, skuCode))
    .limit(1);

  if (!sku) {
    await writeAuditLog({
      eventType: "policy_check_failed",
      operatorId,
      notes: `SKU not found: ${skuCode}`,
    });
    return {
      success: false,
      transactionId: null,
      status: "failed",
      error: `SKU not found: ${skuCode}`,
      settlementTimeMs: null,
      txHash: null,
    };
  }

  const amountCents = sku.unitPrice * quantity;

  // Look up supplier
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, sku.supplierId))
    .limit(1);

  if (!supplier) {
    await writeAuditLog({
      eventType: "policy_check_failed",
      operatorId,
      notes: `Supplier not found for SKU ${skuCode}`,
    });
    return {
      success: false,
      transactionId: null,
      status: "failed",
      error: "Supplier not found",
      settlementTimeMs: null,
      txHash: null,
    };
  }

  // 3. Policy check
  const policyResult = await checkPolicy(operatorId, supplier.id, amountCents);

  if (!policyResult.passed) {
    await writeAuditLog({
      eventType: "policy_check_failed",
      operatorId,
      supplierId: supplier.id,
      amount: amountCents,
      currency: sku.currency,
      notes: policyResult.reason ?? undefined,
    });
    return {
      success: false,
      transactionId: null,
      status: "policy_failed",
      error: policyResult.reason,
      settlementTimeMs: null,
      txHash: null,
    };
  }

  await writeAuditLog({
    eventType: "policy_check_passed",
    operatorId,
    supplierId: supplier.id,
    amount: amountCents,
    currency: sku.currency,
    notes: policyResult.requiresApproval
      ? `Requires approval: ${policyResult.reason}`
      : undefined,
  });

  // If requires approval, create held transaction
  if (policyResult.requiresApproval) {
    const [tx] = await db
      .insert(transactions)
      .values({
        operatorId,
        supplierId: supplier.id,
        skuId: sku.id,
        amount: amountCents,
        currency: sku.currency,
        status: "held",
        exceptionType: "spend_limit_exceeded",
        notes: policyResult.reason ?? undefined,
      })
      .returning();

    await writeAuditLog({
      eventType: "manual_review_required",
      operatorId,
      supplierId: supplier.id,
      transactionId: tx.id,
      amount: amountCents,
      currency: sku.currency,
      notes: policyResult.reason ?? undefined,
    });

    return {
      success: true,
      transactionId: tx.id,
      status: "held",
      error: null,
      settlementTimeMs: null,
      txHash: null,
    };
  }

  // 4. Create transaction and initiate transfer
  const [tx] = await db
    .insert(transactions)
    .values({
      operatorId,
      supplierId: supplier.id,
      skuId: sku.id,
      amount: amountCents,
      currency: sku.currency,
      status: "pending",
    })
    .returning();

  await writeAuditLog({
    eventType: "transfer_initiated",
    operatorId,
    supplierId: supplier.id,
    transactionId: tx.id,
    amount: amountCents,
    currency: sku.currency,
  });

  // 5. Execute transfer on Tempo
  const transferResult = await sendUsdcTransfer(
    supplier.walletAddress as Address,
    amountCents
  );

  if (transferResult.success) {
    await db
      .update(transactions)
      .set({
        status: "settled",
        settledAt: new Date(),
        settlementTimeMs: transferResult.settlementTimeMs,
        txHash: transferResult.txHash,
      })
      .where(eq(transactions.id, tx.id));

    await writeAuditLog({
      eventType: "transfer_settled",
      operatorId,
      supplierId: supplier.id,
      transactionId: tx.id,
      amount: amountCents,
      currency: sku.currency,
      settlementTimeMs: transferResult.settlementTimeMs ?? undefined,
      status: "settled",
    });

    return {
      success: true,
      transactionId: tx.id,
      status: "settled",
      error: null,
      settlementTimeMs: transferResult.settlementTimeMs,
      txHash: transferResult.txHash,
    };
  }

  // Transfer failed
  await db
    .update(transactions)
    .set({
      status: "failed",
      notes: transferResult.error ?? undefined,
    })
    .where(eq(transactions.id, tx.id));

  await writeAuditLog({
    eventType: "transfer_failed",
    operatorId,
    supplierId: supplier.id,
    transactionId: tx.id,
    amount: amountCents,
    currency: sku.currency,
    status: "failed",
    notes: transferResult.error ?? undefined,
  });

  return {
    success: false,
    transactionId: tx.id,
    status: "failed",
    error: transferResult.error,
    settlementTimeMs: transferResult.settlementTimeMs,
    txHash: transferResult.txHash,
  };
}
