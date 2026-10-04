import { NextResponse } from 'next/server';
import { MISSION, missionTelemetry, latestAcquiredEpoch, EPOCHS } from '@/lib/nisar/model';

export const dynamic = 'force-dynamic';

/**
 * GET /api/telemetry
 * Live mission clock: elapsed time, orbit number, downlink volume estimate
 * and the current 12-day acquisition cycle. Recomputed on every request.
 */
export async function GET() {
  const t = missionTelemetry();
  const epoch = latestAcquiredEpoch();
  return NextResponse.json({
    ...t,
    currentEpoch: epoch,
    currentEpochLabel: EPOCHS[epoch].label,
    platform: {
      altitudeKm: MISSION.orbitAltKm,
      periodMin: MISSION.periodMin,
      swathKm: MISSION.swathKm,
      bands: { L: '1.257 GHz (NASA/JPL)', S: '3.2 GHz (ISRO)' },
      antennaM: MISSION.antennaM,
    },
    serverTimeISO: new Date().toISOString(),
  });
}
