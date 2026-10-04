'use client';

import { motion } from 'framer-motion';
import {
  Rocket,
  Orbit,
  Repeat,
  MoveHorizontal,
  Radio,
  Antenna,
  Weight,
  Database,
  Handshake,
} from 'lucide-react';

const FACTS = [
  {
    icon: Rocket,
    k: 'Launch',
    v: '30 July 2025 · GSLV-F16',
    d: 'Satish Dhawan Space Centre, Sriharikota, India',
  },
  {
    icon: Orbit,
    k: 'Orbit',
    v: '≈ 747 km sun-synchronous',
    d: 'Inclination ≈ 98.4° — the whole globe rolls beneath',
  },
  {
    icon: Repeat,
    k: 'Repeat cycle',
    v: '12 days',
    d: 'Every land and ice surface, mapped again and again',
  },
  {
    icon: MoveHorizontal,
    k: 'Swath',
    v: '242 km',
    d: 'A 242-km-wide ribbon of radar, coast to coast',
  },
  {
    icon: Radio,
    k: 'Radar bands',
    v: 'L 1.257 GHz · S 3.2 GHz',
    d: 'First dual-band (L + S) SAR mission in history',
  },
  {
    icon: Antenna,
    k: 'Antenna',
    v: '12 m mesh reflector',
    d: 'Gold-coated wire mesh on a 9 m boom, fed by both radars',
  },
  {
    icon: Weight,
    k: 'Spacecraft',
    v: '≈ 2.8 tonnes',
    d: 'ISRO I-3K bus carrying JPL’s radar payload',
  },
  {
    icon: Database,
    k: 'Data',
    v: 'Free & open',
    d: 'Petabytes per year via ASF DAAC (NASA) and Bhoonidhi (ISRO)',
  },
];

export function MissionFacts() {
  return (
    <section id="mission" className="scroll-mt-16 border-t border-border/60 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-primary">
            <Rocket className="size-3.5" aria-hidden />
            The mission
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            NISAR — a partnership pointed at a changing planet
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            NASA and ISRO built NISAR together: JPL’s L-band radar and ISRO’s S-band radar sharing
            one 12-metre reflectarray, launched by India’s GSLV on a three-year prime mission to
            measure the pulse of Earth’s changing surfaces. Its first radar images were released in
            August 2025.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <motion.div
              key={f.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2 text-primary">
                <f.icon className="size-4" aria-hidden />
                <span className="text-[10.5px] font-mono uppercase tracking-[0.18em]">{f.k}</span>
              </div>
              <div className="mt-2.5 font-semibold text-[15px] leading-snug">{f.v}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.d}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start gap-4 rounded-xl border border-border bg-gradient-to-r from-primary/10 via-transparent to-amber-500/10 px-5 py-5 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <Handshake className="size-5" aria-hidden />
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
            <span className="font-semibold">NASA — Jet Propulsion Laboratory</span>
            <span className="font-mono text-[11px] text-muted-foreground">L-SAR · payload ops · science data</span>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="font-semibold">ISRO — Space Applications Centre</span>
            <span className="font-mono text-[11px] text-muted-foreground">S-SAR · spacecraft · launch · Bhoonidhi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
