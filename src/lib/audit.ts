import { db } from "./db";
import { auditLogs } from "./db/schema";

type EventType =
  | "signal_received"
  | "policy_check_passed"
  | "policy_check_failed"
  | "transfer_initiated"
  | "transfer_settled"
  | "transfer_failed"
  | "manual_review_required"
  | "exception_detected"
  | "exception_resolved";

interface AuditEntry {
  eventType: EventType;
  operatorId?: string;
  supplierId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  settlementTimeMs?: number;
  notes?: string | null;
}

export async function writeAuditLog(entry: AuditEntry) {
  await db.insert(auditLogs).values({
    eventType: entry.eventType,
    operatorId: entry.operatorId,
    supplierId: entry.supplierId,
    transactionId: entry.transactionId,
    amount: entry.amount,
    currency: entry.currency,
    status: entry.status,
    settlementTimeMs: entry.settlementTimeMs,
    notes: entry.notes ?? undefined,
  });
}
