import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaces = await db.workspace.findMany({ where: { ownerId: user.id }, include: { items: true } });
  await db.auditLog.create({ data: { userId: user.id, action: "data.exported" } });
  return NextResponse.json({ exportedAt: new Date().toISOString(), account: { name: user.name, email: user.email }, workspaces }, { headers: { "Content-Disposition": "attachment; filename=nrc-second-brain-export.json" } });
}
