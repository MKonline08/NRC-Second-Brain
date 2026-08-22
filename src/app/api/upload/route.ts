import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";

const maxUploadSize = 30 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "text/plain", "text/markdown", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  const forbidden = requireSameOrigin(request); if (forbidden) return forbidden;
  const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file first." }, { status: 400 });
  if (file.size > maxUploadSize) return NextResponse.json({ error: "Files must be 30 MB or smaller." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "That file type is not allowed yet." }, { status: 400 });
  const workspace = await db.workspace.findFirst({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" } });
  if (!workspace) return NextResponse.json({ error: "No workspace is available." }, { status: 400 });
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"); await mkdir(uploadDir, { recursive: true });
  const extension = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, ""); const storedName = `${randomUUID()}${extension}`;
  await writeFile(path.join(uploadDir, storedName), Buffer.from(await file.arrayBuffer()));
  const item = await db.brainItem.create({ data: { title: String(form.get("title") || file.name).slice(0, 120), type: "file", filePath: storedName, mimeType: file.type, size: file.size, x: Number(form.get("x") || 50), y: Number(form.get("y") || 50), color: "blue", tags: ["Upload"], workspaceId: workspace.id } });
  await db.auditLog.create({ data: { userId: user.id, action: "file.uploaded", detail: item.id } });
  return NextResponse.json({ item }, { status: 201 });
}
