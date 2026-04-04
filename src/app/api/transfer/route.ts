import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { type Address } from "viem";
import { sendUsdcTransfer } from "@/lib/tempo/transfer";
import { writeAuditLog } from "@/lib/audit";

const transferSchema = z.object({
  operatorId: z.string().uuid(),
  supplierId: z.string().uuid(),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountCents: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operatorId, supplierId, toAddress, amountCents } =
      transferSchema.parse(body);

    await writeAuditLog({
      eventType: "transfer_initiated",
      operatorId,
      supplierId,
      amount: amountCents,
      currency: "USDC",
      notes: `Manual transfer to ${toAddress}`,
    });

    const result = await sendUsdcTransfer(
      toAddress as Address,
      amountCents
    );

    await writeAuditLog({
      eventType: result.success ? "transfer_settled" : "transfer_failed",
      operatorId,
      supplierId,
      amount: amountCents,
      currency: "USDC",
      settlementTimeMs: result.settlementTimeMs ?? undefined,
      status: result.success ? "settled" : "failed",
      notes: result.error ?? undefined,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 422,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: err.issues },
        { status: 400 }
      );
    }
    console.error("Transfer error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
