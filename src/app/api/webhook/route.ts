import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executePipeline } from "@/lib/pipeline";

const restockSignalSchema = z.object({
  operatorId: z.string().uuid(),
  skuCode: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signal = restockSignalSchema.parse(body);

    const result = await executePipeline(signal);

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
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
