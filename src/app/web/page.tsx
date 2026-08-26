"use client";

import { ExternalLink, Globe2, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function WebPage() {
  const [chromiumUrl, setChromiumUrl] = useState("");
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    setChromiumUrl(`${window.location.origin}/chrome/`);
  }, []);

  return <main className="web-page">
    <header className="web-toolbar">
      <a href="/" className="icon-button" aria-label="Close browser"><X size={18} /></a>
      <div className="web-title"><Globe2 size={17} /><span>Chromium</span></div>
      <p className="web-status">Your private server browser</p>
      <button className="icon-button" onClick={() => setFrameKey((value) => value + 1)} aria-label="Reload Chromium"><RefreshCw size={16} /></button>
      {chromiumUrl && <a className="icon-button" href={chromiumUrl} target="_blank" rel="noreferrer" aria-label="Open Chromium in a separate tab"><ExternalLink size={16} /></a>}
    </header>
    {chromiumUrl ? <iframe key={frameKey} className="web-frame" title="Private Chromium browser" src={chromiumUrl} allow="clipboard-read; clipboard-write; fullscreen; autoplay; microphone; gamepad" allowFullScreen /> : <div className="web-loading">Connecting to your private Chromium browser...</div>}
    <p className="web-note">Your browsing profile is stored privately on your server. Use the expand control in Chromium for fullscreen.</p>
  </main>;
}

