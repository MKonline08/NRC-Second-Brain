import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await db.brainItem.findFirst({ where: { id: (await params).id, workspace: { ownerId: user.id }, deletedAt: null } });
  if (!item?.filePath) return NextResponse.json({ error: "File not found." }, { status: 404 });
  const isLibrary = item.filePath.startsWith("library:"); const root = isLibrary ? process.env.LIBRARY_DIR : process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
  const relative = isLibrary ? item.filePath.slice("library:".length) : item.filePath;
  const resolved = path.resolve(root || "", relative); if (!root || !resolved.startsWith(path.resolve(root) + path.sep)) return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  try { const file = await readFile(resolved); await db.auditLog.create({ data: { userId: user.id, action: "file.opened", detail: item.id } }); return new NextResponse(file, { headers: { "Content-Type": item.mimeType || "application/octet-stream", "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(item.title)}`, "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "The original file is no longer available." }, { status: 404 }); }
}
