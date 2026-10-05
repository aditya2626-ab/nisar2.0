# NISAR PULSE — An Interactive Atlas of Earth's Changing Surface

An interactive observatory for the **NASA–ISRO Synthetic Aperture Radar (NISAR)** mission. Explore 14 global study sites — subsiding megacities, wandering glaciers, waking volcanoes, burn scars and breathing wetlands — tracked every 12 days with L-band and S-band interferometry. Built with Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Prisma + SQLite, and Leaflet.

> ⚠️ The InSAR time-series and interferogram products rendered by this app are **representative simulations** calibrated to published rates — designed to be swappable with real NISAR L2 products from ASF DAAC / Bhoonidhi.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Step-by-Step Setup](#step-by-step-setup)
6. [Available Scripts](#available-scripts)
7. [Project Structure](#project-structure)
8. [Environment Variables](#environment-variables)
9. [Production Build](#production-build)
10. [Optional: Caddy Reverse Proxy](#optional-caddy-reverse-proxy)
11. [Troubleshooting](#troubleshooting)
12. [License](#license)

---

## Features

- 🛰️ **Live mission clock** — elapsed time (MET), orbit number, downlink volume estimate and current 12-day acquisition cycle, recomputed on every request.
- 🌍 **Interactive Leaflet map** — Esri World Imagery basemap with pulsing site markers, illustrative 242 km swath polygon, and a satellite fly-along animation during epoch playback.
- 📈 **InSAR time-series** — 40 × 12-day mission epochs (12 Aug 2025 → Nov 2026), scrub-on-click chart with scheduled-event shading.
- 🌈 **Canvas interferogram renderer** — per-pixel phase fields for bowl, bullseye, lobes, bands, patch, fields and scar patterns, with HSV fringe colormap + sequential unwrapped ramp.
- 🗂️ **14 study sites** across 7 categories — wetland, ground subsidence, seismic deformation, volcanic unrest, glacier dynamics, wildfire burn scars, and agriculture.
- 📡 **REST API** — `/api/sites` (catalogue) and `/api/telemetry` (live mission clock).
- 🌙 **Fixed dark observatory theme** — radar-sweep, blip, starfield and marquee animations.

---

## Tech Stack

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| Framework        | Next.js 16 (App Router, `output: "standalone"`)       |
| UI Library       | React 19, shadcn/ui (new-york), Radix UI primitives    |
| Styling          | Tailwind CSS 4, `tailwindcss-animate`, `tw-animate-css`|
| Maps             | Leaflet 1.9                                            |
| Charts           | Recharts 2.15                                          |
| Animations       | Framer Motion 12                                       |
| Database         | Prisma 6 + SQLite (`@prisma/client`)                  |
| Package Manager  | Bun (lockfile: `bun.lock`)                             |
| Language         | TypeScript 5                                           |
| AI SDK (optional)| `z-ai-web-dev-sdk`                                     |

---

## Prerequisites

Make sure your system has the following installed and available on your `PATH`:

| Tool       | Minimum Version | Why                                         | Install Link                                                       |
| ---------- | --------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| **Bun**    | 1.1+            | Package manager + runtime (matches lockfile)| https://bun.sh/docs/installation                                   |
| **Node.js**| 18.18+          | Required by Next.js 16 build/runtime        | https://nodejs.org/en/download                                     |
| **Git**    | 2.20+           | Clone the repository                        | https://git-scm.com/downloads                                      |

> 💡 **Prefer Bun over npm/yarn/pnpm** — the repo ships a `bun.lock`, so installing with Bun guarantees the exact dependency versions the project was built and tested with. Node-only installs will work but may resolve slightly different sub-dependency versions.

Verify your installation:

```bash
bun --version    # e.g. 1.1.34
node --version   # e.g. v20.18.0
git --version    # e.g. 2.43.0
```

---

## Quick Start

If you just want it running in 60 seconds:

```bash
# 1. Clone
git clone https://github.com/aditya2626-ab/nisar2.0.git
cd nisar2.0

# 2. Install dependencies
bun install

# 3. Configure the database URL (SQLite file)
echo 'DATABASE_URL="file:./db/custom.db"' > .env

# 4. Initialise the SQLite schema
bun run db:generate
bun run db:push

# 5. Start the dev server
bun run dev
```

Open **http://localhost:3000** in your browser. You should see the NISAR PULSE observatory with a dark theme, radar-sweep hero, and a live mission-clock chip in the header.

---

## Step-by-Step Setup

### 1. Clone the repository

```bash
git clone https://github.com/aditya2626-ab/nisar2.0.git
cd nisar2.0
```

### 2. Install dependencies

Using **Bun** (recommended — matches the shipped lockfile):

```bash
bun install
```

Alternatively, with npm / pnpm / yarn (results may differ slightly):

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the project root. The only required variable is `DATABASE_URL`, which must be a **SQLite file URL** (Prisma `sqlite` provider):

```bash
# .env
DATABASE_URL="file:./db/custom.db"
```

Notes:
- The path after `file:` is **relative to the project root** (where `prisma/schema.prisma` lives).
- Use an absolute path if you want the database in a fixed location outside the repo, e.g. `file:/home/youruser/nisar-data/custom.db`.
- The repo already ships a starter SQLite file at `db/custom.db`, so if you skip `db:push` the app will still boot — but running `db:push` guarantees the schema matches `prisma/schema.prisma`.

### 4. Generate the Prisma client & sync the schema

```bash
bun run db:generate   # generates @prisma/client into node_modules/.prisma
bun run db:push       # creates/migrates the SQLite file to match schema.prisma
```

If you ever change `prisma/schema.prisma`, re-run both commands.

### 5. Run the development server

```bash
bun run dev
```

This runs `next dev -p 3000` and tees output to `dev.log`. The dev server is hot-reloaded — edit any file under `src/` and the browser will refresh automatically.

Open **http://localhost:3000**.

### 6. Verify the API routes

In a separate terminal:

```bash
curl http://localhost:3000/api/sites       # site catalogue + categories
curl http://localhost:3000/api/telemetry   # live mission clock (MET, orbit #, cycle)
curl http://localhost:3000/api             # health check → {"message":"Hello, world!"}
```

---

## Available Scripts

Defined in `package.json`:

| Script             | Command                                                        | Purpose                                                              |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `dev`              | `next dev -p 3000`                                            | Start the hot-reloading dev server on port 3000                      |
| `build`            | `next build` + copy `.next/static` and `public` into standalone | Produce a self-contained production build under `.next/standalone`   |
| `start`            | `NODE_ENV=production bun .next/standalone/server.js`          | Run the production server (after `build`)                           |
| `lint`             | `eslint .`                                                    | Run ESLint across the codebase                                       |
| `db:generate`      | `prisma generate`                                             | Regenerate the Prisma Client (after schema changes)                  |
| `db:push`          | `prisma db push --accept-data-loss`                          | Push the schema to the SQLite file (no migration history)            |
| `db:migrate`       | `prisma migrate dev`                                          | Create & apply a migration (dev mode, with history)                 |
| `db:reset`         | `prisma migrate reset`                                        | Drop & recreate the database (⚠️ destructive)                       |

Run any of them with `bun run <script>` (or `npm run <script>`).

---

## Project Structure

```
nisar2.0/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── route.ts            # GET /  → health check
│   │   │   ├── sites/route.ts     # GET /api/sites  → catalogue
│   │   │   └── telemetry/route.ts # GET /api/telemetry → mission clock
│   │   ├── layout.tsx             # Root layout, dark theme, fonts, Toaster
│   │   ├── page.tsx               # Home page composition
│   │   └── globals.css            # Dark observatory theme + animations
│   ├── components/
│   │   ├── nisar/                 # Domain components
│   │   │   ├── header.tsx, hero.tsx, observatory.tsx,
│   │   │   ├── site-map.tsx, site-panel.tsx, interferogram.tsx,
│   │   │   ├── insar-science.tsx, mission-facts.tsx,
│   │   │   ├── data-access.tsx, footer.tsx, theme-provider.tsx,
│   │   │   └── category-icon.tsx
│   │   └── ui/                    # shadcn/ui primitives (50+ components)
│   ├── hooks/                     # use-mobile, use-toast
│   └── lib/
│       ├── db.ts                  # Prisma client singleton
│       ├── utils.ts               # cn() helper
│       └── nisar/
│           ├── model.ts           # InSAR engine: epochs, telemetry, phase fields
│           └── sites.ts           # 14 study sites + 7 categories
├── prisma/
│   └── schema.prisma              # User + Post models, sqlite datasource
├── db/
│   └── custom.db                  # Starter SQLite file (committed)
├── public/
│   ├── logo.svg
│   └── robots.txt
├── scripts/                       # Browser-verification screenshots
├── examples/
│   └── websocket/                 # frontend.tsx + server.ts (optional WS demo)
├── tests/                         # Runtime build sanity scripts
├── .env                           # DATABASE_URL — create if missing
├── Caddyfile                      # Optional reverse proxy (port 81 → 3000)
├── next.config.ts                 # output: "standalone"
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── components.json                # shadcn/ui config (new-york style)
└── package.json
```

---

## Environment Variables

| Variable        | Required | Default | Description                                              |
| --------------- | -------- | ------- | -------------------------------------------------------- |
| `DATABASE_URL`  | ✅ Yes   | —       | SQLite file URL, e.g. `file:./db/custom.db`              |
| `NODE_ENV`      | ❌ No    | `development` | Set to `production` by `bun run start`             |

No third-party API keys (no NEXTAUTH_SECRET, no map tile API key — Leaflet uses the free Esri World Imagery basemap). If you want to swap in real NISAR data via the `z-ai-web-dev-sdk` or another provider later, add the relevant keys here as well.

---

## Production Build

This project uses Next.js's [`standalone` output mode](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), which bundles a minimal Node/Bun server into `.next/standalone/`.

```bash
# 1. Build (compiles + copies static assets & public/ into standalone)
bun run build

# 2. Run the standalone production server on port 3000
bun run start
```

The build also runs `cp -r .next/static .next/standalone/.next/` and `cp -r public .next/standalone/` so the standalone folder is fully self-contained and can be copied to another machine (with Bun installed) and run directly:

```bash
# On a target server:
cd .next/standalone
NODE_ENV=production bun server.js
```

---

## Optional: Caddy Reverse Proxy

A `Caddyfile` is included that proxies port `81` → `localhost:3000`, with an extra `XTransformPort` query-param route for dynamic upstreams:

```bash
# Install Caddy: https://caddyserver.com/docs/install
caddy run --config ./Caddyfile
```

Then visit **http://localhost:81**. This is optional — most users will run `bun run dev` and use port 3000 directly.

---

## Troubleshooting

### `Error: `DATABASE_URL` environment variable is missing or empty`
You forgot to create `.env`. Run:
```bash
echo 'DATABASE_URL="file:./db/custom.db"' > .env
```

### `PrismaClientInitializationError: Can't reach database server`
The path in `DATABASE_URL` doesn't exist or isn't writable. Either:
- Use a relative path: `file:./db/custom.db` (the `db/` folder is committed).
- Use an absolute path to a writable location: `file:/home/youruser/nisar/custom.db`.
- Then re-run `bun run db:push`.

### Leaflet map shows "API KEY REQUIRED" watermarks
This was fixed in the latest commit by switching the labels layer to **Esri World_Boundaries_and_Places**. If you see it again, you've checked out an older commit — `git pull` or check `src/components/nisar/site-map.tsx`.

### Hydration mismatch on epoch dates
The model is intentionally UTC-deterministic (`fmtDateUTC`). If you see hydration warnings, make sure you haven't introduced `new Date()` calls inside server components — always go through the helpers in `src/lib/nisar/model.ts`.

### `bun install` is slow or fails on `sharp`
`sharp` ships prebuilt binaries; if your platform lacks a prebuild, Bun will try to compile from source and needs `python3` + `make` + `g++`. On Debian/Ubuntu:
```bash
sudo apt-get install -y python3 make g++
```

### Port 3000 is already in use
Either kill the existing process:
```bash
# Linux/macOS
lsof -i :3000
kill -9 <PID>
```
…or start the dev server on a different port:
```bash
bunx next dev -p 3001
```

### Build fails with TypeScript errors
`next.config.ts` sets `typescript.ignoreBuildErrors: true`, so the build will succeed even with type errors. For local type-checking, run:
```bash
bunx tsc --noEmit
```

---

## License

This project is provided as-is for educational and hackathon (NASA Space Apps Challenge) purposes. The NISAR mission is a joint NASA–ISRO endeavour; all mission facts referenced here are drawn from public NASA/ISRO press material. The InSAR time-series and interferogram visualisations are **simulated** and calibrated to published rates — they are NOT raw mission data.
