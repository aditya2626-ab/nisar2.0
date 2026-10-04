'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Database, ShieldCheck, GitBranch, Satellite } from 'lucide-react';

const PORTALS = [
  {
    name: 'ASF DAAC — Vertex',
    org: 'NASA · Alaska Satellite Facility',
    href: 'https://search.asf.alaska.edu/',
    desc: 'Browse and download NISAR L1/L2 products (SLC, GCOV, GSLC) over the Americas and the world; Vertex handles InSAR-ready pairs.',
  },
  {
    name: 'Bhoonidhi',
    org: 'ISRO · NRSC',
    href: 'https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html',
    desc: 'ISRO’s open data portal for NISAR products and Indian remote-sensing archives.',
  },
  {
    name: 'NISAR mission site',
    org: 'NASA / JPL',
    href: 'https://nisar.jpl.nasa.gov/',
    desc: 'Mission overview, news, first images and the science roadmap.',
  },
];

const PIPELINE = [
  'Pull L-band SLC pairs for your site & cycle from ASF Vertex',
  'Coregister + form interferograms (ISCE2, ARIA-tools, SARvey or GAMMA)',
  'Unwrap, geocode, export displacement GeoTIFFs',
  'Replace the simulated models in src/lib/nisar/ — the UI already speaks “cm LOS per 12-day cycle”',
];

export function DataAccess() {
  return (
    <section id="data" className="scroll-mt-16 border-t border-border/60 bg-secondary/20 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-primary">
            <Database className="size-3.5" aria-hidden />
            Data &amp; sources
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Real rates, honest simulations, an open road to real data
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            NISAR’s full science dataset is free to everyone — this app is built to graduate from
            representative simulations to live mission products the moment you point it at real
            interferograms.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {/* portals */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-border bg-card p-5 md:p-6"
          >
            <div className="flex items-center gap-2">
              <Satellite className="size-4 text-primary" aria-hidden />
              <h3 className="font-semibold">Get the real data</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {PORTALS.map((p) => (
                <li key={p.name}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {p.name}
                        <ExternalLink className="size-3 opacity-50 transition-opacity group-hover:opacity-90" aria-hidden />
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {p.org}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* integrity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="rounded-xl border border-border bg-card p-5 md:p-6"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              <h3 className="font-semibold">What’s real / what’s simulated</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400">
                  Real
                </div>
                <p className="mt-1 text-muted-foreground">
                  Mission parameters (orbit, bands, swath, cycle, launch). Site selection, published
                  deformation &amp; coherence rates, event chronology and every narrative claim — all
                  traceable to the sources cited on each site card.
                </p>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-400">
                  Simulated
                </div>
                <p className="mt-1 text-muted-foreground">
                  Per-cycle time series and interferogram imagery — deterministic models calibrated
                  to those published rates, rendered in-browser (fringe display exaggeration ×4).
                  They demonstrate the product chain, not raw measurements.
                </p>
              </div>
            </div>
          </motion.div>

          {/* upgrade path */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="rounded-xl border border-border bg-card p-5 md:p-6"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-primary" aria-hidden />
              <h3 className="font-semibold">Swap in real NISAR products</h3>
            </div>
            <ol className="mt-4 space-y-2.5">
              {PIPELINE.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-primary/40 font-mono text-[10px] text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-border/60 pt-4">
              {['Next.js 16', 'Leaflet', 'Recharts', 'Canvas 2D InSAR engine', '/api/sites', '/api/telemetry'].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border/70 bg-secondary/50 px-2 py-1 font-mono text-[10px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
