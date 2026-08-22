import bcrypt from "bcryptjs";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function resolveShare(token: string, password?: string | null) { const share = await db.shareLink.findUnique({ where: { token }, include: { item: true } }); if (!share || share.item.deletedAt || (share.expiresAt && share.expiresAt <= new Date())) return { error: "This share link is no longer available." as const }; if (share.passwordHash && !(password && await bcrypt.compare(password, share.passwordHash))) return { protected: true as const }; return { share, item: share.item }; }
export async function readSharedFile(filePath: string) { const isLibrary = filePath.startsWith("library:"); const root = isLibrary ? process.env.LIBRARY_DIR : process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"); const relative = isLibrary ? filePath.slice("library:".length) : filePath; const resolved = path.resolve(root || "", relative); if (!root || !resolved.startsWith(path.resolve(root) + path.sep)) throw new Error("Invalid file path."); return readFile(resolved); }
