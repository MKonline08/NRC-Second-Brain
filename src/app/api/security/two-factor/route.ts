import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { Secret, TOTP } from "otpauth";
import { getSession } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";

const confirmSchema = z.object({ secret: z.string().min(16).max(200), code: z.string().regex(/^\d{6}$/) });
export async function GET() { const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const current = await db.user.findUnique({ where: { id: user.id }, select: { twoFactorEnabled: true } }); return NextResponse.json({ enabled: current?.twoFactorEnabled ?? false }); }
export async function POST(request: NextRequest) { const forbidden = requireSameOrigin(request); if (forbidden) return forbidden; const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const body = await request.json(); if (body.action === "start") { const totp = new TOTP({ issuer: "NRC Second Brain", label: user.email, secret: new Secret({ size: 20 }) }); const secret = totp.secret.base32; const qr = await QRCode.toDataURL(totp.toString(), { margin: 1, width: 280, color: { dark: "#07111f", light: "#eaf4ff" } }); return NextResponse.json({ secret, qr }); } const parsed = confirmSchema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: "Enter the six-digit verification code." }, { status: 400 }); const totp = new TOTP({ secret: parsed.data.secret }); if (totp.validate({ token: parsed.data.code, window: 1 }) === null) return NextResponse.json({ error: "That code is not valid yet. Try the newest code." }, { status: 400 }); await db.user.update({ where: { id: user.id }, data: { twoFactorSecret: encrypt(parsed.data.secret), twoFactorEnabled: true } }); await db.auditLog.create({ data: { userId: user.id, action: "two_factor.enabled" } }); return NextResponse.json({ ok: true }); }
