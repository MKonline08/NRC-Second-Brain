import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/security";
export async function POST(request: NextRequest) { const forbidden = requireSameOrigin(request); if (forbidden) return forbidden; await clearSession(); return NextResponse.json({ ok: true }); }
