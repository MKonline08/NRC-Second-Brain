"use client";

import { ArrowLeft, Cloud, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function GoogleSettingsPage() {
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { const search = new URLSearchParams(window.location.search); setMessage(search.get("connected") ? "Google Drive is connected." : search.get("error") || ""); }, []);
  async function sync() { setBusy(true); setMessage(""); const response = await fetch("/api/integrations/google/sync", { method: "POST" }); const data = await response.json(); setBusy(false); setMessage(response.ok ? `${data.added} Google Drive files added to your Personal workspace.` : data.error); }
  return <main className="auth-page"><section className="auth-card"><a href="/settings" className="back-link"><ArrowLeft size={15} /> Back to settings</a><div className="auth-mark"><Cloud size={22} /></div><p className="eyebrow">GOOGLE DRIVE</p><h1>Connect your Drive.</h1><p className="auth-copy">NRC can import your Drive file names and private shortcuts into your Personal workspace. It does not copy your Google files onto the server.</p><a className="primary-button auth-submit" href="/api/integrations/google/connect"><Cloud size={16} />Connect Google Drive</a><button className="tool-button full-button" onClick={() => void sync()} disabled={busy}><RefreshCw size={16} />{busy ? "Syncing..." : "Sync Drive files"}</button>{message && <p className="connection-message">{message}</p>}<p className="auth-safety">Before connecting, set the Google client ID, client secret, and public domain in your server `.env` file.</p></section></main>;
}
