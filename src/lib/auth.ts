import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { db } from "@/lib/db";

const cookieName = "nrc_session";
const developmentSecret = "development-only-change-this-secret";
export function signingSecret() { const value = process.env.SESSION_SECRET; if (value && value !== developmentSecret) return new TextEncoder().encode(value); if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be configured in production."); return new TextEncoder().encode(developmentSecret); }
export function hasProductionSessionSecret() { return process.env.NODE_ENV !== "production" || Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET !== developmentSecret); }

export type SessionUser = { id: string; email: string; name: string; role: string; sid?: string };

export async function createSession(user: SessionUser) {
  const requestHeaders = await headers(); const session = await db.session.create({ data: { userId: user.id, userAgent: requestHeaders.get("user-agent"), ipAddress: requestHeaders.get("x-forwarded-for"), expiresAt: new Date(Date.now() + 7 * 86_400_000) } });
  const token = await new SignJWT({ ...user, sid: session.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(signingSecret());
  const store = await cookies();
  store.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try { const payload = (await jwtVerify(token, signingSecret())).payload as unknown as SessionUser; if (!payload.sid) return null; const session = await db.session.findUnique({ where: { id: payload.sid } }); if (!session || session.revokedAt || session.expiresAt <= new Date()) return null; void db.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }); return payload; } catch { return null; }
}

export async function clearSession() { const store = await cookies(); const token = store.get(cookieName)?.value; if (token) { try { const payload = (await jwtVerify(token, signingSecret())).payload as unknown as SessionUser; if (payload.sid) await db.session.update({ where: { id: payload.sid }, data: { revokedAt: new Date() } }); } catch {} } store.delete(cookieName); }
