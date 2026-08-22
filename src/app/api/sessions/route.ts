import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";
export async function GET() { const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const sessions = await db.session.findMany({ where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" } }); return NextResponse.json({ sessions, currentId: user.sid }); }
export async function DELETE(request: NextRequest) { const forbidden = requireSameOrigin(request); if (forbidden) return forbidden; const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const id = request.nextUrl.searchParams.get("id"); if (!id) return NextResponse.json({ error: "Choose a session." }, { status: 400 }); await db.session.updateMany({ where: { id, userId: user.id }, data: { revokedAt: new Date() } }); return NextResponse.json({ ok: true }); }
