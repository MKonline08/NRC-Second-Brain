import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/security";

const setupSchema = z.object({ name: z.string().trim().min(2).max(60), email: z.string().email(), password: z.string().min(12).max(128) });

export async function GET() { return NextResponse.json({ complete: Boolean(await db.user.count()) }); }

export async function POST(request: NextRequest) {
  const forbidden = requireSameOrigin(request); if (forbidden) return forbidden;
  if (await db.user.count()) return NextResponse.json({ error: "Setup is already complete." }, { status: 409 });
  const result = setupSchema.safeParse(await request.json()); if (!result.success) return NextResponse.json({ error: "Use a valid email and a password with at least 12 characters." }, { status: 400 });
  const passwordHash = await bcrypt.hash(result.data.password, 12);
  const user = await db.user.create({ data: { name: result.data.name, email: result.data.email.toLowerCase(), passwordHash, workspaces: { create: [{ name: "School", color: "cyan" }, { name: "Dual Enrollment", color: "blue" }, { name: "Personal", color: "violet" }, { name: "Projects", color: "green" }] } } });
  await db.auditLog.create({ data: { userId: user.id, action: "setup.completed" } });
  await createSession(user);
  return NextResponse.json({ ok: true });
}
