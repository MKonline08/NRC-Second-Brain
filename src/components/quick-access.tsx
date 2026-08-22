"use client";

import { Globe2, Server } from "lucide-react";
import { usePathname } from "next/navigation";

export function QuickAccess() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return <nav className="quick-access" aria-label="Quick tools">
    <a href="/web"><Globe2 size={16} />Web</a>
    <a href="/server"><Server size={16} />Server</a>
  </nav>;
}

