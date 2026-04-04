import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  bigint,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const operatorStatusEnum = pgEnum("operator_status", [
  "active",
  "suspended",
]);

export const supplierStatusEnum = pgEnum("supplier_status", [
  "active",
  "inactive",
  "pending",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "settled",
  "failed",
  "held",
  "rejected",
]);

export const exceptionResolutionEnum = pgEnum("exception_resolution", [
  "approved",
  "rejected",
  "auto_resolved",
]);

export const resolvedByEnum = pgEnum("resolved_by", ["agent", "operator"]);

export const eventTypeEnum = pgEnum("event_type", [
  "signal_received",
  "policy_check_passed",
  "policy_check_failed",
  "transfer_initiated",
  "transfer_settled",
  "transfer_failed",
  "manual_review_required",
  "exception_detected",
  "exception_resolved",
]);

// Tables
export const operators = pgTable("operators", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  passwordHash: text("password_hash"),
  walletBalance: integer("wallet_balance").notNull().default(0), // stored in cents
  status: operatorStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .references(() => operators.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  verified: boolean("verified").notNull().default(false),
  perTransactionLimit: integer("per_transaction_limit").notNull(), // in cents
  monthlyLimit: integer("monthly_limit").notNull(), // in cents
  approvalThreshold: integer("approval_threshold"), // in cents, nullable
  status: supplierStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skus = pgTable("skus", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .references(() => operators.id)
    .notNull(),
  skuCode: varchar("sku_code", { length: 100 }).notNull(),
  supplierId: uuid("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  unitPrice: integer("unit_price").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).notNull().default("USDC"),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .references(() => operators.id)
    .notNull(),
  supplierId: uuid("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  skuId: uuid("sku_id").references(() => skus.id),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).notNull().default("USDC"),
  status: transactionStatusEnum("status").notNull().default("pending"),
  initiatedAt: timestamp("initiated_at").defaultNow().notNull(),
  settledAt: timestamp("settled_at"),
  settlementTimeMs: bigint("settlement_time_ms", { mode: "number" }),
  txHash: varchar("tx_hash", { length: 66 }),
  exceptionType: varchar("exception_type", { length: 100 }),
  exceptionResolvedBy: resolvedByEnum("exception_resolved_by"),
  notes: text("notes"),
});

export const exceptions = pgTable("exceptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolution: exceptionResolutionEnum("resolution"),
  resolvedBy: resolvedByEnum("resolved_by"),
  operatorNotifiedAt: timestamp("operator_notified_at"),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  operatorId: uuid("operator_id").references(() => operators.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  transactionId: uuid("transaction_id").references(() => transactions.id),
  amount: integer("amount"), // in cents
  currency: varchar("currency", { length: 10 }),
  status: varchar("status", { length: 50 }),
  settlementTimeMs: bigint("settlement_time_ms", { mode: "number" }),
  notes: text("notes"),
});

export const waitlist = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  businessType: varchar("business_type", { length: 255 }).notNull(),
  hadPaymentBlocked: varchar("had_payment_blocked", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type Operator = typeof operators.$inferSelect;
export type NewOperator = typeof operators.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type Sku = typeof skus.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Exception = typeof exceptions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;
