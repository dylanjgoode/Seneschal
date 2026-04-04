import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions, auditLogs } from "@/lib/db/schema";

export async function GET() {
  try {
    // Check DB connectivity and get basic stats
    const [txCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions);

    const [logCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs);

    const [recentSettled] = await db
      .select({
        count: sql<number>`count(*)`,
        avgSettlement: sql<number>`avg(${transactions.settlementTimeMs})`,
      })
      .from(transactions)
      .where(sql`${transactions.status} = 'settled'`);

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      stats: {
        totalTransactions: Number(txCount?.count ?? 0),
        totalAuditEntries: Number(logCount?.count ?? 0),
        settledTransactions: Number(recentSettled?.count ?? 0),
        avgSettlementTimeMs: recentSettled?.avgSettlement
          ? Math.round(Number(recentSettled.avgSettlement))
          : null,
      },
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
