/**
 * NISAR PULSE — representative InSAR modelling engine.
 *
 * Everything here is deterministic (seeded by site id) so the server-rendered
 * page and the client always agree. The models are pedagogical reconstructions
 * calibrated to published rates — NOT raw mission data. See /api/telemetry for
 * the live-computed mission clock.
 */

import { Site, MetricKind } from './sites';

/* ------------------------------------------------------------------ */
/* Mission constants                                                   */
/* ------------------------------------------------------------------ */

export const MISSION = {
  name: 'NISAR',
  launchISO: '2025-07-30T12:15:00Z', // GSLV-F16, 17:45 IST, Satish Dhawan Space Centre
  firstEpochISO: '2025-08-12T06:00:00Z', // first nominal 12-day science cycle
  epochDays: 12,
  epochCount: 40,
  orbitAltKm: 747,
  periodMin: 99.6,
  swathKm: 242,
  inclDeg: 98.4,
  lambdaL: 0.2383, // metres (L-band 1.257 GHz, NASA/JPL)
  lambdaS: 0.0937, // metres (S-band 3.2 GHz, ISRO)
  antennaM: 12,
};

const LAUNCH_MS = Date.parse(MISSION.launchISO);
const FIRST_EPOCH_MS = Date.parse(MISSION.firstEpochISO);
const EPOCH_MS = MISSION.epochDays * 86400_000;
/** Half-wavelength of L-band in cm — one fringe of LOS motion. */
export const L_FRINGE_CM = (MISSION.lambdaL / 2) * 100;

export interface EpochInfo {
  index: number;
  start: Date;
  label: string; // "12 Aug 25"
  cycle: number; // 1-based cycle number
  isFuture: boolean;
}

const DAY = 86400_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** UTC-deterministic date label (server & client always agree). */
export function fmtDateUTC(d: Date): string {
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
}

function buildEpochs(): EpochInfo[] {
  const out: EpochInfo[] = [];
  for (let i = 0; i < MISSION.epochCount; i++) {
    const start = new Date(FIRST_EPOCH_MS + i * EPOCH_MS);
    out.push({
      index: i,
      start,
      label: fmtDateUTC(start),
      cycle: i + 1,
      isFuture: false, // patched at runtime by isEpochFuture
    });
  }
  return out;
}

export const EPOCHS: EpochInfo[] = buildEpochs();

/** Epochs are "acquired" if their window began before `now`. */
export function isEpochFuture(index: number, now: number = Date.now()): boolean {
  return FIRST_EPOCH_MS + (index + 0.5) * EPOCH_MS > now;
}

/** Latest epoch whose acquisition window has begun (safe default cursor). */
export function latestAcquiredEpoch(now: number = Date.now()): number {
  for (let i = MISSION.epochCount - 1; i >= 0; i--) {
    if (!isEpochFuture(i, now)) return i;
  }
  return 0;
}

export function missionTelemetry(now: number = Date.now()) {
  const metMs = Math.max(0, now - LAUNCH_MS);
  const metDays = metMs / 86400_000;
  const orbitsPerDay = 1440 / MISSION.periodMin;
  const orbitNo = Math.floor(metDays * orbitsPerDay) + 310;
  const orbitProgress = (metDays * orbitsPerDay) % 1;
  const minToNextPass = Math.round((1 - orbitProgress) * MISSION.periodMin);
  const dataTB = metDays * 0.085; // ≈ 85 TB/day raw downlink budget → cumulative
  return {
    metDays,
    metLabel: `T+ ${Math.floor(metDays)} d ${Math.floor((metDays % 1) * 24)} h`,
    orbitNo,
    minToNextPass,
    dataTB,
    cycleNo: Math.min(MISSION.epochCount, Math.floor((now - FIRST_EPOCH_MS) / EPOCH_MS) + 1),
  };
}

/* ------------------------------------------------------------------ */
/* Deterministic RNG + value noise                                     */
/* ------------------------------------------------------------------ */

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic integer hash → [0,1). Exported for canvas speckle. */
export function hash2(x: number, y: number, seed: number): number {
  let h = seed >>> 0;
  h = Math.imul(h ^ Math.imul(x | 0, 374761393), 668265263);
  h = Math.imul(h ^ Math.imul(y | 0, 2246822519), 3266489917);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function smooth01(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** GLSL-style smoothstep; supports inverted edges (e1 < e0). */
function smoothstep(e0: number, e1: number, x: number): number {
  return smooth01((x - e0) / (e1 - e0));
}

/** 2-octave value noise in [-1, 1] over normalised coords. */
function valueNoise(x: number, y: number, seed: number): number {
  const oct = (fx: number, fy: number) => {
    const xi = Math.floor(fx);
    const yi = Math.floor(fy);
    const tx = smooth01(fx - xi);
    const ty = smooth01(fy - yi);
    const a = hash2(xi, yi, seed);
    const b = hash2(xi + 1, yi, seed);
    const c = hash2(xi, yi + 1, seed);
    const d = hash2(xi + 1, yi + 1, seed);
    return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
  };
  return oct(x, y) * 0.72 + oct(x * 2.7 + 11.3, y * 2.7 + 7.9) * 0.28; // [0,1]
}

/* ------------------------------------------------------------------ */
/* Time-series generation                                              */
/* ------------------------------------------------------------------ */

export interface SeriesPoint {
  epoch: number;
  date: string; // ISO
  label: string;
  value: number; // cm (displacement) or 0–1 (coherence)
  event?: string;
  isFuture: boolean;
}

export function metricKind(site: Site): MetricKind {
  return site.model.coherence0 !== undefined ? 'coherence' : 'displacement';
}

export function generateSeries(site: Site): SeriesPoint[] {
  const kind = metricKind(site);
  const m = site.model;
  const rng = mulberry32(hashString(site.id));
  const seed = hashString(site.id);
  let walk = 0;
  const pts: SeriesPoint[] = [];
  const now = Date.now();

  for (let i = 0; i < MISSION.epochCount; i++) {
    const t = i * MISSION.epochDays; // days since first epoch
    const date = new Date(FIRST_EPOCH_MS + t * DAY);
    const doy = (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY;
    const yr = t / 365.25;
    const seasonal = Math.sin((doy / 365.25) * 2 * Math.PI + (m.seasonalPhase ?? 0));
    let value = 0;
    let event: string | undefined;

    if (kind === 'displacement') {
      value = (m.rate ?? 0) * yr + (m.seasonalAmp ?? 0) * seasonal;

      if (m.postseismicAmp) {
        const prev = m.postseismicAmp * Math.log(1 + Math.max(0, t - MISSION.epochDays) / (m.postseismicTau ?? 120));
        value += prev;
        if (i === 0) event = 'M8.8 afterslip window opens';
        if (i === 1) event = 'early rapid afterslip phase';
      }

      if (m.sawtoothFill) {
        const P = m.sawtoothPeriod ?? 66;
        const dropAt = P - 8;
        // cumulative over completed cycles + current cycle
        const cycles = Math.floor(t / P);
        const phase = t - cycles * P;
        const fill = (c: number) => Math.min(m.sawtoothFill! * (P - 8), m.sawtoothFill! * (P - 8));
        let v = 0;
        for (let c = 0; c < cycles; c++) v += fill(c) - (m.sawtoothDrop ?? fill(c));
        if (phase < dropAt) v += m.sawtoothFill! * phase;
        else v += m.sawtoothFill! * dropAt - ((m.sawtoothDrop ?? 6) / 8) * (phase - dropAt);
        value += v;
        if (phase >= dropAt && phase < dropAt + 8) event = 'eruptive deflation';
      }

      if (m.stepEpoch !== undefined && i >= m.stepEpoch) {
        value += m.stepAmp ?? 0;
        if (i === m.stepEpoch) event = 'event step';
      }

      walk = walk * 0.55 + (rng() - 0.5) * 2 * (m.noiseAmp ?? 0.2);
      value += walk;
    } else {
      // coherence metric
      const c0 = m.coherence0 ?? 0.8;
      const drop = m.coherenceDrop ?? 0.4;
      const rec = m.coherenceRecovery ?? 0.3;
      if (m.stepEpoch !== undefined && i >= m.stepEpoch) {
        value = Math.min(0.97, c0 - drop + rec * Math.max(0, yr - (m.stepEpoch * MISSION.epochDays) / 365.25));
        if (i === m.stepEpoch) event = 'firestorm — coherence collapse';
      } else {
        value = c0 - drop + rec * yr; // burned pre-mission (e.g. Eaton, Jan 2025)
        if (i === 0) event = 'scar already burned (pre-launch)';
      }
      walk = walk * 0.5 + (rng() - 0.5) * 2 * (m.noiseAmp ?? 0.02);
      value += walk;
    }

    pts.push({
      epoch: i,
      date: date.toISOString(),
      label: fmtDateUTC(date),
      value: Math.round(value * 1000) / 1000,
      event,
      isFuture: FIRST_EPOCH_MS + (i + 0.5) * EPOCH_MS > now,
    });
  }
  void seed;
  return pts;
}

/** Cumulative displacement (cm) at an epoch for fringe animation (displacement sites). */
export function displayFringes(site: Site, series: SeriesPoint[], epoch: number): number {
  const kind = metricKind(site);
  if (kind === 'coherence') return 2; // gentle background fringes outside scar
  const raw = Math.abs(series[epoch].value) / L_FRINGE_CM;
  const gain = 1 / (site.insar.fringeScale ?? 1);
  let f = raw * gain * 4; // ×4 display exaggeration, disclosed in UI
  if (site.insar.pattern === 'bands') f = Math.min(f, 14);
  return Math.max(f, 0.35);
}

/* ------------------------------------------------------------------ */
/* Interferogram spatial phase field                                   */
/* ------------------------------------------------------------------ */

export interface FieldSample {
  /** wrapped phase [0,2π) — NaN where decorrelated */
  phase: number;
  /** 0 = fully decorrelated, 1 = perfect coherence */
  coherence: number;
  /** LOS-equivalent displacement in cm (unwrapped proxy) */
  disp: number;
}

function rot(u: number, v: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [u * c + v * s, -u * s + v * c];
}

function ellipseRadius(u: number, v: number, ex: number, ey: number): number {
  return Math.sqrt((u / ex) * (u / ex) + (v / ey) * (v / ey)) / Math.SQRT2;
}

/**
 * Sample the simulated interferogram at normalised scene coords u,v ∈ [-1,1].
 * `noiseAmpScale` lets the renderer keep speckle consistent across sizes.
 */
export function sampleField(site: Site, series: SeriesPoint[], epoch: number, u: number, v: number): FieldSample {
  const ins = site.insar;
  const seed = hashString(site.id);
  const kind = metricKind(site);
  const F = displayFringes(site, series, epoch);
  const coherenceEpoch = kind === 'coherence' ? series[epoch].value : 1;
  const dispTotal = kind === 'displacement' ? series[epoch].value : 0;
  const speckleSeed = seed ^ 0x9e3779b9;

  const speckle = (hash2(Math.round(u * 220), Math.round(v * 220), speckleSeed) - 0.5) * 2;

  switch (ins.pattern) {
    case 'bowl': {
      const [ru, rv] = rot(u, v, ins.angle ?? 0);
      const r = ellipseRadius(ru, rv, ins.ellipse ?? 1, 1 / (ins.ellipse ?? 1));
      const profile = Math.pow(Math.max(0, 1 - Math.min(1, r)), 1.25);
      const unwrapped = 2 * Math.PI * F * profile;
      const coh = Math.max(0, 1 - ins.decorrelation! * smoothstep(0.75, 1.05, r)) - Math.abs(speckle) * 0.06;
      return { phase: unwrapped, coherence: coh, disp: dispTotal * profile };
    }
    case 'bullseye': {
      const du = u - 0.12;
      const dv = v + 0.09;
      const r = ellipseRadius(du, dv, 1.05, 1.05);
      const profile = Math.pow(Math.max(0, 1 - Math.min(1, r)), 1.3);
      const unwrapped = 2 * Math.PI * F * profile;
      const coh = Math.max(0, 1 - ins.decorrelation! * smoothstep(0.7, 1.0, r));
      return { phase: unwrapped, coherence: coh, disp: dispTotal * profile };
    }
    case 'lobes': {
      const [ru, rv] = rot(u, v, ins.angle ?? 0);
      const r = Math.min(1, Math.sqrt(ru * ru + rv * rv) / Math.SQRT2);
      const theta = Math.atan2(rv, ru);
      const profile = Math.sin(theta * 2) * 0.55 * Math.pow(1 - r, 1.6);
      const unwrapped = 2 * Math.PI * F * profile;
      const coh = Math.max(0, 1 - ins.decorrelation! * smoothstep(0.7, 1.05, r));
      return { phase: unwrapped, coherence: coh, disp: dispTotal * profile * 2 };
    }
    case 'bands': {
      const [ru, rv] = rot(u, v, ins.angle ?? 0);
      const along = (ru + 1) / 2; // 0..1 along flow
      const warp = (valueNoise(ru * 2 + 5, rv * 2 - 3, seed) - 0.5) * 0.18;
      const profile = Math.min(1, Math.max(0, along + warp));
      const unwrapped = 2 * Math.PI * F * profile;
      const coh = 1 - ins.decorrelation! * (0.35 + 0.65 * smoothstep(0.55, 1.0, Math.abs(rv)));
      return { phase: unwrapped, coherence: Math.max(0.15, coh), disp: dispTotal * profile };
    }
    case 'patch': {
      const n = valueNoise(u * 2.4 + 9, v * 2.4 + 4, seed);
      const water = valueNoise(u * 1.7 - 6, v * 1.7 + 8, seed ^ 0x51ab3f);
      const isWater = water > 0.66;
      const profile = n;
      const unwrapped = 2 * Math.PI * F * profile;
      const coh = isWater ? 0.05 + Math.abs(speckle) * 0.05 : 1 - ins.decorrelation! * 0.55;
      return { phase: unwrapped, coherence: coh, disp: dispTotal * (profile - 0.5) * 2 };
    }
    case 'fields': {
      const [ru, rv] = rot(u, v, ins.angle ?? 0);
      const cells = 5.2;
      const cu = Math.floor(ru * cells);
      const cv = Math.floor(rv * cells);
      const fu = ru * cells - cu;
      const fv = rv * cells - cv;
      const fr = hash2(cu + 31, cv + 17, seed);
      const border = Math.min(fu, fv, 1 - fu, 1 - fv);
      const boundary = border < 0.035 ? 0.35 : 1;
      const profile = (fr * 0.55 + fv * 0.45) * boundary;
      const unwrapped = 2 * Math.PI * F * profile;
      const fieldCoh = 0.55 + fr * 0.4;
      const coh = Math.max(0.2, fieldCoh - ins.decorrelation! * 0.4) * (boundary === 1 ? 1 : 0.6);
      return { phase: unwrapped, coherence: coh, disp: dispTotal * (profile - 0.5) * 1.4 };
    }
    case 'scar': {
      const [ru, rv] = rot(u, v, ins.angle ?? 0);
      const blobN = valueNoise(ru * 1.9 + 3, rv * 1.9 - 5, seed);
      const r = Math.sqrt(ru * ru + rv * rv) / Math.SQRT2 + (blobN - 0.5) * 0.5;
      const mask = smoothstep(0.52, 0.4, Math.min(1, r)); // 1 inside scar
      const inCoh = Math.max(0, Math.min(1, coherenceEpoch));
      const profile = Math.pow(Math.max(0, 1 - Math.min(1, r * 0.9)), 1.1);
      const unwrapped = 2 * Math.PI * 2.2 * profile;
      // interior: weak, recovering fringes; exterior: clean, coherent fringes
      const phase = unwrapped * ((1 - mask) + mask * inCoh * 0.55);
      const coh = (1 - mask) * 0.96 + mask * inCoh;
      return { phase, coherence: Math.max(0.02, Math.min(1, coh)), disp: 0 };
    }
  }
}

/* ------------------------------------------------------------------ */
/* Colormaps                                                           */
/* ------------------------------------------------------------------ */

/** Classic wrapped-interferogram rainbow (HSV hue = phase/2π). */
export function hsvWrap(phase: number, coherence = 1): [number, number, number] {
  const hue = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI);
  const s = 0.92;
  const val = 0.34 + 0.62 * Math.min(1, Math.max(0.15, coherence));
  const i = Math.floor(hue * 6);
  const f = hue * 6 - i;
  const p = val * (1 - s);
  const q = val * (1 - f * s);
  const t = val * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = val; g = t; b = p; break;
    case 1: r = q; g = val; b = p; break;
    case 2: r = p; g = val; b = t; break;
    case 3: r = p; g = q; b = val; break;
    case 4: r = t; g = p; b = val; break;
    case 5: r = val; g = p; b = q; break;
  }
  const gr = 0.299 * r + 0.587 * g + 0.114 * b;
  // fade toward gray with low coherence
  const k = Math.min(1, Math.max(0, coherence));
  return [
    Math.round((r * k + gr * (1 - k)) * 255),
    Math.round((g * k + gr * (1 - k)) * 255),
    Math.round((b * k + gr * (1 - k)) * 255),
  ];
}

/** Sequential dark→teal→sand ramp for unwrapped displacement / coherence. */
export function sequentialRamp(x: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, x));
  const stops: [number, number, number, number][] = [
    [0.0, 8, 14, 22],
    [0.35, 13, 74, 84],
    [0.68, 45, 212, 191],
    [1.0, 253, 230, 138],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [x0, ...c0] = stops[i - 1];
      const [x1, ...c1] = stops[i];
      const k = (t - x0) / (x1 - x0 || 1);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * k),
        Math.round(c0[1] + (c1[1] - c0[1]) * k),
        Math.round(c0[2] + (c1[2] - c0[2]) * k),
      ];
    }
  }
  return [253, 230, 138];
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function fmtMetric(site: Site, v: number): string {
  if (metricKind(site) === 'coherence') return v.toFixed(2);
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}`;
}

export function metricUnit(site: Site): string {
  return metricKind(site) === 'coherence' ? 'coherence (0–1)' : 'cm LOS';
}
