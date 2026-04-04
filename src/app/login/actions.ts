"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { operators } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const [operator] = await db
    .select()
    .from(operators)
    .where(eq(operators.email, email))
    .limit(1);

  if (!operator || !operator.passwordHash) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, operator.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await setSessionCookie(operator.id, operator.email);
  redirect("/dashboard");
}
