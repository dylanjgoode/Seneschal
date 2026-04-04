import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "../db";
import { transactions, suppliers } from "../db/schema";
import { loadSpendPolicy, type SupplierPolicy } from "../config";

export interface PolicyCheckResult {
  passed: boolean;
  reason: string | null;
  requiresApproval: boolean;
}

/**
 * Check spend policy for a transaction.
 * Validates: supplier approved, per-txn limit, monthly limit, approval threshold.
 */
export async function checkPolicy(
  operatorId: string,
  supplierId: string,
  amountCents: number
): Promise<PolicyCheckResult> {
  const policy = loadSpendPolicy();

  // Look up supplier in DB
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!supplier) {
    return { passed: false, reason: "Supplier not found", requiresApproval: false };
  }

  if (supplier.status !== "active") {
    return { passed: false, reason: "Supplier is not active", requiresApproval: false };
  }

  if (!supplier.verified) {
    return { passed: false, reason: "Supplier not verified", requiresApproval: false };
  }

  // Check per-transaction limit
  if (amountCents > supplier.perTransactionLimit) {
    return {
      passed: false,
      reason: `Amount $${(amountCents / 100).toFixed(2)} exceeds per-transaction limit of $${(supplier.perTransactionLimit / 100).toFixed(2)}`,
      requiresApproval: false,
    };
  }

  // Check monthly limit — sum settled transactions this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthlySpend] = await db
    .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.operatorId, operatorId),
        eq(transactions.supplierId, supplierId),
        eq(transactions.status, "settled"),
        gte(transactions.initiatedAt, monthStart)
      )
    );

  const currentMonthly = Number(monthlySpend?.total ?? 0);
  if (currentMonthly + amountCents > supplier.monthlyLimit) {
    return {
      passed: false,
      reason: `Monthly limit would be exceeded: $${((currentMonthly + amountCents) / 100).toFixed(2)} > $${(supplier.monthlyLimit / 100).toFixed(2)}`,
      requiresApproval: false,
    };
  }

  // Check if manual approval is required (global threshold)
  const amountDollars = amountCents / 100;
  if (amountDollars > policy.global.require_approval_above) {
    return {
      passed: true,
      reason: `Amount $${amountDollars.toFixed(2)} exceeds approval threshold of $${policy.global.require_approval_above}`,
      requiresApproval: true,
    };
  }

  // Check supplier-level approval threshold
  if (
    supplier.approvalThreshold &&
    amountCents > supplier.approvalThreshold
  ) {
    return {
      passed: true,
      reason: `Amount exceeds supplier approval threshold of $${(supplier.approvalThreshold / 100).toFixed(2)}`,
      requiresApproval: true,
    };
  }

  return { passed: true, reason: null, requiresApproval: false };
}
