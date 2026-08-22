"use client";

import { CheckCircle2, Cloud, Code2, FolderCog, History, Laptop, LockKeyhole, RefreshCw, Server, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Connection = { accountLabel: string | null; lastSyncedAt: string | null } | null;

export default function SettingsPage() {
  const router = useRouter();
  const [connection, setConnection] = useState<Connection>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const session = await fetch("/api/session").then((response) => response.json());
    if (!session.user) { router.replace(session.setupComplete ? "/login" : "/setup"); return; }
    const data = await fetch("/api/integrations/github").then((response) => response.json());
    setConnection(data.integration);
  }
  useEffect(() => { void refresh(); }, []);

  async function connect(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/integrations/github", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(data.error); return; }
    setToken(""); setMessage(`Connected to ${data.accountLabel}.`); await refresh();
  }
  async function sync() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/integrations/github/sync", { method: "POST" });
    const data = await response.json(); setBusy(false);
    setMessage(response.ok ? `${data.added} repositories added to Projects.` : data.error); await refresh();
  }

  return <main className="settings-page"><header className="settings-header"><a href="/" className="back-link">NRC Second Brain</a><span>Created by MK</span></header><section className="settings-content"><p className="eyebrow">PRIVATE SETTINGS</p><h1>Connections and server controls.</h1><p className="settings-intro">Connections stay on your own server. Credentials are encrypted before they are saved.</p><div className="settings-grid"><article className="settings-panel"><div className="settings-title"><Code2 size={21} /><div><h2>GitHub</h2><p>{connection ? `Connected as ${connection.accountLabel}` : "Bring repositories into Projects"}</p></div></div>{connection ? <><div className="connection-state"><CheckCircle2 size={16} />Connected{connection.lastSyncedAt && ` · Last sync ${new Date(connection.lastSyncedAt).toLocaleString()}`}</div><button className="primary-button" onClick={() => void sync()} disabled={busy}><RefreshCw size={16} />{busy ? "Syncing..." : "Sync repositories"}</button></> : <form onSubmit={connect} className="connection-form"><label>Fine-grained personal access token<input value={token} onChange={(event) => setToken(event.target.value)} type="password" required placeholder="github_pat_..." /></label><button className="primary-button" disabled={busy}><Code2 size={16} />{busy ? "Connecting..." : "Connect GitHub"}</button></form>}{message && <p className="connection-message">{message}</p>}</article><a className="settings-panel settings-link" href="/settings/google"><div className="settings-title"><Cloud size={21} /><div><h2>Google Drive</h2><p>Connect files and documents from your Drive</p></div></div></a><a className="settings-panel settings-link" href="/settings/security"><div className="settings-title"><ShieldCheck size={21} /><div><h2>Security</h2><p>Two-factor sign-in and recovery protection</p></div></div></a><a className="settings-panel settings-link" href="/settings/sessions"><div className="settings-title"><Laptop size={21} /><div><h2>Devices</h2><p>Review and revoke signed-in sessions</p></div></div></a><a className="settings-panel settings-link" href="/settings/audit"><div className="settings-title"><History size={21} /><div><h2>Activity</h2><p>See changes made in your private space</p></div></div></a><a className="settings-panel settings-link" href="/workspaces"><div className="settings-title"><FolderCog size={21} /><div><h2>Workspaces</h2><p>Organize school, personal, and project spaces</p></div></div></a><article className="settings-panel"><div className="settings-title"><Server size={21} /><div><h2>Server library</h2><p>Read-only scan from a mounted CasaOS folder</p></div></div><p className="panel-copy">Choose the folder in docker-compose.yml, then use Scan server in your main workspace. Original files are never changed.</p></article><article className="settings-panel"><div className="settings-title"><LockKeyhole size={21} /><div><h2>Private by default</h2><p>Vault notes and connection credentials are encrypted</p></div></div></article></div></section></main>;
}
