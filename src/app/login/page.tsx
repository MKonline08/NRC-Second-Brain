"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), code: form.get("code") || undefined }) }); const body = await response.json(); if (!response.ok) { setError(body.error); setLoading(false); return; } router.replace("/"); }
  return <main className="auth-page"><section className="auth-card"><div className="auth-mark"><LockKeyhole size={22} /></div><p className="eyebrow">NRC SECOND BRAIN</p><h1>Welcome back.</h1><p className="auth-copy">Sign in to open your private universe.</p><form onSubmit={submit} className="auth-form"><label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label><label>Password<input name="password" required type="password" placeholder="Your password" /></label><label>Authenticator code <span className="optional">Optional unless you enabled two-factor security</span><input name="code" inputMode="numeric" pattern="[0-9]{6}" placeholder="Six-digit code" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Signing in..." : <>Open second brain <ArrowRight size={17} /></>}</button></form></section></main>;
}
