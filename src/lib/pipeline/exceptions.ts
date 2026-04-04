import { db } from "../db";
import { exceptions, transactions } from "../db/schema";
import { eq } from "drizzle-orm";
import { writeAuditLog } from "../audit";

export type ExceptionType =
  | "invoice_over_po_minor"    // <=5% — auto-approve
  | "invoice_over_po_moderate" // 5-20% — hold, notify
  | "invoice_over_po_major"    // >20% — hold, require review
  | "supplier_wallet_changed"
  | "supplier_unresponsive"
  | "transfer_failed"
  | "spend_limit_exceeded"
  | "unrecognised_supplier";

interface DetectExceptionInput {
  transactionId: string;
  operatorId: string;
  invoiceAmount?: number;
  poAmount?: number;
  type: ExceptionType;
}

/**
 * Detect and record an exception for a transaction.
 * Returns whether the transaction should be auto-resolved or held.
 */
export async function handleException(
  input: DetectExceptionInput
): Promise<{ action: "auto_resolve" | "hold" | "reject"; exceptionId: string }> {
  // Determine action based on exception type
  let action: "auto_resolve" | "hold" | "reject";

  switch (input.type) {
    case "invoice_over_po_minor":
      action = "auto_resolve";
      break;
    case "invoice_over_po_moderate":
    case "supplier_wallet_changed":
    case "spend_limit_exceeded":
      action = "hold";
      break;
    case "invoice_over_po_major":
    case "unrecognised_supplier":
      action = "reject";
      break;
    case "transfer_failed":
      action = "hold"; // will retry
      break;
    case "supplier_unresponsive":
      action = "hold";
      break;
    default:
      action = "hold";
  }

  // Create exception record
  const [exception] = await db
    .insert(exceptions)
    .values({
      transactionId: input.transactionId,
      type: input.type,
      resolution: action === "auto_resolve" ? "auto_resolved" : undefined,
      resolvedAt: action === "auto_resolve" ? new Date() : undefined,
      resolvedBy: action === "auto_resolve" ? "agent" : undefined,
    })
    .returning();

  // Update transaction status
  if (action === "hold") {
    await db
      .update(transactions)
      .set({
        status: "held",
        exceptionType: input.type,
      })
      .where(eq(transactions.id, input.transactionId));
  } else if (action === "reject") {
    await db
      .update(transactions)
      .set({
        status: "rejected",
        exceptionType: input.type,
      })
      .where(eq(transactions.id, input.transactionId));
  }

  await writeAuditLog({
    eventType: "exception_detected",
    operatorId: input.operatorId,
    transactionId: input.transactionId,
    notes: `Exception: ${input.type}, action: ${action}`,
  });

  return { action, exceptionId: exception.id };
}

/**
 * Resolve an exception (operator approval/rejection).
 */
export async function resolveException(
  exceptionId: string,
  resolution: "approved" | "rejected",
  operatorId: string
) {
  const [exception] = await db
    .select()
    .from(exceptions)
    .where(eq(exceptions.id, exceptionId))
    .limit(1);

  if (!exception) throw new Error("Exception not found");

  await db
    .update(exceptions)
    .set({
      resolution,
      resolvedAt: new Date(),
      resolvedBy: "operator",
    })
    .where(eq(exceptions.id, exceptionId));

  // Update transaction status based on resolution
  const newStatus = resolution === "approved" ? "pending" : "rejected";
  await db
    .update(transactions)
    .set({
      status: newStatus,
      exceptionResolvedBy: "operator",
    })
    .where(eq(transactions.id, exception.transactionId));

  await writeAuditLog({
    eventType: "exception_resolved",
    operatorId,
    transactionId: exception.transactionId,
    notes: `Exception ${exceptionId} ${resolution} by operator`,
  });
}
