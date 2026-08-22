import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";

const workspaceSchema = z.object({ name: z.string().trim().min(1).max(60), color: z.enum(["cyan", "blue", "violet", "green", "amber"]).default("cyan") });
export async function GET() { const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json({ workspaces: await db.workspace.findMany({ where: { ownerId: user.id }, include: { _count: { select: { items: { where: { deletedAt: null } } } } }, orderBy: { createdAt: "asc" } }) }); }
export async function POST(request: NextRequest) { const forbidden = requireSameOrigin(request); if (forbidden) return forbidden; const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const parsed = workspaceSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Choose a name and color." }, { status: 400 }); const workspace = await db.workspace.create({ data: { ...parsed.data, ownerId: user.id } }); await db.auditLog.create({ data: { userId: user.id, action: "workspace.created", detail: workspace.id } }); return NextResponse.json({ workspace }, { status: 201 }); }
