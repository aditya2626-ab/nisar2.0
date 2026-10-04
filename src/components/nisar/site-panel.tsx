'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChevronLeft, ChevronRight, Info, ScanLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORY_MAP, type Site } from '@/lib/nisar/sites';
import {
  EPOCHS,
  L_FRINGE_CM,
  fmtMetric,
  metricKind,
  metricUnit,
  type SeriesPoint,
} from '@/lib/nisar/model';
import { CategoryIcon } from './category-icon';
import { Interferogram } from './interferogram';
import { cn } from '@/lib/utils';

interface SitePanelProps {
  site: Site;
  series: SeriesPoint[];
  epoch: number;
  onEpochChange: (e: number) => void;
  onPrev: () => void;
  onNext: () => void;
  categoryCount: number;
}

type ViewMode = 'fringes' | 'unwrapped';

export function SitePanel({
  site,
  series,
  epoch,
  onEpochChange,
  onPrev,
  onNext,
  categoryCount,
}: SitePanelProps) {
  const cat = CATEGORY_MAP[site.category];
  const kind = metricKind(site);
  const [view, setView] = useState<ViewMode>('fringes');
  const panelRef = useRef<HTMLDivElement>(null);

  const maxAbs = useMemo(
    () => Math.max(0.5, ...series.map((p) => Math.abs(p.value))),
    [series],
  );
  const latest = useMemo(() => {
    for (let i = series.length - 1; i >= 0; i--) if (!series[i].isFuture) return i;
    return 0;
  }, [series]);

  return (
    <div id="site-panel" ref={panelRef} className="mt-8 scroll-mt-20">
      <div className="grid gap-4 xl:grid-cols-3">
        {/* ---------------- narrative ---------------- */}
        <article className="rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="gap-1.5 border-transparent font-medium"
                style={{ background: `${cat.color}1f`, color: cat.color }}
              >
                <CategoryIcon id={site.category} className="size-3.5" />
                {cat.label}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                {site.band}-band signal
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-7" onClick={onPrev} aria-label="Previous site">
                <ChevronLeft className="size-4" aria-hidden />
              </Button>
              <Button variant="ghost" size="icon" className="size-7" onClick={onNext} aria-label="Next site">
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold tracking-tight">{site.name}</h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {site.region} · {site.country} · {site.lat.toFixed(2)}°, {site.lon.toFixed(2)}°
          </p>

          <p className="mt-4 text-[15px] font-medium leading-relaxed text-foreground/95">
            {site.headline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{site.description}</p>

          <div className="mt-4 rounded-lg border-l-2 border-primary/70 bg-primary/5 px-3.5 py-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-primary">
              <Info className="size-3" aria-hidden /> What NISAR sees
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{site.insight}</p>
          </div>

          <dl className="mt-5 space-y-2">
            {site.stats.map((st) => (
              <div
                key={st.label}
                className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-xs text-muted-foreground">{st.label}</dt>
                <dd className="font-mono text-xs font-medium text-right">{st.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 border-t border-border/60 pt-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              Published basis
            </div>
            <ul className="mt-1.5 space-y-1">
              {site.sources.map((src) => (
                <li key={src} className="text-[11px] leading-snug text-muted-foreground">
                  — {src}
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* ---------------- time series ---------------- */}
        <article className="rounded-xl border border-border bg-card p-5 md:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold">
                {kind === 'displacement' ? 'Surface displacement' : 'Interferometric coherence'}
                <span className="ml-2 font-mono text-[10px] font-normal text-muted-foreground">
                  {metricUnit(site)}
                </span>
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Mission time series · 12-day cycles · click to scrub
              </p>
            </div>
            <div className="shrink-0 rounded-lg border border-border/70 bg-secondary/50 px-3 py-1.5 text-right font-mono">
              <span className="text-base font-semibold" style={{ color: cat.color }}>
                {fmtMetric(site, series[epoch].value)}
              </span>
              <span className="block text-[9px] text-muted-foreground">
                CYCLE {String(epoch + 1).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 8, right: 6, bottom: 0, left: 0 }}
                onClick={(s) => {
                  const idx = (s as { activeTooltipIndex?: number })?.activeTooltipIndex;
                  if (typeof idx === 'number') onEpochChange(idx);
                }}
              >
                <defs>
                  <linearGradient id={`grad-${site.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cat.color} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={cat.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(1 0 0 / 0.07)" vertical={false} />
                <XAxis
                  dataKey="label"
                  ticks={series.filter((_, i) => i % 8 === 0).map((p) => p.label)}
                  tick={{ fontSize: 9.5, fill: 'oklch(0.6 0.015 200)', fontFamily: 'var(--font-geist-mono)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'oklch(1 0 0 / 0.1)' }}
                  tickMargin={6}
                />
                <YAxis
                  width={46}
                  domain={kind === 'coherence' ? [0, 1] : ['auto', 'auto']}
                  tick={{ fontSize: 9.5, fill: 'oklch(0.6 0.015 200)', fontFamily: 'var(--font-geist-mono)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => (kind === 'coherence' ? v.toFixed(1) : `${v > 0 ? '+' : ''}${v}`)}
                />
                <Tooltip
                  cursor={{ stroke: 'oklch(1 0 0 / 0.18)', strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as SeriesPoint;
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          CYCLE {String(p.epoch + 1).padStart(2, '0')} · {p.label}
                          {p.isFuture ? ' · SCHEDULED' : ''}
                        </div>
                        <div className="mt-1 font-mono text-sm font-semibold" style={{ color: cat.color }}>
                          {fmtMetric(site, p.value)}{' '}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {metricUnit(site)}
                          </span>
                        </div>
                        {p.event && (
                          <div className="mt-1 text-[11px] text-foreground/80">⚡ {p.event}</div>
                        )}
                      </div>
                    );
                  }}
                />
                <ReferenceArea
                  x1={series[latest]?.label}
                  x2={series[series.length - 1]?.label}
                  fill="oklch(1 0 0 / 0.045)"
                />
                {kind === 'displacement' && <ReferenceLine y={0} stroke="oklch(1 0 0 / 0.2)" />}
                <ReferenceLine
                  x={series[epoch].label}
                  stroke="#2dd4bf"
                  strokeDasharray="4 3"
                  strokeWidth={1.4}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={cat.color}
                  strokeWidth={2}
                  fill={`url(#grad-${site.id})`}
                  dot={(props: { cx?: number; cy?: number; index?: number }) => {
                    const i = props.index ?? 0;
                    const p = series[i];
                    if (!p) return <g key={i} />;
                    const activeDot = i === epoch;
                    return (
                      <circle
                        key={i}
                        cx={props.cx}
                        cy={props.cy}
                        r={activeDot ? 5 : 2.4}
                        fill={p.isFuture && !activeDot ? 'transparent' : activeDot ? '#ffffff' : cat.color}
                        stroke={activeDot ? cat.color : p.isFuture ? cat.color : 'none'}
                        strokeWidth={activeDot ? 3 : 1.2}
                        strokeDasharray={p.isFuture && !activeDot ? '2 2' : undefined}
                        opacity={activeDot ? 1 : p.isFuture ? 0.55 : 0.85}
                      />
                    );
                  }}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-auto pt-3 text-[11px] leading-relaxed text-muted-foreground">
            {kind === 'displacement'
              ? 'Sign convention: negative = motion away from the satellite (subsidence / retreat). Shaded band beyond the cursor marks scheduled acquisitions.'
              : 'Coherence measures how reproducibly the surface scatters radar between passes — fire and flood destroy it, regrowth rebuilds it.'}
          </p>
        </article>

        {/* ---------------- interferogram ---------------- */}
        <article className="rounded-xl border border-border bg-card p-5 md:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ScanLine className="size-4 text-primary" aria-hidden />
                Interferogram · cycle {String(epoch + 1).padStart(2, '0')}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Simulated L-band wrap · ascending pass
              </p>
            </div>
            <div className="flex shrink-0 rounded-lg border border-border/70 p-0.5" role="group" aria-label="Interferogram view mode">
              {(['fringes', 'unwrapped'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                    view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-lg border border-border/80 bg-black/40">
            <Interferogram site={site} series={series} epoch={epoch} view={view} />
            <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-white/75">
              {EPOCHS[epoch].label} · λ = 23.8 CM
            </div>
          </div>

          <div className="mt-3">
            {view === 'fringes' ? (
              <>
                <div className="fringe-strip h-2.5 rounded-full" aria-hidden />
                <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
                  <span>−π phase</span>
                  <span>0</span>
                  <span>+π phase</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Each colour cycle = one fringe = λ/2 ≈ {L_FRINGE_CM.toFixed(1)} cm of line-of-sight
                  motion. Grey speckle = loss of coherence.
                </p>
              </>
            ) : (
              <>
                <div className="unwrapped-strip h-2.5 rounded-full" aria-hidden />
                <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
                  {kind === 'displacement' ? (
                    <>
                      <span>0 cm</span>
                      <span>±{maxAbs.toFixed(1)} cm LOS</span>
                    </>
                  ) : (
                    <>
                      <span>incoherent</span>
                      <span>coherent</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {kind === 'displacement'
                    ? 'Unwrapped cumulative displacement relative to the first cycle. Display exaggeration ×4.'
                    : 'Coherence field — dark regions changed too much between passes to interfere.'}
                </p>
              </>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
