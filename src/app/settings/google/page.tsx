"use client";

import { ArrowLeft, Cloud, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function GoogleSettingsPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setMessage(search.get("connected") ? "Google Drive is connected." : search.get("error") || "");
  }, []);

  async function sync() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/integrations/google/sync", { method: "POST" });
    const data = await response.json();
    setBusy(false);
    setMessage(response.ok ? `${data.added} Google Drive files added to your Personal workspace.` : data.error);
  }

  return <main className="auth-page">
    <section className="auth-card google-card">
      <a href="/settings" className="back-link"><ArrowLeft size={15} /> Back to settings</a>
      <div className="auth-mark"><Cloud size={22} /></div>
      <p className="eyebrow">GOOGLE DRIVE</p>
      <h1>Connect your Drive.</h1>
      <p className="auth-copy">NRC saves private shortcuts to your Drive files in your Personal workspace. Your Google files stay in Google Drive.</p>

      <ol className="connection-steps">
        <li>Set up your Playit domain with HTTPS.</li>
        <li>In Google Cloud, add <code>https://your-domain/api/integrations/google/callback</code> as the redirect address.</li>
        <li>Add the matching domain, Google client ID, and client secret to your server settings.</li>
      </ol>

      <a className="primary-button auth-submit" href="/api/integrations/google/connect"><Cloud size={16} />Connect Google Drive</a>
      <button className="tool-button full-button" onClick={() => void sync()} disabled={busy}><RefreshCw size={16} />{busy ? "Syncing..." : "Sync Drive files"}</button>
      {message && <p className="connection-message">{message}</p>}
      <p className="auth-safety">Google does not allow the local CasaOS address, such as 192.168.x.x, for Drive sign-in. Use your secure public domain here.</p>
    </section>
  </main>;
}

