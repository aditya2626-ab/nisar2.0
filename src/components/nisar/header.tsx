'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radar } from 'lucide-react';
import { missionTelemetry } from '@/lib/nisar/model';

const NAV = [
  { href: '#observatory', label: 'Observatory' },
  { href: '#science', label: 'The Science' },
  { href: '#mission', label: 'Mission' },
  { href: '#data', label: 'Data' },
];

export function Header() {
  const [tel, setTel] = useState(() => missionTelemetry());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let alive = true;
    // one asynchronous tick after mount, then a steady cadence
    const t0 = setTimeout(() => {
      if (!alive) return;
      setTel(missionTelemetry());
      setMounted(true);
    }, 0);
    const id = setInterval(() => {
      if (alive) setTel(missionTelemetry());
    }, 30_000);
    return () => {
      alive = false;
      clearTimeout(t0);
      clearInterval(id);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href="#" className="flex items-center gap-2.5 shrink-0 group">
          <span className="grid place-items-center size-8 rounded-lg bg-primary/15 border border-primary/30 text-primary">
            <Radar className="size-4.5" aria-hidden />
          </span>
          <span className="font-semibold tracking-tight text-[15px]">
            NISAR<span className="text-primary"> PULSE</span>
          </span>
          <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground border border-border rounded-full px-2 py-0.5">
            NASA × ISRO
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6 text-sm" aria-label="Sections">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden sm:flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full size-2 bg-primary" />
          </span>
          <span title="Mission elapsed time">{mounted ? tel.metLabel : 'T+ —'}</span>
          <span className="text-border" aria-hidden>/</span>
          <span title="Orbit number">{mounted ? `ORB ${tel.orbitNo.toLocaleString('en-US')}` : 'ORB —'}</span>
        </div>
      </div>
    </header>
  );
}
