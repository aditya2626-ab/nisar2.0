import { NextResponse } from 'next/server';
import { SITES, CATEGORIES } from '@/lib/nisar/sites';
import { MISSION, metricKind } from '@/lib/nisar/model';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sites
 * Site catalogue + category metadata for the observatory client.
 */
export async function GET() {
  return NextResponse.json({
    mission: {
      name: MISSION.name,
      launchISO: MISSION.launchISO,
      firstEpochISO: MISSION.firstEpochISO,
      epochDays: MISSION.epochDays,
      epochCount: MISSION.epochCount,
      orbitAltKm: MISSION.orbitAltKm,
      swathKm: MISSION.swathKm,
      lambdaL: MISSION.lambdaL,
      lambdaS: MISSION.lambdaS,
    },
    categories: CATEGORIES,
    sites: SITES.map((s) => ({
      id: s.id,
      name: s.name,
      region: s.region,
      country: s.country,
      lat: s.lat,
      lon: s.lon,
      category: s.category,
      band: s.band,
      headline: s.headline,
      zoom: s.zoom,
      metric: metricKind(s),
    })),
    generatedAt: new Date().toISOString(),
  });
}
