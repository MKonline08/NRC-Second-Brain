import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";

const createSchema = z.object({ itemId: z.string(), password: z.string().min(6).max(128).optional(), expiresAt: z.string().datetime().optional() });
export async function GET() { const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const links = await db.shareLink.findMany({ where: { ownerId: user.id }, include: { item: { select: { title: true } } }, orderBy: { createdAt: "desc" } }); return NextResponse.json({ links }); }
export async function POST(request: NextRequest) { const forbidden = requireSameOrigin(request); if (forbidden) return forbidden; const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const parsed = createSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Check the sharing options." }, { status: 400 }); const item = await db.brainItem.findFirst({ where: { id: parsed.data.itemId, workspace: { ownerId: user.id }, deletedAt: null } }); if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 }); const share = await db.shareLink.create({ data: { token: randomBytes(18).toString("base64url"), passwordHash: parsed.data.password ? await bcrypt.hash(parsed.data.password, 12) : undefined, expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined, itemId: item.id, ownerId: user.id } }); await db.auditLog.create({ data: { userId: user.id, action: "share_link.created", detail: share.id } }); return NextResponse.json({ share: { ...share, url: `/share/${share.token}` } }, { status: 201 }); }
