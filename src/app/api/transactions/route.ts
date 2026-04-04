import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions, suppliers } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operatorId = searchParams.get("operatorId");
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    let query = db
      .select({
        id: transactions.id,
        operatorId: transactions.operatorId,
        supplierId: transactions.supplierId,
        supplierName: suppliers.name,
        skuId: transactions.skuId,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        initiatedAt: transactions.initiatedAt,
        settledAt: transactions.settledAt,
        settlementTimeMs: transactions.settlementTimeMs,
        txHash: transactions.txHash,
        exceptionType: transactions.exceptionType,
        notes: transactions.notes,
      })
      .from(transactions)
      .leftJoin(suppliers, eq(transactions.supplierId, suppliers.id))
      .orderBy(desc(transactions.initiatedAt))
      .limit(limit);

    if (operatorId) {
      query = query.where(eq(transactions.operatorId, operatorId)) as typeof query;
    }

    const results = await query;

    return NextResponse.json({ transactions: results });
  } catch (err) {
    console.error("Transactions query error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
