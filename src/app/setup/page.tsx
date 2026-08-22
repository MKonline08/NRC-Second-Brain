"use client";

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [checking, setChecking] = useState(true);
  useEffect(() => { fetch("/api/setup").then((response) => response.json()).then((data) => { if (data.complete) router.replace("/login"); else setChecking(false); }).catch(() => setChecking(false)); }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) }); const body = await response.json(); if (!response.ok) { setError(body.error); setLoading(false); return; } router.replace("/"); }
  if (checking) return null;
  return <main className="auth-page"><section className="auth-card"><div className="auth-mark">N</div><p className="eyebrow">NRC SECOND BRAIN</p><h1>Set up your private universe.</h1><p className="auth-copy">Create the one account that controls this server. Your files stay on your own CasaOS machine.</p><form onSubmit={submit} className="auth-form"><label>Your name<input name="name" required minLength={2} maxLength={60} placeholder="MK" /></label><label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label><label>Strong password<input name="password" required type="password" minLength={12} placeholder="At least 12 characters" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Creating your universe..." : <>Create private workspace <ArrowRight size={17} /></>}</button></form><div className="auth-safety"><ShieldCheck size={16} /><span>Passwords are stored securely. Your uploads will not be public.</span></div></section></main>;
}
