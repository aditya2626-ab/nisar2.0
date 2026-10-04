'use client';

import {
  Waves,
  ArrowDownToDot,
  Activity,
  Mountain,
  Snowflake,
  Flame,
  Wheat,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId } from '@/lib/nisar/sites';

const ICONS: Record<CategoryId, LucideIcon> = {
  wetland: Waves,
  subsidence: ArrowDownToDot,
  seismic: Activity,
  volcanic: Mountain,
  glacier: Snowflake,
  wildfire: Flame,
  agriculture: Wheat,
};

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className} aria-hidden />;
}
