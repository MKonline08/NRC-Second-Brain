"use client";

import { ArrowLeft, Laptop, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = { id: string; userAgent: string | null; ipAddress: string | null; createdAt: string; lastSeenAt: string; expiresAt: string };
export default function SessionsPage() {
  const router = useRouter(); const [sessions, setSessions] = useState<Session[]>([]); const [currentId, setCurrentId] = useState("");
  async function load() { const response = await fetch("/api/sessions"); if (response.status === 401) { router.replace("/login"); return; } const data = await response.json(); setSessions(data.sessions); setCurrentId(data.currentId); }
  useEffect(() => { void load(); }, []);
  async function revoke(id: string) { await fetch(`/api/sessions?id=${encodeURIComponent(id)}`, { method: "DELETE" }); if (id === currentId) router.replace("/login"); else await load(); }
  return <main className="settings-page"><header className="settings-header"><a href="/settings" className="back-link"><ArrowLeft size={15} /> Settings</a><span>Device sessions</span></header><section className="settings-content"><p className="eyebrow">ACCOUNT SECURITY</p><h1>Your signed-in devices.</h1><p className="settings-intro">Remove a device you do not recognize or no longer use. The current session is marked below.</p><div className="session-list">{sessions.map((session) => <article key={session.id} className="session-card"><Laptop size={20} /><div><strong>{session.id === currentId ? "This device" : "Signed-in device"}</strong><p>{session.userAgent || "Browser details unavailable"}</p><small>Last seen {new Date(session.lastSeenAt).toLocaleString()} · Expires {new Date(session.expiresAt).toLocaleDateString()}</small></div><button className="tool-button" onClick={() => void revoke(session.id)}><LogOut size={15} />Sign out</button></article>)}{sessions.length === 0 && <p className="settings-intro">No active sessions found.</p>}</div></section></main>;
}
