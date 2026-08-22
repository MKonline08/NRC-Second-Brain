import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user, setupComplete: Boolean(await db.user.count()) });
}
