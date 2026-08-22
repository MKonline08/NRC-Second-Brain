import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "nrc_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "development-only-change-this-secret");

export type SessionUser = { id: string; email: string; name: string; role: string };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  const store = await cookies();
  store.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload as unknown as SessionUser; } catch { return null; }
}

export async function clearSession() { (await cookies()).delete(cookieName); }
