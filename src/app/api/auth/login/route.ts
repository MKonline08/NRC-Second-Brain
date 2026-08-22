import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clearLoginAttempts, loginAllowed, requireSameOrigin } from "@/lib/security";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });
export async function POST(request: NextRequest) {
  const forbidden = requireSameOrigin(request); if (forbidden) return forbidden;
  if (!loginAllowed(request)) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  const data = loginSchema.safeParse(await request.json()); if (!data.success) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: data.data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(data.data.password, user.passwordHash))) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  clearLoginAttempts(request); await createSession(user); await db.auditLog.create({ data: { userId: user.id, action: "auth.login" } });
  return NextResponse.json({ ok: true });
}
