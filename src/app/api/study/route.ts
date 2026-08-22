import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";

const cardSchema = z.object({ front: z.string().trim().min(1).max(3000), back: z.string().trim().min(1).max(3000), workspaceId: z.string().optional() });
export async function GET() { const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json({ cards: await db.flashcard.findMany({ where: { userId: user.id }, orderBy: { dueAt: "asc" }, take: 100 }) }); }
export async function POST(request: NextRequest) { const forbidden = requireSameOrigin(request); if (forbidden) return forbidden; const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const parsed = cardSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Add a question and answer." }, { status: 400 }); if (parsed.data.workspaceId && !await db.workspace.findFirst({ where: { id: parsed.data.workspaceId, ownerId: user.id } })) return NextResponse.json({ error: "Workspace not found." }, { status: 404 }); const card = await db.flashcard.create({ data: { ...parsed.data, userId: user.id } }); await db.auditLog.create({ data: { userId: user.id, action: "flashcard.created", detail: card.id } }); return NextResponse.json({ card }, { status: 201 }); }
