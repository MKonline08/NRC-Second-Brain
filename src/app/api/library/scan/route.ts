import { readdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";

const supported = new Set([".pdf", ".txt", ".md", ".docx", ".pptx", ".jpg", ".jpeg", ".png", ".webp"]);
async function collect(root: string, current = root, files: string[] = []) { if (files.length >= 2000) return files; for (const entry of await readdir(current, { withFileTypes: true })) { const full = path.join(current, entry.name); if (entry.isDirectory()) await collect(root, full, files); else if (supported.has(path.extname(entry.name).toLowerCase())) files.push(path.relative(root, full)); if (files.length >= 2000) break; } return files; }

export async function POST(request: NextRequest) {
  const forbidden = requireSameOrigin(request); if (forbidden) return forbidden;
  const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const libraryDir = process.env.LIBRARY_DIR; if (!libraryDir) return NextResponse.json({ error: "No server library folder is connected yet. Set LIBRARY_DIR and mount that folder in CasaOS." }, { status: 400 });
  try { const files = await collect(libraryDir); const workspace = await db.workspace.findFirst({ where: { ownerId: user.id, name: "Personal" } }) ?? await db.workspace.findFirst({ where: { ownerId: user.id } }); if (!workspace) return NextResponse.json({ error: "No workspace is available." }, { status: 400 }); let imported = 0; for (const relativePath of files) { const filePath = `library:${relativePath.replaceAll("\\", "/")}`; const exists = await db.brainItem.findFirst({ where: { workspaceId: workspace.id, filePath } }); if (!exists) { await db.brainItem.create({ data: { title: path.basename(relativePath), type: "file", filePath, color: "violet", x: 10 + ((imported * 17) % 75), y: 12 + ((imported * 11) % 76), tags: ["Server library"], workspaceId: workspace.id } }); imported += 1; } } await db.auditLog.create({ data: { userId: user.id, action: "library.scanned", detail: `${imported} files imported` } }); return NextResponse.json({ imported, scanned: files.length }); } catch { return NextResponse.json({ error: "The connected library folder could not be read. Check the CasaOS mount path." }, { status: 500 }); }
}
