'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { Site } from '@/lib/nisar/sites';
import { sampleField, hsvWrap, sequentialRamp, metricKind, hash2, type SeriesPoint } from '@/lib/nisar/model';

interface InterferogramProps {
  site: Site;
  series: SeriesPoint[];
  epoch: number;
  view: 'fringes' | 'unwrapped';
}

const SIZE = 384; // backing-store pixels (square)

/**
 * Canvas renderer for the simulated interferogram. Redraws on site / epoch /
 * view change. Per-pixel phase is sampled from the deterministic field in
 * model.ts so every visitor sees the identical scene.
 */
export function Interferogram({ site, series, epoch, view }: InterferogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const kind = metricKind(site);
  const speckleSeed = useMemo(() => {
    let h = 2166136261 >>> 0;
    for (const c of site.id) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return (h ^ 0x5bd1e995) >>> 0;
  }, [site.id]);

  const maxAbs = useMemo(() => Math.max(0.5, ...series.map((p) => Math.abs(p.value))), [series]);

  /** Burn scars lose interferometric coherence dramatically — hold them grey
   *  until regrowth pushes coherence back above the threshold. */
  const deadThreshold = site.insar.pattern === 'scar' ? 0.45 : 0.22;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;
    const img = ctx.createImageData(SIZE, SIZE);
    const data = img.data;

    let i = 0;
    for (let y = 0; y < SIZE; y++) {
      const v = (y / SIZE - 0.5) * 2;
      for (let x = 0; x < SIZE; x++) {
        const u = (x / SIZE - 0.5) * 2;
        const s = sampleField(site, series, epoch, u, v);
        const coh = Math.max(0, Math.min(1, s.coherence));
        const spk = (hash2(x, y, speckleSeed) - 0.5) * 2;

        let r: number, g: number, b: number;
        const dead = coh < deadThreshold;

        if (view === 'fringes') {
          if (dead) {
            const g0 = 20 + Math.abs(spk) * 26 + (1 - coh) * 14;
            r = g0;
            g = g0 * 1.02;
            b = g0 * 1.04;
          } else {
            const phase = s.phase + spk * 0.16;
            [r, g, b] = hsvWrap(phase, 0.35 + 0.65 * coh);
            r += spk * 7;
            g += spk * 7;
            b += spk * 7;
          }
        } else {
          if (kind === 'displacement') {
            if (dead) {
              const g0 = 16 + Math.abs(spk) * 20;
              r = g0;
              g = g0;
              b = g0 * 1.05;
            } else {
              const norm = Math.min(1, Math.abs(s.disp) / maxAbs) * (0.4 + 0.6 * coh);
              [r, g, b] = sequentialRamp(norm);
              r += spk * 5;
              g += spk * 5;
              b += spk * 5;
            }
          } else {
            const norm = coh * (0.55 + 0.45 * Math.max(0, 1 - Math.abs(spk) * 0.35));
            [r, g, b] = sequentialRamp(norm);
            r += spk * 6;
            g += spk * 6;
            b += spk * 6;
          }
        }

        data[i++] = Math.max(0, Math.min(255, r));
        data[i++] = Math.max(0, Math.min(255, g));
        data[i++] = Math.max(0, Math.min(255, b));
        data[i++] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [site, series, epoch, view, kind, speckleSeed, maxAbs, deadThreshold]);

  return (
    <canvas
      ref={canvasRef}
      className="block aspect-square w-full"
      style={{ imageRendering: 'auto' }}
      role="img"
      aria-label={`Simulated ${view} interferogram for ${site.name}, cycle ${epoch + 1}`}
    />
  );
}
