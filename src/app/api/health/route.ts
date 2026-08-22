import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasProductionSessionSecret } from "@/lib/auth";

export async function GET() {
  try { if (!hasProductionSessionSecret()) throw new Error("Session secret missing"); await db.$queryRaw`SELECT 1`; return NextResponse.json({ status: "healthy", service: "NRC Second Brain", timestamp: new Date().toISOString() }); }
  catch { return NextResponse.json({ status: "unhealthy", service: "NRC Second Brain" }, { status: 503 }); }
}
