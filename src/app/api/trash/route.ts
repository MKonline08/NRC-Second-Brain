import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.brainItem.findMany({ where: { deletedAt: { not: null }, workspace: { ownerId: user.id } }, include: { workspace: { select: { name: true } } }, orderBy: { deletedAt: "desc" } });
  return NextResponse.json({ items });
}
