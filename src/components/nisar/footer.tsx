'use client';

import Link from 'next/link';
import { Radar } from 'lucide-react';

const LINKS = [
  { href: 'https://nisar.jpl.nasa.gov/', label: 'NISAR · NASA/JPL' },
  { href: 'https://www.isro.gov.in/', label: 'ISRO' },
  { href: 'https://search.asf.alaska.edu/', label: 'ASF Vertex' },
  { href: 'https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html', label: 'Bhoonidhi' },
  { href: 'https://spaceappschallenge.org/', label: 'NASA Space Apps' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/15 border border-primary/30 text-primary">
                <Radar className="size-4.5" aria-hidden />
              </span>
              <span className="font-semibold tracking-tight">
                NISAR<span className="text-primary"> PULSE</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              An interactive atlas of Earth&apos;s changing surface, built for the radar
              remote-sensing challenge brief: track and visualise surface change with NISAR at
              locations around the world. Representative simulated InSAR products — see Data &amp;
              sources for what&apos;s real.
            </p>
          </div>

          <nav aria-label="External resources" className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              External resources
            </span>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">This observatory</span>
            <Link href="#observatory" className="transition-colors hover:text-primary">
              Observatory
            </Link>
            <Link href="#science" className="transition-colors hover:text-primary">
              The science of InSAR
            </Link>
            <Link href="#mission" className="transition-colors hover:text-primary">
              Mission facts
            </Link>
            <Link href="#data" className="transition-colors hover:text-primary">
              Data &amp; sources
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border/60 pt-5 font-mono text-[10.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Imagery © Esri, Maxar · Basemap labels © OpenStreetMap contributors, © CARTO
          </span>
          <span>L-band λ 23.8 cm · S-band λ 9.4 cm · 12-day repeat · 242 km swath</span>
        </div>
      </div>
    </footer>
  );
}
