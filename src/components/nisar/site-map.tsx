'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORY_MAP, type Site } from '@/lib/nisar/sites';

interface SiteMapProps {
  sites: Site[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  playing: boolean;
}

const SAT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/></svg>`;

/** Ascending-track heading (deg east of north) for the illustrative swath. */
const TRACK_DEG = -12;

function swathCorners(lat: number, lon: number) {
  const a = (TRACK_DEG * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = Math.cos(a);
  const halfLen = 4.6; // deg along track
  const halfW = 1.15; // deg across track (~242 km at these latitudes, illustrative)
  const px = -dy;
  const py = dx;
  return [
    [lat + dx * halfLen + px * halfW, lon + dy * halfLen + py * halfW],
    [lat + dx * halfLen - px * halfW, lon + dy * halfLen - py * halfW],
    [lat - dx * halfLen - px * halfW, lon - dy * halfLen - py * halfW],
    [lat - dx * halfLen + px * halfW, lon - dy * halfLen + py * halfW],
  ] as L.LatLngTuple[];
}

export default function SiteMap({ sites, selectedId, onSelect, playing }: SiteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const swathRef = useRef<L.Polygon | null>(null);
  const satRef = useRef<L.Marker | null>(null);
  const swathCenterRef = useRef<L.LatLngTuple | null>(null);
  const rafRef = useRef<number>(0);
  const firstRunRef = useRef<boolean>(true);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  /* ---------------- init ---------------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [24, 42],
      zoom: 2.25,
      zoomSnap: 0.25,
      minZoom: 2,
      maxZoom: 13,
      zoomControl: false,
      worldCopyJump: true,
      scrollWheelZoom: false,
    });
    L.control.zoom({ position: 'topright' }).addTo(map);
    mapRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution:
        'Imagery &copy; Esri, Maxar, Earthstar Geographics &mdash; InSAR overlays simulated',
      maxZoom: 13,
    }).addTo(map);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Labels &copy; Esri',
        opacity: 0.85,
        maxZoom: 13,
        pane: 'shadowPane',
      },
    ).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);

    // satellite glyph marker (hidden unless playing)
    const satIcon = L.divIcon({
      className: '',
      html: `<div class="sat-icon">${SAT_SVG}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
    satRef.current = L.marker([0, 0], { icon: satIcon, interactive: false, zIndexOffset: 1000 });
    satRef.current.addTo(map);
    const el = satRef.current.getElement();
    if (el) el.style.opacity = '0';

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    const settle = setTimeout(() => map.invalidateSize(), 150);

    return () => {
      ro.disconnect();
      clearTimeout(settle);
      cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      swathRef.current = null;
      satRef.current = null;
    };
  }, []);

  /* ---------------- markers (filtered sites) ---------------- */
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markersRef.current.clear();

    for (const s of sites) {
      const cat = CATEGORY_MAP[s.category];
      const icon = L.divIcon({
        className: '',
        html: `<div class="nisar-marker" style="--c:${cat.color}"><span class="nisar-dot"></span></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const m = L.marker([s.lat, s.lon], { icon, title: s.name, keyboard: true, riseOnHover: true });
      m.bindPopup(
        `<strong>${s.name}</strong><br/>` +
          `<span style="color:oklch(0.68 0.02 200)">${s.region}, ${s.country}</span><br/>` +
          `<span style="color:${cat.color};font-size:15px">&#9679;</span> ${cat.label}` +
          ` &middot; ${s.band}-band signal`,
        { closeButton: true },
      );
      m.on('click', () => onSelectRef.current(s.id));
      m.addTo(layer);
      markersRef.current.set(s.id, m);
    }
  }, [sites]);

  /* ---------------- selection highlight + fly-to + swath ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, m] of markersRef.current) {
      m.getElement()?.classList.toggle('is-selected', id === selectedId);
    }

    const site = sites.find((s) => s.id === selectedId);
    if (!site) {
      swathRef.current?.remove();
      swathRef.current = null;
      swathCenterRef.current = null;
      return;
    }

    const isFirstRun = firstRunRef.current;
    firstRunRef.current = false;

    swathCenterRef.current = [site.lat, site.lon];
    if (swathRef.current) swathRef.current.remove();
    swathRef.current = L.polygon(swathCorners(site.lat, site.lon), {
      color: '#2dd4bf',
      weight: 1.2,
      dashArray: '7 7',
      className: 'swath-outline',
      fillColor: '#2dd4bf',
      fillOpacity: 0.07,
      interactive: true,
    }).addTo(map);
    swathRef.current.bindTooltip('NISAR ascending pass &middot; 242 km swath (illustrative)', {
      className: 'nisar-tooltip',
      direction: 'top',
      offset: [0, -6],
    });

    if (!isFirstRun) {
      map.flyTo([site.lat, site.lon], site.zoom, { duration: 1.15 });
    } else {
      map.setView([site.lat, site.lon], Math.max(3.25, map.getZoom()), { animate: true });
    }
  }, [selectedId]);

  /* ---------------- satellite fly-along while playing ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    const sat = satRef.current;
    if (!map || !sat) return;

    const el = sat.getElement();
    if (!playing) {
      if (el) el.style.opacity = '0';
      cancelAnimationFrame(rafRef.current);
      return;
    }
    if (el) el.style.opacity = '1';

    const start = performance.now();
    const span = 8.2; // deg covered during the loop
    const tick = (t: number) => {
      const c = swathCenterRef.current;
      if (c && mapRef.current) {
        const p = ((t - start) % 9500) / 9500;
        const a = (TRACK_DEG * Math.PI) / 180;
        const dx = Math.sin(a);
        const dy = Math.cos(a);
        const k = (p - 0.5) * span;
        sat.setLatLng([c[0] + dx * k, c[1] + dy * k]);
        if (el) el.style.opacity = String(0.35 + 0.65 * Math.abs(p - 0.5) * 2);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="World map of NISAR study sites"
    />
  );
}
