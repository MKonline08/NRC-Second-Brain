import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";

const reviewSchema = z.object({ rating: z.enum(["again", "good", "easy"]) });
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const forbidden = requireSameOrigin(request); if (forbidden) return forbidden; const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const card = await db.flashcard.findFirst({ where: { id: (await params).id, userId: user.id } }); if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 }); const parsed = reviewSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Choose a review rating." }, { status: 400 }); const days = parsed.data.rating === "again" ? 0 : parsed.data.rating === "good" ? Math.max(1, card.interval || 1) : Math.max(3, (card.interval || 1) * 2); const updated = await db.flashcard.update({ where: { id: card.id }, data: { interval: days, dueAt: new Date(Date.now() + days * 86_400_000) } }); await db.auditLog.create({ data: { userId: user.id, action: `flashcard.reviewed.${parsed.data.rating}`, detail: card.id } }); return NextResponse.json({ card: updated }); }
