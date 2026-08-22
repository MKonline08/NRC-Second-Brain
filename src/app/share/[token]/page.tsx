"use client";

import { FileText, LockKeyhole, ExternalLink } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type SharedItem = { id: string; title: string; type: string; description: string | null; url: string | null; hasFile: boolean };
export default function SharedItemPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState(""); const [password, setPassword] = useState(""); const [item, setItem] = useState<SharedItem | null>(null); const [needsPassword, setNeedsPassword] = useState(false); const [error, setError] = useState("");
  useEffect(() => { void params.then(({ token: value }) => { setToken(value); void load(value); }); }, [params]);
  async function load(value = token, supplied = password) { const response = await fetch(`/api/share/${value}${supplied ? `?password=${encodeURIComponent(supplied)}` : ""}`); const data = await response.json(); if (response.status === 401) { setNeedsPassword(true); return; } if (!response.ok) { setError(data.error); return; } setItem(data.item); setNeedsPassword(false); }
  function submit(event: FormEvent) { event.preventDefault(); void load(); }
  return <main className="share-page"><section className="share-card">{item ? <><div className="auth-mark"><FileText size={22} /></div><p className="eyebrow">SHARED WITH YOU</p><h1>{item.title}</h1><p className="auth-copy">{item.description || "A private item shared from NRC Second Brain."}</p>{item.hasFile && <a className="primary-button auth-submit" href={`/api/share/${token}/file${password ? `?password=${encodeURIComponent(password)}` : ""}`} target="_blank" rel="noreferrer"><ExternalLink size={16} />Open shared file</a>}{item.url && <a className="tool-button full-button" href={item.url} target="_blank" rel="noreferrer">Open linked resource</a>}</> : needsPassword ? <><div className="auth-mark"><LockKeyhole size={22} /></div><p className="eyebrow">PROTECTED SHARE</p><h1>Enter the share password.</h1><form onSubmit={submit} className="auth-form"><label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></label><button className="primary-button auth-submit">Open shared item</button></form></> : <><p className="eyebrow">NRC SECOND BRAIN</p><h1>{error || "Opening share..."}</h1></>}</section></main>;
}
