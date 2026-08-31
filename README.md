# 🐟 Mullet Watch NEFL

A mobile-first web app that scores the **fall mullet run** opportunity for
Northeast Florida beaches — **Mickler's Landing** (prioritized), Jacksonville
Beach, Mayport, and St. Augustine Beach.

It pulls **free public data** and blends it with your own sightings into a
transparent **0–100 opportunity score**:

- **Wind & air temp** — [National Weather Service API](https://www.weather.gov/documentation/services-web-api) (`api.weather.gov`)
- **Tides** — [NOAA CO-OPS](https://api.tidesandcurrents.noaa.gov/api/prod/) high/low predictions
- **Buoys** — [NDBC](https://www.ndbc.noaa.gov/) real-time wind, water temp, and waves
- **Sightings** — logged manually by you (beach, time, school size, notes)

For each beach the app shows the current conditions, a plain-English **"why"**
behind the score, and the **next best window**, plus a map, a recent-sightings
list, and an alert-rules table for future notifications.

> No paid services are used. NWS, CO-OPS, and NDBC are free/no-key. Supabase and
> Vercel run on their free tiers. Map tiles are free OpenStreetMap.

---

## How the score works

A weighted blend of six factors, each a 0–1 quality figure × its weight
(all pure functions in [`src/lib/score.ts`](src/lib/score.ts)):

| Factor              | Weight | What it rewards |
| ------------------- | -----: | --------------- |
| Season window       | 22 | Proximity to the mid/late-October run peak |
| Wind direction      | 20 | NE (45°) is ideal; N/E decent; onshore-S/offshore-W poor |
| Recent NE pattern   | 16 | Share of recent buoy hours blowing out of the NE |
| Tide stage          | 15 | Moving water (falling best, then rising); slack is weaker |
| Recent sightings    | 15 | Recency- and size-weighted reports, this beach + nearby |
| Wind speed          | 12 | Moderate 10–17 kt best; calm or blown-out poor |

The **next best window** re-scores the NWS hourly forecast against the tide
timeline for the next ~48 h and reports the highest contiguous stretch.

Missing data (e.g. an offline buoy) degrades gracefully — the affected factor
uses a neutral value, and the score is still computed from what's available.

---

## Tech stack

- **Next.js 14 (App Router) + TypeScript**
- **Tailwind CSS** (mobile-first)
- **Supabase** (Postgres + RLS) for beaches, sightings, alert rules, cache
- **React-Leaflet + OpenStreetMap** for the map (no API key)
- Deploys to **Vercel** with a built-in hourly **cron** refresh

---

## Local setup

Requirements: Node 18.18+ (Node 20/22 recommended).

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# .env.example already contains the public Supabase URL + anon key this project
# was scaffolded against, so it runs as-is. Swap in your own project to fork it.

# 3. Run
npm run dev
# open http://localhost:3000
```

Useful scripts:

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

---

## Connecting Supabase

The app talks to Supabase entirely through server code, so the browser only
ever sees the public anon key (protected by Row Level Security).

### Environment variables

| Variable | Required | Purpose |
| -------- | :------: | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (safe in the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Server-only key; enables writing the conditions cache from the cron job |
| `CRON_SECRET` | optional | Protects `/api/refresh`; Vercel Cron sends it automatically |
| `NWS_USER_AGENT` | optional | Contact string sent to `api.weather.gov` per their etiquette |

### Database schema

The schema lives in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
Tables are namespaced with `mw_` so they can share a project with other apps:

- `mw_beaches` — target beaches (seeded; Mickler's priority 100)
- `mw_sightings` — manual sighting reports
- `mw_alert_rules` — notification rules (seeded with examples)
- `mw_conditions_cache` — optional cache written by the refresh job

To apply it to your **own** project, paste the SQL into the Supabase SQL
Editor, or use the Supabase CLI:

```bash
supabase db push   # with the migration in supabase/migrations/
```

**Row Level Security** is enabled on every table:

- Public **read** on all tables.
- Public **insert** on `mw_sightings` only (so the MVP works with just the anon
  key). This is a deliberate MVP trade-off — for production, add auth or move
  sighting writes behind the service-role key and tighten this policy.
- All other writes require the service-role key (server-side only).

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo. The defaults are correct
   (Framework: Next.js, Build: `next build`).
3. Add the environment variables from the table above under
   **Settings → Environment Variables** (Production + Preview).
4. **Deploy.** No code changes are needed.

### Cron refresh

[`vercel.json`](vercel.json) registers an hourly cron hitting `/api/refresh`:

```json
{ "crons": [{ "path": "/api/refresh", "schedule": "0 * * * *" }] }
```

On deploy, Vercel picks this up automatically (Hobby plan allows daily crons;
Pro allows this hourly schedule — adjust the cron expression if needed). Set
`CRON_SECRET` and Vercel will send it as a bearer token so only Vercel can
trigger the refresh. The route recomputes and caches every beach's conditions
and evaluates the alert rules, returning which rules *would* fire.

You can call it manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-app>/api/refresh
```

---

## API routes

| Route | Method | Description |
| ----- | ------ | ----------- |
| `/api/conditions?beach=<id>` | GET | Full conditions, score breakdown, and next window for one beach |
| `/api/summaries` | GET | Score summary for every beach (map + list) |
| `/api/beaches` | GET | Beach list |
| `/api/sightings` | GET / POST | List recent sightings / log a new one |
| `/api/alert-rules` | GET | Alert rules |
| `/api/refresh` | GET | Cron-ready refresh (recompute + cache + evaluate alerts) |

---

## Tuning

- **Beaches & stations** — edit `mw_beaches` rows (or the fallback in
  [`src/lib/beaches.ts`](src/lib/beaches.ts)). Tide (`tide_station`) and buoy
  (`buoy_station`) IDs are approximate nearest stations and can be refined.
- **Scoring weights** — `WEIGHTS` in [`src/lib/score.ts`](src/lib/score.ts).
- **Season curve** — `seasonFactor` in the same file (Gaussian centered ~Oct 20).

## Roadmap

- Wire a notification channel (email/SMS/push) to act on triggered alert rules.
- Auth for trusted sighting contributors.
- Historical score charts and catch logging.

---

Public data courtesy of NWS, NOAA CO-OPS, and NDBC. Scores are heuristics, not a
guarantee — always check conditions yourself and fish responsibly.
