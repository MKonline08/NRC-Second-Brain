import bcrypt from "bcryptjs";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { signingSecret } from "@/lib/auth";

const cookieName = (token: string) => `nrc_share_${token}`;

export async function resolveShare(token: string, password?: string | null, authorized = false) { const share = await db.shareLink.findUnique({ where: { token }, include: { item: true } }); if (!share || share.item.deletedAt || (share.expiresAt && share.expiresAt <= new Date())) return { error: "This share link is no longer available." as const }; if (share.passwordHash && !authorized && !(password && await bcrypt.compare(password, share.passwordHash))) return { protected: true as const }; return { share, item: share.item }; }
export async function createShareAccess(token: string) { const value = await new SignJWT({ token }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(signingSecret()); (await cookies()).set(cookieName(token), value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: `/share/${token}`, maxAge: 7200 }); }
export async function hasShareAccess(token: string) { const value = (await cookies()).get(cookieName(token))?.value; if (!value) return false; try { return (await jwtVerify(value, signingSecret())).payload.token === token; } catch { return false; } }
export async function readSharedFile(filePath: string) { const isLibrary = filePath.startsWith("library:"); const root = isLibrary ? process.env.LIBRARY_DIR : process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"); const relative = isLibrary ? filePath.slice("library:".length) : filePath; const resolved = path.resolve(root || "", relative); if (!root || !resolved.startsWith(path.resolve(root) + path.sep)) throw new Error("Invalid file path."); return readFile(resolved); }
