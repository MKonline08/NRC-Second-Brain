"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; title: string; type: string; deletedAt: string; workspace: { name: string } };
export default function TrashPage() {
  const router = useRouter(); const [items, setItems] = useState<Item[]>([]);
  async function load() { const session = await fetch("/api/session").then((response) => response.json()); if (!session.user) { router.replace(session.setupComplete ? "/login" : "/setup"); return; } const data = await fetch("/api/trash").then((response) => response.json()); setItems(data.items || []); }
  useEffect(() => { void load(); }, []);
  async function restore(id: string) { await fetch(`/api/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); await load(); }
  return <main className="settings-page"><header className="settings-header"><a href="/" className="back-link">NRC Second Brain</a><span>Recoverable trash</span></header><section className="settings-content"><p className="eyebrow">TRASH</p><h1>Nothing is gone by accident.</h1><p className="settings-intro">Restore deleted items whenever you need them. Files remain on your server until you choose a future permanent-cleanup policy.</p><div className="shares-list">{items.map((item) => <div key={item.id}><Trash2 size={16} /><span><strong>{item.title}</strong><small>{item.type} · {item.workspace.name} · Deleted {new Date(item.deletedAt).toLocaleString()}</small></span><button className="tool-button" onClick={() => void restore(item.id)}><RotateCcw size={15} />Restore</button></div>)}{items.length === 0 && <div className="study-empty"><Trash2 size={25} /><strong>Trash is empty.</strong><span>Deleted items will appear here.</span></div>}</div></section></main>;
}
