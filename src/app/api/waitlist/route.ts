import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/db/schema";

const waitlistSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  businessType: z.string().min(1).max(255),
  hadPaymentBlocked: z.enum(["yes", "no", "its_complicated"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = waitlistSchema.parse(body);

    await db.insert(waitlist).values({
      name: data.name,
      email: data.email,
      businessType: data.businessType,
      hadPaymentBlocked: data.hadPaymentBlocked,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data.", details: err.issues },
        { status: 400 },
      );
    }

    const message =
      err instanceof Error ? err.message : "Unknown error";

    // Handle unique constraint violation on email
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "This email is already on the waitlist." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
