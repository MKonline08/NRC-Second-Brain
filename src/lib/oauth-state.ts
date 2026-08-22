import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "development-only-change-this-secret");
export async function createOAuthState(userId: string) { return new SignJWT({ userId, type: "google-drive" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(secret); }
export async function readOAuthState(value: string) { const payload = (await jwtVerify(value, secret)).payload; if (payload.type !== "google-drive" || typeof payload.userId !== "string") throw new Error("Invalid sign-in state."); return payload.userId; }
