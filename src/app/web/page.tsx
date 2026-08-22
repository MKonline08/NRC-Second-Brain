"use client";

import { ArrowLeft, ExternalLink, Globe2, RefreshCw, X } from "lucide-react";
import { FormEvent, useState } from "react";

function normalizeAddress(value: string) {
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  const address = new URL(candidate);
  if (address.protocol !== "https:" && address.protocol !== "http:") throw new Error("Use a normal website address.");
  return address.toString();
}

export default function WebPage() {
  const [address, setAddress] = useState("https://drive.google.com");
  const [activeAddress, setActiveAddress] = useState("https://drive.google.com");
  const [message, setMessage] = useState("");
  const [frameKey, setFrameKey] = useState(0);

  function visit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const nextAddress = normalizeAddress(address.trim());
      setAddress(nextAddress);
      setActiveAddress(nextAddress);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "That address could not be opened.");
    }
  }

  return <main className="web-page">
    <header className="web-toolbar">
      <a href="/" className="icon-button" aria-label="Close web view"><X size={18} /></a>
      <div className="web-title"><Globe2 size={17} /><span>Web</span></div>
      <form onSubmit={visit} className="web-address"><input value={address} onChange={(event) => setAddress(event.target.value)} aria-label="Website address" /><button className="icon-button" type="submit" aria-label="Open address"><ArrowLeft size={16} /></button></form>
      <button className="icon-button" onClick={() => setFrameKey((value) => value + 1)} aria-label="Reload page"><RefreshCw size={16} /></button>
      <a className="icon-button" href={activeAddress} target="_blank" rel="noreferrer" aria-label="Open in a new tab"><ExternalLink size={16} /></a>
    </header>
    {message && <p className="web-message">{message}</p>}
    <iframe key={frameKey} className="web-frame" title="NRC web view" src={activeAddress} />
    <p className="web-note">Some sites, including Google Drive, choose not to appear inside other apps. Use the open-in-new-tab button for those sites.</p>
  </main>;
}

