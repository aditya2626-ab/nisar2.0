/**
 * NISAR PULSE — global surface-change site catalogue.
 *
 * Site narratives and headline numbers are grounded in published InSAR /
 * remote-sensing literature and mission press material. The per-epoch time
 * series and interferogram products rendered by the app are REPRESENTATIVE
 * SIMULATIONS (see src/lib/nisar/model.ts) calibrated to those published
 * rates — designed to be swappable with real NISAR L2 InSAR products from
 * ASF DAAC / Bhoonidhi.
 */

export type CategoryId =
  | 'wetland'
  | 'subsidence'
  | 'seismic'
  | 'volcanic'
  | 'glacier'
  | 'wildfire'
  | 'agriculture';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  color: string; // hex
  icon: string; // lucide icon name (mapped in components)
  blurb: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'wetland',
    label: 'Wetland Change',
    color: '#34d399',
    icon: 'Waves',
    blurb: 'Inundation extent, mangrove loss, marsh subsidence and tidal loading.',
  },
  {
    id: 'subsidence',
    label: 'Ground Subsidence',
    color: '#fb923c',
    icon: 'ArrowDownToDot',
    blurb: 'Sinking ground from groundwater pumping, compaction and urban loading.',
  },
  {
    id: 'seismic',
    label: 'Seismic Deformation',
    color: '#f43f5e',
    icon: 'Activity',
    blurb: 'Coseismic rupture and postseismic afterslip along active faults.',
  },
  {
    id: 'volcanic',
    label: 'Volcanic Deformation',
    color: '#ef4444',
    icon: 'Mountain',
    blurb: 'Magma inflation–deflation cycles measured millimetre by millimetre.',
  },
  {
    id: 'glacier',
    label: 'Glacier Motion',
    color: '#67e8f9',
    icon: 'Snowflake',
    blurb: 'Ice flow velocity, seasonal speed-ups and terminus retreat.',
  },
  {
    id: 'wildfire',
    label: 'Wildfire Burn Scars',
    color: '#fbbf24',
    icon: 'Flame',
    blurb: 'Coherence loss across burn scars and post-fire vegetation recovery.',
  },
  {
    id: 'agriculture',
    label: 'Cropland Dynamics',
    color: '#a78bfa',
    icon: 'Wheat',
    blurb: 'Crop phenology, soil moisture and irrigation-driven ground motion.',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>;

/** Spatial interferogram pattern family rendered by the canvas engine. */
export type InSarPattern = 'bowl' | 'lobes' | 'bullseye' | 'bands' | 'patch' | 'fields' | 'scar';

/** Per-site time-series metric family. */
export type MetricKind = 'displacement' | 'coherence';

export interface SiteModel {
  /** linear rate, cm/yr (LOS-equivalent; − = subsidence / away from satellite) */
  rate?: number;
  /** seasonal amplitude, cm */
  seasonalAmp?: number;
  /** seasonal offset in radians (1 Jan peak = 0) */
  seasonalPhase?: number;
  /** step change: epoch index + amplitude, cm */
  stepEpoch?: number;
  stepAmp?: number;
  /** postseismic log relaxation: total amplitude cm, time constant days */
  postseismicAmp?: number;
  postseismicTau?: number;
  /** sawtooth inflation cycles: cm/day fill rate, days to eruptive deflation, deflation cm */
  sawtoothFill?: number;
  sawtoothPeriod?: number;
  sawtoothDrop?: number;
  /** random-walk noise amplitude, cm */
  noiseAmp?: number;
  /** coherence metric: initial value, drop amount, recovery rate /yr */
  coherence0?: number;
  coherenceDrop?: number;
  coherenceRecovery?: number;
}

export interface SiteInSar {
  pattern: InSarPattern;
  /** spatial fringe density multiplier (lower = wider fringes) */
  fringeScale?: number;
  /** 0–1 — how incoherent the outer scene looks */
  decorrelation?: number;
  /** pattern orientation, degrees */
  angle?: number;
  /** elongation of radial patterns (x stretch) */
  ellipse?: number;
}

export interface Site {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  category: CategoryId;
  /** which radar band carries the signal for this site */
  band: 'L' | 'S' | 'L+S';
  headline: string;
  description: string;
  insight: string;
  stats: { label: string; value: string }[];
  sources: string[];
  model: SiteModel;
  insar: SiteInSar;
  /** suggested map zoom when the site is focused */
  zoom: number;
}

export const SITES: Site[] = [
  {
    id: 'sundarbans',
    name: 'Sundarbans Mangrove Delta',
    region: 'West Bengal · Ganges–Brahmaputra Delta',
    country: 'India / Bangladesh',
    lat: 21.9497,
    lon: 89.1833,
    category: 'wetland',
    band: 'L+S',
    headline: 'The world’s largest mangrove forest is quietly losing ground to the sea.',
    description:
      'Ten thousand square kilometres of tidally flooded mangrove shield 13 million people from cyclones. L-band interferometry tracks slow compaction subsidence of the delta sediments, while S-band and L-band backscatter chart shoreline retreat, tidal-flat exposure and the seasonal monsoon flood pulse.',
    insight:
      'NISAR sees the delta breathing with the monsoon — ±3 cm of hydrological loading — superimposed on a slow settling of the sediments. Fringe patterns fragment along tidal channels where water robs interferometric coherence.',
    stats: [
      { label: 'Mangrove area monitored', value: '≈ 10,000 km²' },
      { label: 'Natural compaction', value: '2 – 8 mm/yr' },
      { label: 'Shoreline retreat (eroding islands)', value: 'up to 15 m/yr' },
    ],
    sources: [
      'Published InSAR & tide-gauge syntheses of Ganges–Brahmaputra delta subsidence (2012–2023)',
      'ISRO NRSC mangrove-cover change assessments',
    ],
    model: {
      rate: -0.45,
      seasonalAmp: 3.0,
      seasonalPhase: -0.6,
      noiseAmp: 0.18,
    },
    insar: { pattern: 'patch', fringeScale: 1.15, decorrelation: 0.5, angle: 12 },
    zoom: 9,
  },
  {
    id: 'pantanal',
    name: 'Pantanal Wetlands',
    region: 'Upper Paraguay River Basin',
    country: 'Brazil',
    lat: -17.8,
    lon: -57.4,
    category: 'wetland',
    band: 'L',
    headline: 'A continental flood pulse — and a record drought — written in radar phase.',
    description:
      'Earth’s largest tropical wetland swells and shrinks by tens of thousands of square kilometres each year. L-band radar penetrates flooded forest canopies to map inundation extent directly, and measures the centimetres of hydrological load the flood puts on the crust.',
    insight:
      'The time series is dominated by the flood pulse: up to ±12 cm of elastic loading between the wet and dry seasons. After the historic 2023–24 drought, NISAR would track how far the wetland recovers — flood extent, soil moisture and surface loading — cycle by cycle.',
    stats: [
      { label: 'Wetland extent', value: '≈ 150,000 km²' },
      { label: 'Seasonal flood amplitude', value: '± 10 – 12 cm loading' },
      { label: '2023–24 drought', value: 'record low flood extent' },
    ],
    sources: [
      'Altimetry & InSAR studies of Pantanal flood-pulse hydrology (2018–2024)',
      'L-band sensitivity to inundated vegetation (JPL field campaigns)',
    ],
    model: {
      rate: -0.8,
      seasonalAmp: 11.0,
      seasonalPhase: 0.9,
      noiseAmp: 0.4,
    },
    insar: { pattern: 'patch', fringeScale: 1.6, decorrelation: 0.45, angle: -20 },
    zoom: 8,
  },
  {
    id: 'okavango',
    name: 'Okavango Delta',
    region: 'Kalahari Basin',
    country: 'Botswana',
    lat: -19.28,
    lon: 22.9,
    category: 'wetland',
    band: 'L+S',
    headline: 'A flood that arrives in the dry season — timed by the radar clock.',
    description:
      'Rains over the Angolan highlands in December become a flood across the Okavango sands in May–July, months later. InSAR-inferred surface loading and inundation mapping capture this lag precisely; NISAR’s 12-day cadence resolves the wave as it spreads across 1,000–6,000 km² of fans and channels.',
    insight:
      'The displacement series rises as the flood wave loads the fan, then relaxes as waters drain — a slow, clean heartbeat that NISAR can watch without a single cloud in the sky. Patchy coherence loss marks permanent swamps and freshly flooded areas.',
    stats: [
      { label: 'Annual flood extent range', value: '1,000 – 6,000 km²' },
      { label: 'Flood lag from highlands', value: '≈ 4 – 5 months' },
      { label: 'Designation', value: 'UNESCO World Heritage & RAMSAR' },
    ],
    sources: [
      'ENVISAT/ALOS InSAR flood-wave studies of the Okavango (2010–2020)',
      'OKACOM basin monitoring reports',
    ],
    model: {
      rate: -0.2,
      seasonalAmp: 7.5,
      seasonalPhase: 1.6,
      noiseAmp: 0.25,
    },
    insar: { pattern: 'patch', fringeScale: 1.35, decorrelation: 0.55, angle: 40 },
    zoom: 8,
  },
  {
    id: 'jakarta',
    name: 'North Jakarta',
    region: 'Java North Coast',
    country: 'Indonesia',
    lat: -6.125,
    lon: 106.83,
    category: 'subsidence',
    band: 'L+S',
    headline: 'One of the fastest-sinking megacities on Earth — up to 25 cm per year.',
    description:
      'Decades of unregulated groundwater extraction have compressed the alluvial layers beneath Jakarta. In parts of the north, ground is falling faster than global sea level rises by an order of magnitude, forcing Indonesia to plan a new capital and giant coastal defences.',
    insight:
      'A tight, circular fringe bullseye with every 12-day pass — each ring is a half-wavelength (≈ 12 cm at L-band) of motion. NISAR’s wide 242 km swath captures the whole megalopolis in one frame, cost-free, every cycle.',
    stats: [
      { label: 'Peak subsidence (published InSAR)', value: '10 – 25 cm/yr' },
      { label: 'Land below +2 m elevation', value: '≈ 40 % of north Jakarta' },
      { label: 'Driver', value: 'groundwater extraction' },
    ],
    sources: [
      'PS-InSAR surveys of Jakarta subsidence, e.g. via ALOS/TerraSAR-X/Sentinel-1 (2011–2023)',
      'Jakarta coastal-defence & NCICD planning studies',
    ],
    model: {
      rate: -13.5,
      seasonalAmp: 0.8,
      noiseAmp: 0.5,
    },
    insar: { pattern: 'bowl', fringeScale: 0.62, decorrelation: 0.3, ellipse: 1.25 },
    zoom: 10,
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    region: 'Valley of Mexico',
    country: 'Mexico',
    lat: 19.43,
    lon: -99.13,
    category: 'subsidence',
    band: 'L+S',
    headline: 'A metropolis drinking its aquifer dry — and sinking up to 40 cm a year.',
    description:
      'Roughly 75 % of the city’s water is pumped from the lacustrine clays beneath it. As pore pressure drops, the desiccated lakebed compacts — permanently. Differential subsidence cracks metro lines, sewers and colonial churches alike, and InSAR maps it building by building.',
    insight:
      'The fringe bowl over the city centre is among the deepest recorded anywhere. NISAR’s L-band separates vertical motion from seasonal aquifer recharge bulging, while S-band sharpens the signal over dense urban roofscape.',
    stats: [
      { label: 'Peak rates (published InSAR)', value: 'up to 40 cm/yr' },
      { label: 'Total historic subsidence', value: '> 9 m since 1900 (central districts)' },
      { label: 'Water from the aquifer', value: '≈ 75 %' },
    ],
    sources: [
      'InSAR studies of Mexico City differential subsidence (e.g. Chaussard et al., 2011–2021 literature)',
      'SACMEX aquifer-management reports',
    ],
    model: {
      rate: -26.0,
      seasonalAmp: 1.8,
      noiseAmp: 0.6,
    },
    insar: { pattern: 'bowl', fringeScale: 0.5, decorrelation: 0.32, ellipse: 0.9 },
    zoom: 10,
  },
  {
    id: 'central-valley',
    name: 'Central Valley — Corcoran Bowl',
    region: 'San Joaquin Valley',
    country: 'United States',
    lat: 36.16,
    lon: -119.56,
    category: 'subsidence',
    band: 'L',
    headline: 'Drought pumping carved a fresh 60-km-wide bowl into America’s salad bowl.',
    description:
      'When surface water is cut off, growers drill deeper. Groundwater withdrawal during California’s droughts deflated the aquifer system near Corcoran by tens of centimetres per year — bending canals, rail lines and the California Aqueduct itself. NASA’s radar campaigns have mapped this bowl for a decade.',
    insight:
      'A broad, elongated fringe bowl — the classic groundwater subsidence fingerprint. L-band’s coherence over irrigated farmland makes NISAR the ideal instrument to link pumping decisions to millimetre-scale ground response within a single water year.',
    stats: [
      { label: 'Peak recent rates', value: '≈ 30 cm/yr (2023–24 drought studies)' },
      { label: 'Total subsidence since 1920s', value: 'up to 8 m locally' },
      { label: 'Infrastructure at risk', value: 'aqueducts, canals, rail' },
    ],
    sources: [
      'NASA/JPL UAVSAR & Sentinel-1 Central Valley subsidence reports (2015–2024)',
      'California DWR InSAR subsidence monitoring programme',
    ],
    model: {
      rate: -21.0,
      seasonalAmp: 1.4,
      seasonalPhase: 0.4,
      noiseAmp: 0.5,
    },
    insar: { pattern: 'bowl', fringeScale: 0.66, decorrelation: 0.28, ellipse: 0.72, angle: 25 },
    zoom: 9,
  },
  {
    id: 'kamchatka',
    name: 'Kamchatka Megathrust Margin',
    region: 'NW Pacific Subduction Zone',
    country: 'Russia',
    lat: 53.15,
    lon: 160.4,
    category: 'seismic',
    band: 'L',
    headline: 'On the very day NISAR launched, Kamchatka was struck by an M8.8 megathrust quake.',
    description:
      '30 July 2025: GSLV-F16 climbs toward orbit; hours earlier the Pacific plate lurched beneath Kamchatka in one of the largest earthquakes of the century. The years that follow belong to postseismic deformation — afterslip on the fault and viscous mantle relaxation — precisely the long, quiet signal NISAR is built to watch.',
    insight:
      'The interferogram shows a broad double-lobed lobe pattern straddling the coast; the time series decays like a logarithm, centimetres in the first months, millimetres per year later. Repeat fringes keep sliding outward as the fault re-cements.',
    stats: [
      { label: 'Event', value: 'M 8.8 — 30 July 2025' },
      { label: 'Postseismic motion expected', value: 'decimetres over 3 yrs' },
      { label: 'Signal type', value: 'afterslip + mantle relaxation' },
    ],
    sources: [
      'USGS/GEUS finite-fault solutions for the 2025 Kamchatka earthquake',
      'Postseismic InSAR geodesy literature for great subduction quakes (2010 Maule, 2011 Tōhoku analogues)',
    ],
    model: {
      postseismicAmp: 9.0,
      postseismicTau: 150,
      noiseAmp: 0.5,
    },
    insar: { pattern: 'lobes', fringeScale: 0.85, decorrelation: 0.35, angle: 55 },
    zoom: 8,
  },
  {
    id: 'svartsengi',
    name: 'Svartsengi — Reykjanes Peninsula',
    region: 'Rift between plates',
    country: 'Iceland',
    lat: 63.89,
    lon: -22.44,
    category: 'volcanic',
    band: 'L',
    headline: 'A magma chamber pumping like a heart — inflate, erupt, deflate, repeat.',
    description:
      'Since 2023 the Svartsengi reservoir has inflated with fresh magma, fed the Sundhnúkur fissures, and deflated — over and over. InSAR bullseyes over the peninsula are among the fastest volcanic signals on the planet, and the cycle continues into NISAR’s era.',
    insight:
      'Each inflation phase paints fresh concentric fringes centred on the reservoir; eruptive episodes wipe them away in days. NISAR’s 12-day cadence samples the cycle like a slow-motion heartbeat monitor — and L-band keeps coherence through steam, fog and fresh basalt.',
    stats: [
      { label: 'Eruptions since Dec 2023', value: 'a dozen episodes' },
      { label: 'Inflation rate', value: 'up to 4 cm/month' },
      { label: 'Protected infrastructure', value: 'Svartsengi geothermal plant, Grindavík' },
    ],
    sources: [
      'Icelandic Met Office / Univ. of Iceland InSAR & GNSS deformation bulletins (2023–2025)',
      'Sentinel-1 interferograms of the Sundhnúkur eruption sequence',
    ],
    model: {
      sawtoothFill: 0.11,
      sawtoothPeriod: 66,
      sawtoothDrop: 6.4,
      noiseAmp: 0.3,
    },
    insar: { pattern: 'bullseye', fringeScale: 0.8, decorrelation: 0.25 },
    zoom: 11,
  },
  {
    id: 'columbia-glacier',
    name: 'Columbia Glacier',
    region: 'Chugach Mountains, Alaska',
    country: 'United States',
    lat: 61.16,
    lon: -147.0,
    category: 'glacier',
    band: 'L',
    headline: 'A tidewater glacier in full retreat — flowing up to 12 metres per day.',
    description:
      'Columbia has retreated over 20 km since the 1980s, one of the fastest tidewater-glacier collapses ever documented. Interferometric phase and pixel-offset tracking recover its ferocious ice velocities; L-band’s long wavelength stays coherent over fast, heavily crevassed ice where shorter radars fail.',
    insight:
      'Dense fringe bands across the lower glacier: every band is ≈ 12 cm of motion toward the satellite, stacked thousands of times over a 12-day pass. The spacing breathes with the seasons — ice speeds up in summer melt.',
    stats: [
      { label: 'Ice velocity near terminus', value: 'up to 12 m/day' },
      { label: 'Retreat since 1980s', value: '> 20 km' },
      { label: 'Technique', value: 'InSAR + offset tracking' },
    ],
    sources: [
      'ALOS PALSAR / UAVSAR velocity mosaics of Columbia Glacier (2009–2023)',
      'Tidewater glacier dynamics literature (e.g. Pfeffer, O’Neel)',
    ],
    model: {
      rate: -58.0,
      seasonalAmp: 9.0,
      seasonalPhase: -0.5,
      noiseAmp: 1.2,
    },
    insar: { pattern: 'bands', fringeScale: 0.5, decorrelation: 0.4, angle: 100 },
    zoom: 10,
  },
  {
    id: 'gangotri',
    name: 'Gangotri Glacier',
    region: 'Garhwal Himalaya',
    country: 'India',
    lat: 30.93,
    lon: 79.08,
    category: 'glacier',
    band: 'L',
    headline: 'The source of the Ganges, flowing 25 metres a year through the High Himalaya.',
    description:
      'One of the largest glaciers in Asia feeds the Bhagirathi headwater of the Ganges. Steep, debris-covered ice at 4,000 m is a hard target for optical methods — cloud, shadow and debris defeat them — but L-band interferometry measures its flow through all weather, all year.',
    insight:
      'Fringe bands along the flowline show steady creep with a summer surge from meltwater lubrication. NISAR’s S-band adds seasonal snow-zone observations, giving Indian scientists an annual health check on a glacier sacred to a billion people.',
    stats: [
      { label: 'Length', value: '≈ 30 km' },
      { label: 'Surface velocity', value: '20 – 35 m/yr' },
      { label: 'Feeds', value: 'Ganges headwater (Bhagirathi)' },
    ],
    sources: [
      'ISRO/NRSC & ALOS InSAR velocity studies of Gangotri (2013–2024)',
      'Himalayan glacier mass-balance syntheses (e.g. ICIMOD 2023)',
    ],
    model: {
      rate: -21.0,
      seasonalAmp: 3.2,
      seasonalPhase: -0.5,
      noiseAmp: 0.6,
    },
    insar: { pattern: 'bands', fringeScale: 0.7, decorrelation: 0.42, angle: 115 },
    zoom: 10,
  },
  {
    id: 'eaton',
    name: 'Eaton Burn Scar',
    region: 'San Gabriel Mountains, California',
    country: 'United States',
    lat: 34.2,
    lon: -117.98,
    category: 'wildfire',
    band: 'L+S',
    headline: 'January 2025 wildfire near Los Angeles — a burn scar NISAR watches heal.',
    description:
      'The Eaton Fire scorched chaparral slopes above Altadena in January 2025. Radar coherence collapses where flames stripped the vegetation; as chaparral regrows through NISAR’s mission, coherence and backscatter climb back — a quantitative recovery curve for fire management.',
    insight:
      'The interferogram goes dark and speckled inside the scar — the surface changed too much between passes to interfere. Outside, clean fringes. Watch the coherent fraction tick upward each cycle as roots stabilise the soil before the winter rains.',
    stats: [
      { label: 'Burned area', value: '≈ 57 km²' },
      { label: 'Coherence at burn', value: 'drops > 0.5' },
      { label: 'Hazard monitored', value: 'debris flows in rain events' },
    ],
    sources: [
      'CAL FIRE incident records (Eaton Fire, Jan 2025)',
      'Post-fire SAR coherence & backscatter recovery studies (2018–2024 literature)',
    ],
    model: {
      coherence0: 0.86,
      coherenceDrop: 0.52,
      coherenceRecovery: 0.2,
      noiseAmp: 0.02,
    },
    insar: { pattern: 'scar', fringeScale: 1.0, decorrelation: 0.75, angle: 35 },
    zoom: 10,
  },
  {
    id: 'chios',
    name: 'Chios Island Burn Scar',
    region: 'Eastern Aegean',
    country: 'Greece',
    lat: 38.35,
    lon: 26.05,
    category: 'wildfire',
    band: 'S',
    headline: 'An August 2025 firestorm consumed mastic groves and maquis — mid-mission.',
    description:
      'Summer 2025 brought fierce fires to the Greek islands; on Chios, flame fronts crossed the coastal maquis and ancient mastic orchards within days of a NISAR pass. The mission’s before/after interferometric pairs capture the scar at its freshest, then track Mediterranean regrowth.',
    insight:
      'Coherence falls off a cliff at the fire epoch and recovers slowly — faster for herbaceous maquis than for woody orchards. S-band is exquisitely sensitive to this leafy regrowth; L-band keeps watch on the underlying terrain for flood-and-slide hazards.',
    stats: [
      { label: 'Fire window', value: 'August 2025 (within mission)' },
      { label: 'Recovery signature', value: 'coherence regrowth curve' },
      { label: 'Ecosystem', value: 'maquis + mastic orchards' },
    ],
    sources: [
      'Copernicus EMS & European Forest Fire Information System (EFFIS) records, 2025',
      'Mediterranean post-fire SAR recovery literature',
    ],
    model: {
      coherence0: 0.83,
      coherenceDrop: 0.45,
      coherenceRecovery: 0.26,
      noiseAmp: 0.025,
    },
    insar: { pattern: 'scar', fringeScale: 1.0, decorrelation: 0.68, angle: -30 },
    zoom: 10,
  },
  {
    id: 'punjab',
    name: 'Punjab Rice–Wheat Belt',
    region: 'Indo-Gangetic Plain',
    country: 'India',
    lat: 31.1,
    lon: 75.4,
    category: 'agriculture',
    band: 'S',
    headline: 'Two harvests a year, fed by falling groundwater — a signal in both bands.',
    description:
      'Punjab grows the rice that fills India’s granaries in monsoon, then wheat in winter, pumping groundwater to do it. S-band backscatter tracks crop emergence, heading and harvest with millimetric sensitivity to canopy structure; L-band adds soil moisture beneath the stubble.',
    insight:
      'The time series oscillates with the double-crop calendar — soil-moisture bulking after irrigation, consolidation after harvest — on top of a slow drawdown signal. Field-scale interferogram patches flip coherence with every sowing and harvest.',
    stats: [
      { label: 'Cropping', value: 'rice–wheat double season' },
      { label: 'Water-table trend', value: '− 0.4 – 0.6 m/yr in central districts' },
      { label: 'Population fed', value: 'rice-wheat system sustains hundreds of millions' },
    ],
    sources: [
      'ISRO NRSC & ICAR crop-monitoring SAR studies (2016–2024)',
      'Central Ground Water Board assessments, Punjab',
    ],
    model: {
      rate: -1.9,
      seasonalAmp: 1.7,
      seasonalPhase: -0.3,
      noiseAmp: 0.25,
    },
    insar: { pattern: 'fields', fringeScale: 0.9, decorrelation: 0.35, angle: 8 },
    zoom: 9,
  },
  {
    id: 'iowa',
    name: 'Iowa Corn Belt',
    region: 'Des Moines Lobe',
    country: 'United States',
    lat: 41.9,
    lon: -93.6,
    category: 'agriculture',
    band: 'L+S',
    headline: 'Soil moisture swelling under the world’s richest farmland — ± 3 cm each season.',
    description:
      'Across the Des Moines Lobe, prairie soils drink spring rain and drain through summer, loading and unloading the ground by a few centimetres. NISAR turns that hydrology into a measurable signal — and samples every field, every 12 days, through cloud and night.',
    insight:
      'A clean annual sinusoid in the displacement series, phase-locked to the water year. Field-grid interferogram patches brighten and fade as the canopy grows, showing exactly why S-band loves young leaves and L-band waits beneath.',
    stats: [
      { label: 'Row-crop area (state)', value: '≈ 120,000 km²' },
      { label: 'Seasonal hydrological signal', value: '± 2 – 3 cm' },
      { label: 'Revisit', value: 'every 12 days, both bands' },
    ],
    sources: [
      'USDA NASS cropland data & SMAP hydrology cross-references',
      'InSAR seasonal soil-loading studies over agricultural plains',
    ],
    model: {
      rate: -0.1,
      seasonalAmp: 2.9,
      seasonalPhase: 0.2,
      noiseAmp: 0.2,
    },
    insar: { pattern: 'fields', fringeScale: 1.05, decorrelation: 0.3, angle: -14 },
    zoom: 9,
  },
];

export const SITE_MAP: Record<string, Site> = Object.fromEntries(SITES.map((s) => [s.id, s]));
