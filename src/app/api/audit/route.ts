import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() { const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const entries = await db.auditLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 200 }); return NextResponse.json({ entries }); }
