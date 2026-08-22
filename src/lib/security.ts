import { NextRequest, NextResponse } from "next/server";

const attempts = new Map<string, { count: number; resetAt: number }>();

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  return null;
}

export function loginAllowed(request: NextRequest) {
  const key = request.headers.get("x-forwarded-for") ?? "local";
  const now = Date.now(); const record = attempts.get(key);
  if (record && record.resetAt > now && record.count >= 6) return false;
  if (!record || record.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 }); else record.count += 1;
  return true;
}

export function clearLoginAttempts(request: NextRequest) { attempts.delete(request.headers.get("x-forwarded-for") ?? "local"); }
