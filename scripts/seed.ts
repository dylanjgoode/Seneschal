/**
 * Seed script — populates the database with demo data for the Alan demo.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires POSTGRES_URL in environment (or .env.development.local).
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

// Load env from .env.development.local
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env.development.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // .env file may not exist — that's fine if POSTGRES_URL is already set
  }
}

loadEnv();

if (!process.env.POSTGRES_URL) {
  console.error("POSTGRES_URL is required. Set it in .env.development.local or export it.");
  process.exit(1);
}

const sql = neon(process.env.POSTGRES_URL);
const db = drizzle(sql, { schema });

// ---------------------------------------------------------------------------
// Hash password using Web Crypto (same approach as src/lib/auth/password.ts)
// ---------------------------------------------------------------------------
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    32 * 8,
  );
  const hexEncode = (buf: ArrayBuffer | Uint8Array) =>
    Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hexEncode(salt)}:${hexEncode(bits)}`;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Seeding database...\n");

  // 1. Operator
  const passwordHash = await hashPassword("demo1234");

  const [operator] = await db
    .insert(schema.operators)
    .values({
      name: "Acme Store",
      email: "demo@acme.com",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      passwordHash,
      walletBalance: 2_500_000, // $25,000
      status: "active",
    })
    .returning();

  console.log(`Operator: ${operator.name} (${operator.id})`);
  console.log(`  Login: demo@acme.com / demo1234\n`);

  // 2. Suppliers
  const supplierData = [
    {
      name: "Shenzhen Textiles Co.",
      walletAddress: "0xAABBCCDDEE11223344556677889900AABBCCDDEE",
      verified: true,
      perTransactionLimit: 500_000, // $5,000
      monthlyLimit: 2_500_000,      // $25,000
      approvalThreshold: 300_000,   // $3,000
      status: "active" as const,
      notes: "Primary textile supplier. Reliable, 2-year relationship.",
    },
    {
      name: "Guangzhou Electronics Ltd.",
      walletAddress: "0x1122334455667788990011223344556677889900",
      verified: true,
      perTransactionLimit: 300_000, // $3,000
      monthlyLimit: 1_500_000,      // $15,000
      approvalThreshold: 200_000,   // $2,000
      status: "active" as const,
      notes: "Electronics components. Fast turnaround.",
    },
    {
      name: "Mumbai Packaging Corp.",
      walletAddress: "0xDEADBEEFCAFE0000DEADBEEFCAFE0000DEADBEEF",
      verified: true,
      perTransactionLimit: 200_000, // $2,000
      monthlyLimit: 800_000,        // $8,000
      approvalThreshold: null,
      status: "active" as const,
      notes: "Packaging materials. New supplier, onboarded last month.",
    },
  ];

  const supplierRows = [];
  for (const s of supplierData) {
    const [row] = await db
      .insert(schema.suppliers)
      .values({ operatorId: operator.id, ...s })
      .returning();
    supplierRows.push(row);
    console.log(`Supplier: ${row.name} (${row.id})`);
  }
  console.log();

  // 3. SKUs
  const skuData = [
    { skuCode: "TEX-001", supplierId: supplierRows[0].id, unitPrice: 45_00, currency: "USDC" },
    { skuCode: "TEX-002", supplierId: supplierRows[0].id, unitPrice: 72_00, currency: "USDC" },
    { skuCode: "ELEC-001", supplierId: supplierRows[1].id, unitPrice: 120_00, currency: "USDC" },
    { skuCode: "ELEC-002", supplierId: supplierRows[1].id, unitPrice: 85_00, currency: "USDC" },
    { skuCode: "PKG-001", supplierId: supplierRows[2].id, unitPrice: 15_00, currency: "USDC" },
    { skuCode: "PKG-002", supplierId: supplierRows[2].id, unitPrice: 28_00, currency: "USDC" },
  ];

  const skuRows = [];
  for (const s of skuData) {
    const [row] = await db
      .insert(schema.skus)
      .values({ operatorId: operator.id, ...s })
      .returning();
    skuRows.push(row);
  }
  console.log(`Created ${skuRows.length} SKUs`);

  // 4. Historical transactions (mix of statuses)
  const now = Date.now();
  const DAY = 86_400_000;

  const txnData: {
    supplierId: string;
    skuId: string;
    amount: number;
    status: "settled" | "failed" | "held" | "rejected";
    daysAgo: number;
    settlementTimeMs: number | null;
    txHash: string | null;
    exceptionType: string | null;
    exceptionResolvedBy: "agent" | "operator" | null;
    notes: string | null;
  }[] = [
    // Settled transactions — the happy path
    { supplierId: supplierRows[0].id, skuId: skuRows[0].id, amount: 225_00, status: "settled", daysAgo: 21, settlementTimeMs: 163_000, txHash: "0xabc123def456789012345678901234567890123456789012345678901234abcd", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[0].id, skuId: skuRows[1].id, amount: 360_00, status: "settled", daysAgo: 18, settlementTimeMs: 142_000, txHash: "0xbcd234ef5678901234567890123456789012345678901234567890123456bcde", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[1].id, skuId: skuRows[2].id, amount: 1_200_00, status: "settled", daysAgo: 15, settlementTimeMs: 178_000, txHash: "0xcde345f67890123456789012345678901234567890123456789012345678cdef", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[2].id, skuId: skuRows[4].id, amount: 750_00, status: "settled", daysAgo: 12, settlementTimeMs: 125_000, txHash: "0xdef456078901234567890123456789012345678901234567890123456789defa", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[0].id, skuId: skuRows[0].id, amount: 450_00, status: "settled", daysAgo: 10, settlementTimeMs: 155_000, txHash: "0xefa567189012345678901234567890123456789012345678901234567890efab", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[1].id, skuId: skuRows[3].id, amount: 850_00, status: "settled", daysAgo: 7, settlementTimeMs: 131_000, txHash: "0xfab678290123456789012345678901234567890123456789012345678901fabc", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[2].id, skuId: skuRows[5].id, amount: 560_00, status: "settled", daysAgo: 5, settlementTimeMs: 148_000, txHash: "0x0bc789301234567890123456789012345678901234567890123456789012abcd", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[0].id, skuId: skuRows[1].id, amount: 720_00, status: "settled", daysAgo: 3, settlementTimeMs: 137_000, txHash: "0x1cd890412345678901234567890123456789012345678901234567890123bcde", exceptionType: null, exceptionResolvedBy: null, notes: null },
    { supplierId: supplierRows[1].id, skuId: skuRows[2].id, amount: 2_400_00, status: "settled", daysAgo: 2, settlementTimeMs: 162_000, txHash: "0x2de901523456789012345678901234567890123456789012345678901234cdef", exceptionType: "invoice_over_po_minor", exceptionResolvedBy: "agent", notes: "Invoice 3% over PO — auto-approved per policy" },
    { supplierId: supplierRows[0].id, skuId: skuRows[0].id, amount: 315_00, status: "settled", daysAgo: 1, settlementTimeMs: 119_000, txHash: "0x3ef012634567890123456789012345678901234567890123456789012345defa", exceptionType: null, exceptionResolvedBy: null, notes: null },

    // Failed transaction
    { supplierId: supplierRows[1].id, skuId: skuRows[3].id, amount: 170_00, status: "failed", daysAgo: 9, settlementTimeMs: null, txHash: null, exceptionType: "transfer_failed", exceptionResolvedBy: null, notes: "RPC timeout during settlement" },

    // Held (pending approval) — these are the demo exceptions
    { supplierId: supplierRows[0].id, skuId: skuRows[1].id, amount: 3_600_00, status: "held", daysAgo: 0, settlementTimeMs: null, txHash: null, exceptionType: "invoice_over_po_moderate", exceptionResolvedBy: null, notes: "Invoice 12% over PO ($3,600 vs $3,200 PO)" },
    { supplierId: supplierRows[1].id, skuId: skuRows[2].id, amount: 2_800_00, status: "held", daysAgo: 0, settlementTimeMs: null, txHash: null, exceptionType: "spend_limit_exceeded", exceptionResolvedBy: null, notes: "Exceeds supplier approval threshold of $2,000" },

    // Rejected
    { supplierId: supplierRows[2].id, skuId: skuRows[4].id, amount: 4_500_00, status: "rejected", daysAgo: 6, settlementTimeMs: null, txHash: null, exceptionType: "invoice_over_po_major", exceptionResolvedBy: "operator", notes: "Invoice 35% over PO — operator rejected" },
  ];

  const txnRows = [];
  for (const t of txnData) {
    const initiatedAt = new Date(now - t.daysAgo * DAY + Math.random() * DAY * 0.5);
    const settledAt =
      t.status === "settled" && t.settlementTimeMs
        ? new Date(initiatedAt.getTime() + t.settlementTimeMs)
        : null;

    const [row] = await db
      .insert(schema.transactions)
      .values({
        operatorId: operator.id,
        supplierId: t.supplierId,
        skuId: t.skuId,
        amount: t.amount,
        currency: "USDC",
        status: t.status,
        initiatedAt,
        settledAt,
        settlementTimeMs: t.settlementTimeMs,
        txHash: t.txHash,
        exceptionType: t.exceptionType,
        exceptionResolvedBy: t.exceptionResolvedBy,
        notes: t.notes,
      })
      .returning();
    txnRows.push(row);
  }
  console.log(`Created ${txnRows.length} transactions`);

  // 5. Exceptions (matching the transactions that have exception types)
  const exceptionEntries: {
    transactionId: string;
    type: string;
    daysAgo: number;
    resolution: "approved" | "rejected" | "auto_resolved" | null;
    resolvedBy: "agent" | "operator" | null;
  }[] = [
    // Auto-resolved minor invoice variance
    { transactionId: txnRows[8].id, type: "invoice_over_po_minor", daysAgo: 2, resolution: "auto_resolved", resolvedBy: "agent" },
    // Transfer failed
    { transactionId: txnRows[10].id, type: "transfer_failed", daysAgo: 9, resolution: null, resolvedBy: null },
    // Pending — moderate invoice over PO (for demo)
    { transactionId: txnRows[11].id, type: "invoice_over_po_moderate", daysAgo: 0, resolution: null, resolvedBy: null },
    // Pending — spend limit exceeded (for demo)
    { transactionId: txnRows[12].id, type: "spend_limit_exceeded", daysAgo: 0, resolution: null, resolvedBy: null },
    // Rejected — major invoice over PO
    { transactionId: txnRows[13].id, type: "invoice_over_po_major", daysAgo: 6, resolution: "rejected", resolvedBy: "operator" },
  ];

  for (const e of exceptionEntries) {
    const detectedAt = new Date(now - e.daysAgo * DAY + Math.random() * 3600_000);
    await db.insert(schema.exceptions).values({
      transactionId: e.transactionId,
      type: e.type,
      detectedAt,
      resolvedAt: e.resolution ? new Date(detectedAt.getTime() + 60_000 * (1 + Math.random() * 30)) : null,
      resolution: e.resolution,
      resolvedBy: e.resolvedBy,
      operatorNotifiedAt: e.resolution !== "auto_resolved" ? detectedAt : null,
    });
  }
  console.log(`Created ${exceptionEntries.length} exceptions`);

  // 6. Audit log entries for recent transactions
  const auditEntries: {
    eventType: "signal_received" | "policy_check_passed" | "policy_check_failed" | "transfer_initiated" | "transfer_settled" | "transfer_failed" | "manual_review_required" | "exception_detected" | "exception_resolved";
    transactionId?: string;
    supplierId?: string;
    amount?: number;
    notes?: string;
    daysAgo: number;
  }[] = [];

  // Add audit trail for the most recent settled transaction
  const recentTx = txnRows[9]; // last settled
  auditEntries.push(
    { eventType: "signal_received", daysAgo: 1, notes: "Restock signal: SKU TEX-001, qty 7" },
    { eventType: "policy_check_passed", transactionId: recentTx.id, supplierId: supplierRows[0].id, amount: 315_00, daysAgo: 1 },
    { eventType: "transfer_initiated", transactionId: recentTx.id, supplierId: supplierRows[0].id, amount: 315_00, daysAgo: 1 },
    { eventType: "transfer_settled", transactionId: recentTx.id, supplierId: supplierRows[0].id, amount: 315_00, daysAgo: 1, notes: "Settlement: 119s" },
  );

  // Audit for the held transactions
  auditEntries.push(
    { eventType: "signal_received", daysAgo: 0, notes: "Restock signal: SKU TEX-002, qty 50" },
    { eventType: "policy_check_passed", transactionId: txnRows[11].id, supplierId: supplierRows[0].id, amount: 3_600_00, daysAgo: 0, notes: "Requires approval: invoice 12% over PO" },
    { eventType: "manual_review_required", transactionId: txnRows[11].id, supplierId: supplierRows[0].id, amount: 3_600_00, daysAgo: 0 },
    { eventType: "exception_detected", transactionId: txnRows[11].id, daysAgo: 0, notes: "Exception: invoice_over_po_moderate, action: hold" },
  );

  auditEntries.push(
    { eventType: "signal_received", daysAgo: 0, notes: "Restock signal: SKU ELEC-001, qty 20" },
    { eventType: "policy_check_passed", transactionId: txnRows[12].id, supplierId: supplierRows[1].id, amount: 2_800_00, daysAgo: 0, notes: "Requires approval: exceeds supplier threshold" },
    { eventType: "manual_review_required", transactionId: txnRows[12].id, supplierId: supplierRows[1].id, amount: 2_800_00, daysAgo: 0 },
    { eventType: "exception_detected", transactionId: txnRows[12].id, daysAgo: 0, notes: "Exception: spend_limit_exceeded, action: hold" },
  );

  for (const a of auditEntries) {
    const ts = new Date(now - a.daysAgo * DAY + Math.random() * 3600_000);
    await db.insert(schema.auditLogs).values({
      timestamp: ts,
      eventType: a.eventType,
      operatorId: operator.id,
      supplierId: a.supplierId ?? null,
      transactionId: a.transactionId ?? null,
      amount: a.amount ?? null,
      currency: a.amount ? "USDC" : null,
      status: null,
      settlementTimeMs: null,
      notes: a.notes ?? null,
    });
  }
  console.log(`Created ${auditEntries.length} audit log entries`);

  console.log("\nSeed complete!");
  console.log("Login: demo@acme.com / demo1234");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
