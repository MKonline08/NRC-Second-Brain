import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { decrypt, encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { requireSameOrigin } from "@/lib/security";
const noteSchema=z.object({title:z.string().trim().min(1).max(120),content:z.string().max(20000)});
export async function GET(){const user=await getSession();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const notes=await db.vaultNote.findMany({where:{userId:user.id},orderBy:{updatedAt:"desc"}});return NextResponse.json({notes:notes.map((note: { encrypted: string })=>({...note,content:decrypt(note.encrypted),encrypted:undefined}))});}
export async function POST(request:NextRequest){const forbidden=requireSameOrigin(request);if(forbidden)return forbidden;const user=await getSession();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=noteSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Add a title and note."},{status:400});const note=await db.vaultNote.create({data:{title:parsed.data.title,encrypted:encrypt(parsed.data.content),userId:user.id}});await db.auditLog.create({data:{userId:user.id,action:"vault_note.created",detail:note.id}});return NextResponse.json({note:{...note,content:parsed.data.content,encrypted:undefined}},{status:201});}
