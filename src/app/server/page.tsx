"use client";

import { Activity, ArrowLeft, Cpu, HardDrive, MemoryStick, RefreshCw, Server } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Status = {
  cpu: { percent: number; cores: number };
  memory: { total: number; used: number };
  storage: { path: string; total: number; used: number };
  hostname: string;
  uptime: number;
  updatedAt: string;
};

function gibibytes(bytes: number) {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function duration(seconds: number) {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  return days ? `${days}d ${hours}h` : `${hours}h`;
}

function Meter({ label, value, total, icon: Icon, detail }: {
  label: string;
  value: number;
  total: number;
  icon: typeof Cpu;
  detail: string;
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return <article className="server-metric">
    <div className="server-metric-head"><span className="server-icon"><Icon size={19} /></span><strong>{label}</strong><b>{percent}%</b></div>
    <div className="meter"><span style={{ width: `${percent}%` }} /></div>
    <p>{detail}</p>
  </article>;
}

export default function ServerPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState("Loading live server data...");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/server/status", { cache: "no-store" });
    if (!response.ok) {
      setMessage("The server monitor could not load. Sign in again and refresh this page.");
      return;
    }
    setStatus(await response.json() as Status);
    setMessage("");
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const memoryPercent = status ? Math.round((status.memory.used / status.memory.total) * 100) : 0;
  const storagePercent = status ? Math.round((status.storage.used / status.storage.total) * 100) : 0;

  return <main className="server-page">
    <header className="server-header">
      <a href="/" className="back-link"><ArrowLeft size={15} /> Close monitor</a>
      <div><span className="live-dot" /> LIVE</div>
      <button className="icon-button" onClick={() => void refresh()} aria-label="Refresh server data"><RefreshCw size={16} /></button>
    </header>
    <section className="server-content">
      <p className="eyebrow">CASAOS ON DEBIAN</p>
      <h1>Your server, at a glance.</h1>
      <p className="server-intro">A private live view from the machine running NRC Second Brain.</p>

      {status ? <>
        <div className="server-summary"><Server size={20} /><span><strong>{status.hostname}</strong><small>Online for {duration(status.uptime)} · {status.cpu.cores} CPU cores</small></span><time>Updated {new Date(status.updatedAt).toLocaleTimeString()}</time></div>
        <div className="server-grid">
          <Meter label="CPU" value={status.cpu.percent} total={100} icon={Cpu} detail={`${status.cpu.percent}% in use`} />
          <Meter label="Memory" value={status.memory.used} total={status.memory.total} icon={MemoryStick} detail={`${gibibytes(status.memory.used)} of ${gibibytes(status.memory.total)}`} />
          <Meter label="Storage" value={status.storage.used} total={status.storage.total} icon={HardDrive} detail={`${gibibytes(status.storage.used)} of ${gibibytes(status.storage.total)}`} />
        </div>
        <div className="server-note"><Activity size={17} /><span>Storage is measured from <code>{status.storage.path}</code>, the folder NRC can read on your server.</span></div>
      </> : <div className="server-loading"><Activity size={20} /><span>{message}</span></div>}
    </section>
  </main>;
}

