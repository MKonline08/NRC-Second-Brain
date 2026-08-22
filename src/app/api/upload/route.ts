import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";
import { extractOfficeText } from "@/lib/office-text";

const maxUploadSize = 30 * 1024 * 1024;
const maxIndexedCharacters = 40_000;
const allowedExtensions = new Set([".pdf", ".txt", ".md", ".docx", ".pptx", ".jpg", ".jpeg", ".png", ".webp"]);
function hasPrefix(bytes: Buffer, values: number[]) { return values.every((value, index) => bytes[index] === value); }
function looksLikeAllowedFile(extension: string, bytes: Buffer) { if (extension === ".pdf") return bytes.subarray(0, 5).toString("ascii") === "%PDF-"; if (extension === ".jpg" || extension === ".jpeg") return hasPrefix(bytes, [0xff, 0xd8, 0xff]); if (extension === ".png") return hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47]); if (extension === ".webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP"; if (extension === ".docx" || extension === ".pptx") return hasPrefix(bytes, [0x50, 0x4b, 0x03, 0x04]); return !bytes.subarray(0, Math.min(bytes.length, 4096)).includes(0); }

export async function POST(request: NextRequest) {
  const forbidden = requireSameOrigin(request); if (forbidden) return forbidden;
  const user = await getSession(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file first." }, { status: 400 });
  if (file.size > maxUploadSize) return NextResponse.json({ error: "Files must be 30 MB or smaller." }, { status: 400 });
  const extension = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
  if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "That file type is not allowed yet." }, { status: 400 });
  const requestedWorkspaceId = String(form.get("workspaceId") || "");
  const workspace = requestedWorkspaceId ? await db.workspace.findFirst({ where: { id: requestedWorkspaceId, ownerId: user.id } }) : await db.workspace.findFirst({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" } });
  if (!workspace) return NextResponse.json({ error: "No workspace is available." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!looksLikeAllowedFile(extension, bytes)) return NextResponse.json({ error: "The file contents do not match its allowed type." }, { status: 400 });
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"); await mkdir(uploadDir, { recursive: true });
  const storedName = `${randomUUID()}${extension}`;
  await writeFile(path.join(/* turbopackIgnore: true */ uploadDir, storedName), bytes);
  const isText = file.type === "text/plain" || file.type === "text/markdown" || extension === ".txt" || extension === ".md";
  const extracted = isText ? bytes.toString("utf8").replace(/\u0000/g, "") : extractOfficeText(bytes, extension);
  const description = extracted ? extracted.slice(0, maxIndexedCharacters) : undefined;
  const tags = description ? ["Upload", "Text indexed"] : ["Upload"];
  const item = await db.brainItem.create({ data: { title: String(form.get("title") || file.name).slice(0, 120), type: "file", filePath: storedName, mimeType: file.type, size: file.size, description, x: Number(form.get("x") || 50), y: Number(form.get("y") || 50), color: "blue", tags, workspaceId: workspace.id } });
  await db.auditLog.create({ data: { userId: user.id, action: "file.uploaded", detail: item.id } });
  return NextResponse.json({ item }, { status: 201 });
}
