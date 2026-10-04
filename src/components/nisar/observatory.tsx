'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, Pause, Layers, Globe2, TriangleAlert, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  SITES,
  CATEGORY_MAP,
  CATEGORIES,
  type CategoryId,
  type Site,
} from '@/lib/nisar/sites';
import {
  EPOCHS,
  MISSION,
  fmtMetric,
  generateSeries,
  latestAcquiredEpoch,
  metricUnit,
  type SeriesPoint,
} from '@/lib/nisar/model';
import { CategoryIcon } from './category-icon';
import { SitePanel } from './site-panel';
import { cn } from '@/lib/utils';

/** Client-only leaflet map. */
const SiteMap = dynamic(() => import('./site-map'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-secondary/40">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe2 className="size-4 animate-pulse" aria-hidden /> Loading world view…
      </div>
    </div>
  ),
});

/** SSR-stable initial epoch; corrected to the real mission clock after mount. */
const DEFAULT_EPOCH = 30;

export function Observatory() {
  const [selectedId, setSelectedId] = useState<string>('jakarta');
  const [category, setCategory] = useState<'all' | CategoryId>('all');
  const [epoch, setEpoch] = useState<number>(DEFAULT_EPOCH);
  const [playing, setPlaying] = useState(false);
  const [apiSynced, setApiSynced] = useState<boolean | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  /* correct the epoch cursor to the live mission clock once mounted */
  useEffect(() => {
    const t0 = setTimeout(() => setEpoch(latestAcquiredEpoch()), 0);
    return () => clearTimeout(t0);
  }, []);

  /* play loop: advance one 12-day cycle every 500 ms */
  const epochRef = useRef(epoch);
  useEffect(() => {
    epochRef.current = epoch;
  }, [epoch]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if (epochRef.current >= MISSION.epochCount - 1) {
        setPlaying(false);
        return;
      }
      setEpoch((e) => Math.min(MISSION.epochCount - 1, e + 1));
    }, 500);
    return () => clearInterval(id);
  }, [playing]);

  /* catalogue sync via backend (falls back to bundled dataset) */
  useEffect(() => {
    let alive = true;
    fetch('/api/sites')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (alive && Array.isArray(d?.sites) && d.sites.length === SITES.length) setApiSynced(true);
      })
      .catch(() => {
        if (alive) setApiSynced(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const seriesById = useMemo(() => {
    const m = new Map<string, SeriesPoint[]>();
    for (const s of SITES) m.set(s.id, generateSeries(s));
    return m;
  }, []);

  const filtered: Site[] = useMemo(
    () => (category === 'all' ? SITES : SITES.filter((s) => s.category === category)),
    [category],
  );
  // keep the visible site consistent with the active category filter
  const site = filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? SITES[0];
  const series = seriesById.get(site.id)!;
  const cat = CATEGORY_MAP[site.category];
  const countFor = (id: CategoryId) => SITES.filter((s) => s.category === id).length;

  const onSelect = (id: string) => {
    setSelectedId(id);
    setPlaying(false);
  };

  const scrollToPanel = () => {
    sectionRef.current
      ?.querySelector('#site-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="observatory" ref={sectionRef} className="scroll-mt-16 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* section header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-primary">
            <Layers className="size-3.5" aria-hidden />
            Mission observatory
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Watch Earth move, cycle by cycle
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Fourteen study sites across six continents, one shared 12-day acquisition clock. Scrub or
            play the mission timeline — the interferogram fringes accumulate exactly as displacement
            accumulates, cycle after cycle.
          </p>
        </div>

        {/* category filters */}
        <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filter sites by change type">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            <Globe2 className="size-3.5" aria-hidden />
            All sites
            <Count n={SITES.length} />
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
              color={c.color}
            >
              <CategoryIcon id={c.id} className="size-3.5" />
              {c.label}
              <Count n={countFor(c.id)} />
            </FilterChip>
          ))}
        </div>

        {/* map + site list */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          {/* map card */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg h-[440px] md:h-[560px]">
            <SiteMap sites={filtered} selectedId={selectedId} onSelect={onSelect} playing={playing} />

            {/* HUD — mission clock + fringe legend */}
            <div className="pointer-events-none absolute left-3 top-3 z-[500] flex max-w-[70%] flex-col gap-2">
              <div className="glass rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed shadow">
                <div className="flex items-center gap-2 text-foreground">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: cat.color }}
                    aria-hidden
                  />
                  <span className="font-sans font-semibold truncate">{site.name}</span>
                </div>
                <div className="mt-0.5 text-muted-foreground">
                  CYCLE {String(epoch + 1).padStart(2, '0')}/{MISSION.epochCount} ·{' '}
                  {EPOCHS[epoch].label} · {site.band}-BAND
                </div>
              </div>
              <div className="glass hidden md:block rounded-lg px-3 py-1.5 font-mono text-[10px] text-muted-foreground leading-relaxed w-fit">
                1 FRINGE ≈ 11.9 CM LOS · Δφ = 4πΔd/λ
              </div>
            </div>

            {/* HUD — epoch transport */}
            <div className="absolute inset-x-3 bottom-3 z-[500] glass rounded-xl px-3 py-3 md:px-4">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  aria-label={playing ? 'Pause mission timeline' : 'Play mission timeline'}
                  onClick={() => setPlaying((p) => !p)}
                  className="size-10 shrink-0 rounded-full"
                >
                  {playing ? <Pause className="size-4.5" aria-hidden /> : <Play className="size-4.5 ml-0.5" aria-hidden />}
                </Button>
                <div className="min-w-0 flex-1">
                  <Slider
                    value={[epoch]}
                    min={0}
                    max={MISSION.epochCount - 1}
                    step={1}
                    onValueChange={(v) => {
                      setPlaying(false);
                      setEpoch(v[0] ?? 0);
                    }}
                    aria-label="Mission acquisition cycle"
                  />
                  <div className="mt-1.5 flex justify-between font-mono text-[9.5px] text-muted-foreground">
                    <span>C01 · 12 AUG 25</span>
                    <span className="hidden sm:inline">12-DAY REPEAT CYCLE</span>
                    <span>C{String(MISSION.epochCount).padStart(2, '0')} · {EPOCHS[MISSION.epochCount - 1].label}</span>
                  </div>
                </div>
                <div className="hidden sm:block shrink-0 rounded-md border border-border/70 bg-secondary/60 px-2.5 py-1.5 text-right font-mono text-[11px]">
                  <span className="text-primary">{fmtMetric(site, series[epoch].value)}</span>
                  <span className="block text-[9px] text-muted-foreground">{metricUnit(site)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* site list */}
          <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto scroll-thin max-lg:pb-3 lg:max-h-[560px] lg:pr-1">
            {filtered.map((s) => {
              const c = CATEGORY_MAP[s.category];
              const ser = seriesById.get(s.id)!;
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelect(s.id);
                    scrollToPanel();
                  }}
                  aria-current={active}
                  className={cn(
                    'group relative min-w-[248px] lg:min-w-0 shrink-0 rounded-xl border p-3.5 text-left transition-all',
                    active
                      ? 'border-primary/50 bg-primary/10 shadow-[0_0_0_1px_oklch(0.8_0.135_172/0.25)]'
                      : 'border-border bg-card hover:border-border hover:bg-secondary/50',
                  )}
                >
                  <span
                    className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                    style={{ background: c.color, opacity: active ? 1 : 0.45 }}
                    aria-hidden
                  />
                  <div className="pl-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold leading-tight">{s.name}</span>
                      <ArrowUpRight
                        className={cn(
                          'size-3.5 shrink-0 transition-opacity',
                          active ? 'opacity-60' : 'opacity-0 group-hover:opacity-40',
                        )}
                        aria-hidden
                      />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                      {s.region} · {s.country}
                    </div>
                    <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
                      <span style={{ color: c.color }}>{fmtMetric(s, ser[epoch].value)}</span>
                      <span className="text-muted-foreground">{metricUnit(s)}</span>
                      <span className="ml-auto rounded border border-border/70 px-1.5 py-0.5 text-[9.5px] text-muted-foreground">
                        {s.band}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">No sites in this category.</div>
            )}
          </div>
        </div>

        {/* data provenance caption */}
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <Badge variant="outline" className="font-mono text-[9.5px] text-muted-foreground">
            DATA NOTE
          </Badge>
          <span>
            Rates &amp; narratives from published InSAR studies · per-epoch series &amp; fringes are
            representative simulations
          </span>
          {apiSynced !== null && (
            <span className="hidden sm:inline text-primary/80">
              · catalogue {apiSynced ? 'synced via /api/sites' : 'loaded locally'}
            </span>
          )}
        </div>

        {/* selected site detail */}
        <SitePanel
          site={site}
          series={series}
          epoch={epoch}
          onEpochChange={(e) => {
            setPlaying(false);
            setEpoch(e);
          }}
          onNext={() => {
            const i = SITES.findIndex((s) => s.id === site.id);
            setSelectedId(SITES[(i + 1) % SITES.length].id);
          }}
          onPrev={() => {
            const i = SITES.findIndex((s) => s.id === site.id);
            setSelectedId(SITES[(i - 1 + SITES.length) % SITES.length].id);
          }}
          categoryCount={countFor(site.category)}
        />

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
          <span>
            <strong className="text-foreground/90">Scientific integrity note.</strong> Study-site
            selection, published rates and mission parameters are real. The per-cycle time series and
            interferogram imagery are deterministic simulations generated in your browser from those
            rates — calibrated stand-ins for NISAR L2 products, ready to be swapped for the real
            thing (see <a className="text-primary underline-offset-2 hover:underline" href="#data">Data &amp; sources</a>).
          </span>
        </div>
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-transparent text-background shadow'
          : 'border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60',
      )}
      style={active ? { background: color ?? '#2dd4bf' } : undefined}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="rounded-full bg-black/20 dark:bg-white/10 px-1.5 text-[10px] font-mono">{n}</span>;
}
