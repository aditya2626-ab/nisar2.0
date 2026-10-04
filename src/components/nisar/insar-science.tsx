'use client';

import { motion } from 'framer-motion';
import { Satellite, Layers3, Waves, LineChart, ArrowDown } from 'lucide-react';
import { MISSION, L_FRINGE_CM } from '@/lib/nisar/model';

const STEPS = [
  {
    icon: Satellite,
    n: '01',
    title: 'Acquire',
    body: `From ${MISSION.orbitAltKm} km, NISAR illuminates the same ground every ${MISSION.epochDays} days, recording both the strength and the phase of the returning radar wave — a precision clock frozen into every pixel, day or night, through any cloud.`,
  },
  {
    icon: Layers3,
    n: '02',
    title: 'Coregister',
    body: 'Two scenes from repeat passes are aligned pixel-by-pixel to a fraction of a pixel, even though the satellite’s orbit differs by hundreds of metres each time. Only then can the pixels be compared honestly.',
  },
  {
    icon: Waves,
    n: '03',
    title: 'Interfere',
    body: 'The phases are differenced to form an interferogram. Where the ground moved toward or away from the spacecraft, the phase shifts and colours cycle — the iconic fringes. One fringe is a half-wavelength of motion.',
  },
  {
    icon: LineChart,
    n: '04',
    title: 'Unwrap & invert',
    body: 'Fringe counts are “unwrapped” into continuous displacement fields and inverted with models — a fault’s slip, a magma chamber’s inflow, an aquifer’s deflation. Geodesy at millimetre scale, everywhere at once.',
  },
];

function BandCard({
  band,
  freq,
  lambda,
  partner,
  color,
  penetrate,
  uses,
  note,
}: {
  band: string;
  freq: string;
  lambda: string;
  partner: string;
  color: string;
  penetrate: number; // 0..1 how deep the arrow reaches
  uses: string[];
  note: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-lg font-bold" style={{ color }}>
          {band}-band
          <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">{freq}</span>
        </h4>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {partner}
        </span>
      </div>
      <div className="mt-1 font-mono text-xs text-muted-foreground">λ = {lambda}</div>

      {/* penetration diagram */}
      <div className="mt-5 overflow-hidden rounded-lg border border-border/70">
        <svg viewBox="0 0 320 132" className="block w-full" role="img" aria-label={`${band}-band penetration diagram`}>
          {/* canopy layer */}
          <rect x="0" y="8" width="320" height="34" fill="oklch(0.45 0.09 155 / 0.35)" />
          <text x="8" y="20" fontSize="8.5" fill="oklch(0.85 0.05 155)" fontFamily="var(--font-geist-mono)">
            CANOPY &amp; TOP VEGETATION
          </text>
          {/* trunk layer */}
          <rect x="0" y="42" width="320" height="34" fill="oklch(0.42 0.07 120 / 0.35)" />
          <text x="8" y="54" fontSize="8.5" fill="oklch(0.85 0.05 130)" fontFamily="var(--font-geist-mono)">
            TRUNKS · STEMS · SNOW VOLUME
          </text>
          {/* ground layer */}
          <rect x="0" y="76" width="320" height="42" fill="oklch(0.3 0.02 80 / 0.5)" />
          <text x="8" y="90" fontSize="8.5" fill="oklch(0.8 0.03 90)" fontFamily="var(--font-geist-mono)">
            GROUND / ICE BODY
          </text>
          {/* satellite */}
          <g transform="translate(152, 0)">
            <path
              d="M13 7 9 3 5 7l4 4m8 0 4 4-4 4-4-4m-5-3 4 4 6-6-4-4Zm8-4 3-3M9 21a6 6 0 0 0-6-6"
              transform="translate(-12, -6) scale(0.5)"
              fill="none"
              stroke="oklch(0.93 0.01 180)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
          {/* penetration arrow */}
          <line
            x1="160"
            y1="12"
            x2="160"
            y2={12 + penetrate * 100}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 0"
            opacity="0.95"
          />
          <polygon
            points={`154,${10 + penetrate * 100} 166,${10 + penetrate * 100} 160,${18 + penetrate * 100}`}
            fill={color}
          />
          {/* scatter puffs along the way */}
          {[0.18, 0.42, 0.66, 0.9].map((f) =>
            f <= penetrate ? (
              <g key={f} opacity="0.8">
                <circle cx="160" cy={12 + f * 100} r="2.4" fill={color} />
                <line x1="168" y1={12 + f * 100} x2="180" y2={8 + f * 100} stroke={color} strokeWidth="1.2" opacity="0.6" />
              </g>
            ) : null,
          )}
        </svg>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{note}</p>

      <div className="mt-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
          Best at
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {uses.map((u) => (
            <li
              key={u}
              className="rounded-full border px-2.5 py-1 text-[11px]"
              style={{ borderColor: `${color}44`, color }}
            >
              {u}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function InSarScience() {
  return (
    <section id="science" className="scroll-mt-16 border-t border-border/60 bg-secondary/20 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-primary">
            <Waves className="size-3.5" aria-hidden />
            The science
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            How radar weighs a moving Earth
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Interferometric Synthetic Aperture Radar (InSAR) turns wavelength into a ruler. The same
            physics that makes soap bubbles swirl colours every millimetre of ground motion NISAR
            stares at — repeated globally every {MISSION.epochDays} days.
          </p>
        </div>

        {/* formula banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-primary/25 bg-primary/5 px-5 py-4"
        >
          <code className="font-mono text-lg sm:text-xl text-primary">Δφ = 4π · Δd / λ</code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Measured phase difference equals 4π times displacement over wavelength. For L-band that
            means one full colour cycle — one fringe — is ≈ {L_FRINGE_CM.toFixed(1)} cm of
            line-of-sight motion; for S-band ≈ 4.7 cm.
          </p>
        </motion.div>

        {/* 4-step pipeline */}
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="relative rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/12 text-primary">
                  <s.icon className="size-4.5" aria-hidden />
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="mt-3.5 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
              {i < STEPS.length - 1 && (
                <ArrowDown className="absolute -bottom-3.5 left-1/2 hidden size-4 -translate-x-1/2 text-primary/40 xl:hidden" aria-hidden />
              )}
            </motion.li>
          ))}
        </ol>

        {/* dual-band comparison */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold tracking-tight">Two radar eyes, one spacecraft</h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            NISAR is the first satellite to fly an L-band and an S-band radar side-by-side. The
            longer L wave slips through forest canopy, sand and ice; the shorter S wave dances with
            leaves and crops. Together they separate what changed at the surface from what changed
            beneath it.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <BandCard
              band="L"
              freq="1.257 GHz"
              lambda="23.8 cm"
              partner="NASA / JPL"
              color="#2dd4bf"
              penetrate={0.92}
              uses={[
                'Deformation under vegetation',
                'Ice-sheet & glacier flow',
                'Forest structure & biomass',
                'Coarse soil moisture',
              ]}
              note="The long wave penetrates canopies, dry sand and hundreds of metres of ice, returning from the true ground — which is why the deformation classics (Jakarta, Kamchatka, Central Valley) are L-band showcase stories. It also keeps coherence over fast, crevassed glaciers where shorter radars decorrelate."
            />
            <BandCard
              band="S"
              freq="3.2 GHz"
              lambda="9.4 cm"
              partner="ISRO"
              color="#fbbf24"
              penetrate={0.34}
              uses={[
                'Crop phenology & agriculture',
                'Vegetation density mapping',
                'Coastal & wetland texture',
                'Sea-ice classification',
              ]}
              note="The shorter wave interacts with leaves, stems and field-scale structure — ideal for agriculture and wetland mapping. ISRO’s S-SAR gives India an independent radar eye on the monsoon breadbasket, and its sensitivity complements L-band for biomass change detection."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
