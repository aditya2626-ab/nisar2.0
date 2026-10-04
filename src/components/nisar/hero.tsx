'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Satellite, Radio, Globe2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MISSION, missionTelemetry } from '@/lib/nisar/model';

const CHIPS = [
  { icon: Globe2, k: '747 km', v: 'sun-synchronous orbit' },
  { icon: Radio, k: 'L + S band', v: '23.8 cm + 9.4 cm wavelength' },
  { icon: Satellite, k: '12 days', v: 'global repeat cycle' },
  { icon: Database, k: '242 km', v: 'swath, free & open data' },
];

function RadarVisual() {
  const blips = useMemo(
    () => [
      { top: '30%', left: '62%', delay: '0.8s', c: '#34d399' },
      { top: '58%', left: '40%', delay: '1.6s', c: '#fb923c' },
      { top: '44%', left: '72%', delay: '2.4s', c: '#67e8f9' },
      { top: '68%', left: '60%', delay: '3.1s', c: '#f43f5e' },
      { top: '26%', left: '36%', delay: '3.6s', c: '#fbbf24' },
    ],
    [],
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]" role="img" aria-label="Animated radar sweep with surface-change blips">
      <div className="absolute inset-0 rounded-full border border-primary/15 bg-[radial-gradient(circle_at_center,oklch(0.8_0.135_172/0.06),transparent_65%)]" />
      {[0.78, 0.55, 0.32].map((s, i) => (
        <div
          key={i}
          className="radar-ring absolute"
          style={{ inset: `${((1 - s) / 2) * 100}%` }}
          aria-hidden
        />
      ))}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/10" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/10" />
      </div>
      <div className="radar-sweep absolute inset-0" aria-hidden />
      {blips.map((b, i) => (
        <span
          key={i}
          className="radar-blip"
          style={{ top: b.top, left: b.left, animationDelay: b.delay, ['--blip' as string]: b.c }}
          aria-hidden
        />
      ))}
      <div className="absolute inset-x-0 -bottom-9 flex justify-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          L-band · 1.257 GHz · every 12 days
        </span>
      </div>
    </div>
  );
}

function TelemetryTicker() {
  const [tel, setTel] = useState(() => missionTelemetry());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let alive = true;
    const t0 = setTimeout(() => {
      if (!alive) return;
      setTel(missionTelemetry());
      setMounted(true);
    }, 0);
    const id = setInterval(() => {
      if (alive) setTel(missionTelemetry());
    }, 15_000);
    return () => {
      alive = false;
      clearTimeout(t0);
      clearInterval(id);
    };
  }, []);

  const items = [
    `MISSION ELAPSED TIME ${mounted ? tel.metLabel : 'T+ —'}`,
    `ORBIT Nº ${mounted ? tel.orbitNo.toLocaleString('en-US') : '—'} · ${MISSION.orbitAltKm} KM`,
    `ACQUISITION CYCLE ${String(Math.min(tel.cycleNo, MISSION.epochCount)).padStart(2, '0')}/${MISSION.epochCount}`,
    `NEXT PASS IN ~${mounted ? tel.minToNextPass : '—'} MIN`,
    `RAW DATA CUMULATIVE ≈ ${mounted ? tel.dataTB.toFixed(1) : '—'} TB`,
    `SWATH ${MISSION.swathKm} KM · DUAL BAND L/S`,
  ];

  return (
    <div className="telemetry-ticker overflow-hidden border-y border-border/60 bg-secondary/40 py-2">
      <div className="flex gap-10 whitespace-nowrap font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground animate-marquee">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="size-1 rounded-full bg-primary/70 inline-block" aria-hidden />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="starfield relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-24">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary"
            >
              <Satellite className="size-3.5" aria-hidden />
              NASA–ISRO NISAR · launched 30 July 2025 · GSLV-F16
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-6 text-4xl sm:text-5xl md:text-[3.4rem] font-bold tracking-tight leading-[1.05]"
            >
              Earth&apos;s surface never sits still.
              <span className="block text-primary">Now we can watch every step.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              NISAR PULSE is an interactive observatory for radar interferometry: watch megacities sink,
              glaciers flow, volcanoes breathe, wetlands drain and burn scars heal — measured in
              centimetres, every 12-day cycle, through cloud and darkness.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="font-medium">
                <a href="#observatory">
                  Launch the observatory
                  <ArrowDown className="ml-1 size-4" aria-hidden />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border/70">
                <a href="#science">How InSAR works</a>
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.34 }}
              className="mt-10 grid grid-cols-2 gap-3 max-w-xl"
            >
              {CHIPS.map((c) => (
                <li
                  key={c.k}
                  className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/50 px-3.5 py-2.5"
                >
                  <c.icon className="size-4.5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight">{c.k}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{c.v}</div>
                  </div>
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hidden md:block pb-12"
          >
            <RadarVisual />
          </motion.div>
        </div>
      </div>

      <TelemetryTicker />

      <p className="sr-only">
        NISAR PULSE, an interactive atlas of Earth surface change using NASA-ISRO Synthetic Aperture
        Radar. The observatory below tracks 14 global study sites across 40 acquisition cycles.
      </p>
    </section>
  );
}
