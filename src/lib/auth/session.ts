import { cookies } from "next/headers";
import { signToken, verifyToken } from "./jwt";

const COOKIE_NAME = "seneschal_session";

export async function setSessionCookie(
  operatorId: string,
  email: string,
): Promise<void> {
  const token = await signToken({ sub: operatorId, email });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<{
  operatorId: string;
  email: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub || !payload?.email) return null;
  return { operatorId: payload.sub, email: payload.email };
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
