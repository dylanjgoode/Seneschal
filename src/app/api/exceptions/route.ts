import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exceptions, transactions, suppliers } from "@/lib/db/schema";
import { resolveException } from "@/lib/pipeline/exceptions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pending = searchParams.get("pending") === "true";

    let query = db
      .select({
        id: exceptions.id,
        transactionId: exceptions.transactionId,
        type: exceptions.type,
        detectedAt: exceptions.detectedAt,
        resolvedAt: exceptions.resolvedAt,
        resolution: exceptions.resolution,
        resolvedBy: exceptions.resolvedBy,
        transactionAmount: transactions.amount,
        supplierName: suppliers.name,
      })
      .from(exceptions)
      .leftJoin(transactions, eq(exceptions.transactionId, transactions.id))
      .leftJoin(suppliers, eq(transactions.supplierId, suppliers.id))
      .orderBy(desc(exceptions.detectedAt))
      .limit(50);

    if (pending) {
      query = query.where(sql`${exceptions.resolvedAt} is null`) as typeof query;
    }

    const results = await query;
    return NextResponse.json({ exceptions: results });
  } catch (err) {
    console.error("Exceptions query error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const resolveSchema = z.object({
  exceptionId: z.string().uuid(),
  resolution: z.enum(["approved", "rejected"]),
  operatorId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exceptionId, resolution, operatorId } = resolveSchema.parse(body);

    await resolveException(exceptionId, resolution, operatorId);

    return NextResponse.json({ success: true, resolution });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: err.issues },
        { status: 400 }
      );
    }
    console.error("Exception resolve error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
