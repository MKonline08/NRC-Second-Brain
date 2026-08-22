import os from "node:os";
import { statfsSync } from "node:fs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

type CpuSnapshot = { idle: number; total: number };

function cpuSnapshot(): CpuSnapshot {
  return os.cpus().reduce((snapshot, core) => {
    const values = Object.values(core.times);
    snapshot.idle += core.times.idle;
    snapshot.total += values.reduce((sum, value) => sum + value, 0);
    return snapshot;
  }, { idle: 0, total: 0 });
}

let previousCpu = cpuSnapshot();

function cpuPercent() {
  const nextCpu = cpuSnapshot();
  const totalDelta = nextCpu.total - previousCpu.total;
  const idleDelta = nextCpu.idle - previousCpu.idle;
  previousCpu = nextCpu;
  if (totalDelta <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((1 - idleDelta / totalDelta) * 100)));
}

function storage() {
  const path = process.env.LIBRARY_DIR || "/app/data/uploads";
  const info = statfsSync(path);
  const total = Number(info.blocks) * Number(info.bsize);
  const available = Number(info.bavail) * Number(info.bsize);
  return { path, total, used: total - available };
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  return NextResponse.json({
    cpu: { percent: cpuPercent(), cores: os.cpus().length },
    memory: { total: totalMemory, used: totalMemory - freeMemory },
    storage: storage(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    updatedAt: new Date().toISOString(),
  });
}

