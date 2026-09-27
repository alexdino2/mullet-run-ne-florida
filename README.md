# 🐟 Florida Mullet Run

A mobile-first web app for [floridamulletrun.com](https://floridamulletrun.com)
that scores the **fall mullet run** on both Florida coasts — the Atlantic surf
from Mickler's Landing to Miami, and the Gulf passes and river mouths from
Pensacola to Marco Island — and plots crowdsourced bait sightings on a live
migration map.

It scores each beach from **free public data** into a transparent **0–100
opportunity score**, and lets you log sightings alongside it:

- **River flow & salinity (Gulf)** — [USGS Water Data API](https://api.waterdata.usgs.gov/) (`ogcapi/v1`, free)
- **Moon phase** — computed locally, no API
- **Wind & air temp** — [National Weather Service API](https://www.weather.gov/documentation/services-web-api) (`api.weather.gov`)
- **Wind/temp fallback** — [Open-Meteo](https://open-meteo.com/) (free, no key) fills in wind, temperature, the recent NE–E pattern, and the hourly forecast whenever `api.weather.gov` is unreachable — its edge blocks some datacenter IPs, including Vercel's serverless egress, so this keeps wind (a key signal) always present
- **Tides** — [NOAA CO-OPS](https://api.tidesandcurrents.noaa.gov/api/prod/) high/low predictions
- **Buoys** — [NDBC](https://www.ndbc.noaa.gov/) real-time wind, water temp, and waves
- **Sightings** — logged manually by you (beach, time, school size, notes, and
  optional browser location). Public Instagram posts and Reels can be connected
  to a beach while preserving the original permalink and account attribution.
  Tracked and displayed, but **not part of the score yet** — the score uses
  public sources only until enough sightings are collected to be predictive.
- **Daily beach checks** — a scheduled Google News RSS scan looks for recent,
  attributable online mullet reports for every tracked beach. These are shown
  as unverified signals and never mixed with eyewitness reports.

For each beach the app shows the current conditions, a plain-English **"why"**
behind the score, and the **next best window**, plus a map, a recent-sightings
list, and an alert-rules table for future notifications.

> No paid services are used. NWS, CO-OPS, NDBC, and the Open-Meteo fallback are
> free/no-key. Supabase and Vercel run on their free tiers. Map tiles are free
> OpenStreetMap.

---

## How the scores work

The two coasts run differently, so they get different models. Both are
transparent weighted blends shown factor-by-factor in the "why this score" UI.

### Atlantic surf score

A weighted blend of five **public-data** factors, each a 0–1 quality figure ×
its weight (all pure functions in [`src/lib/score.ts`](src/lib/score.ts)):

| Factor              | Weight | What it rewards |
| ------------------- | -----: | --------------- |
| Season window       | 30 | North-to-south migration timing — NE Florida baseline shifts later toward Miami |
| Wind direction      | 18 | Broad NE-through-E band favored; offshore-W poor |
| Recent NE–E pattern | 12 | Share of recent hours blowing from NE, ENE, or E |
| Tide stage          | 22 | Moving water (falling best, then rising); slack is weaker |
| Wind speed          | 18 | Moderate 10–17 kt best; calm or blown-out poor |

Wind direction is deliberately a secondary heuristic. NE, ENE, and E all have
an onshore component along Florida's Atlantic coast, and there is not enough
matched wind-and-sighting data to claim that exact NE is uniquely predictive.
The broad favorable band and lower combined direction weight avoid encoding
that unsupported precision; future outcome data can be used to recalibrate it.

> **Sightings are not a scoring factor (yet).** The score is derived from public
> sources only. Manually logged sightings are still recorded and shown next to
> the score; they can be folded back in as a weighted factor once enough have
> been collected to be predictive.

The **next best window** re-scores the NWS hourly forecast against the tide
timeline for the next ~48 h and reports the highest contiguous stretch.

### Gulf exit score

Gulf mullet stage in bays, marsh, and spring-fed rivers, then leave through
passes and river mouths. The Gulf score ([`src/lib/score-gulf.ts`](src/lib/score-gulf.ts))
looks for the exit triggers described in the site's research brief:

| Factor | Weight (with river gauge) | What it rewards |
| ------ | -----: | --------------- |
| Season window | 18 (16) | Oct–Nov in the Panhandle/Big Bend, sliding ~5 days later per degree south |
| Cold front | 20 (18) | Largest 24 h pressure fall in the last 48 h (station barometer, Open-Meteo fallback) |
| North-wind flush | 14 (12) | NW–NE wind now and over the last 12 h — offshore on the Gulf, drains the bays |
| Water cooling | 20 (18) | 48 h water-temp drop plus temps falling out of the 80s toward the low 70s |
| Outgoing tide strength | 18 (16) | Ebb stage × today's range vs. the next spring tide |
| Moon phase | 10 (8) | Days from the nearest new or full moon |
| River flush | — (12) | USGS flow vs. two-week median, or a salinity drop at tidal gauges |

The next best window uses forecast wind and **forecast pressure**, so an
incoming front shows up before it arrives. These weights are a research-based
starting point; the hourly feature log (below) is there to recalibrate or
replace them with a trained model once a season of sightings exists.

Station IDs (CO-OPS tide predictions, NDBC/NOS met stations, USGS gauges) for
all 22 Gulf stations were checked against the live feeds in September 2026 and
live in [`src/lib/beaches.ts`](src/lib/beaches.ts), the station catalog.

Missing data (e.g. an offline buoy) degrades gracefully — the affected factor
uses a neutral value, and the score is still computed from what's available.

---

## Tech stack

- **Next.js 14 (App Router) + TypeScript**
- **Tailwind CSS** (mobile-first)
- **Supabase** (Postgres + RLS) for beaches, sightings, alert rules, cache
- **React-Leaflet + OpenStreetMap** for the statewide map (no API key or
  WordPress plugin)
- Deploys to **Vercel** (site + API routes)
- **Railway** runs the scheduled jobs ([`worker/run.ts`](worker/run.ts)):
  hourly refresh and daily sighting checks
- **Resend** sends alert emails and job-failure emails (templates in
  [`src/lib/email/templates.ts`](src/lib/email/templates.ts))

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
| `SUPABASE_SERVICE_ROLE_KEY` | optional (required on Railway) | Server-only key; lets the jobs write the cache, feature log, sighting checks, and alert log |
| `RESEND_API_KEY` | Railway | Resend key for alert and failure emails |
| `ALERT_EMAIL_FROM` | Railway | Sender on a Resend-verified domain |
| `ALERT_EMAIL_TO` | Railway | Comma-separated recipients for alerts and job failures |
| `NWS_USER_AGENT` | optional | Contact string sent to `api.weather.gov` per their etiquette |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | Override the built-in PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | optional | PostHog ingestion host; defaults to `https://us.i.posthog.com` |
| `NEXT_PUBLIC_ADS_CLIENT` | optional | Display-ad publisher id (AdSense `ca-pub-…`); empty renders labeled ad placeholders |
| `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | optional | Amazon Associates tag appended to gear links; empty links stay un-tagged |
| `NEXT_PUBLIC_CHARTER_CONTACT_EMAIL` | optional | Address captains email to claim a charter listing |
| `NEXT_PUBLIC_INSIDER_WAITLIST_URL` | optional | Hosted waitlist form for Insider; falls back to a mailto |
| `NEXT_PUBLIC_INSIDER_CONTACT_EMAIL` | optional | Insider waitlist mailto fallback address |

### Database schema

The schema lives in [`supabase/migrations`](supabase/migrations).
Tables are namespaced with `mw_` so they can share a project with other apps:

- `mw_beaches` — monitoring stations on both coasts, mirroring the code
  catalog in `src/lib/beaches.ts` (coast, region, station type, data-feed IDs)
- `mw_sightings` — manual reports with optional latitude, longitude, and
  location accuracy, plus optional Instagram source attribution
- `mw_sighting_checks` — latest daily public-web scan and report links per beach
- `mw_alert_rules` — notification rules (seeded with examples)
- `mw_conditions_cache` — latest scored conditions per station, written hourly
  by the refresh job and read by `/api/summaries`
- `mw_feature_log` — one row per station per hour: every model input plus the
  score (the training set for a future model; server-only)
- `mw_alert_log` — one row per alert rule, station, and day, so alert emails
  never repeat (server-only)

To apply it to your **own** project, paste the SQL into the Supabase SQL
Editor, or use the Supabase CLI:

```bash
supabase db push   # with the migration in supabase/migrations/
```

Apply all migrations before deploying the location-enabled report form, daily
checks, and Instagram-connected sightings.
`0002_sighting_locations.sql` adds the map coordinates and statewide monitoring
stations. Existing reports remain valid and appear at their selected beach.
`0003_daily_sighting_checks.sql` stores one scan result per beach per UTC day.
`0004_instagram_sightings.sql` adds normalized Instagram post/Reel permalinks,
source handles, verification state, and duplicate prevention.
`0005_gulf_coast_and_feature_log.sql` adds coast/region metadata, the 22 Gulf
and Panhandle stations, the hourly feature log, and the alert log. All
statements are idempotent.

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

### Scheduled jobs (Railway)

Recurring work runs on Railway, not Vercel Cron, so request handlers stay
short. Railway project **florida-mullet-run** has two cron services built from
this repo (settings live on the services; Railway's config-file format is
deprecated):

| Service | Schedule (UTC) | Start command | Build command |
| ------- | -------------- | ------------- | ------------- |
| `refresh` | `7 * * * *` (hourly) | `npx tsx worker/run.ts refresh` | `echo` (no Next.js build) |
| `sighting-checks` | `13 11 * * *` (daily) | `npx tsx worker/run.ts sighting-checks` | `echo` (no Next.js build) |

Both use restart policy `NEVER` and watch `src/lib/**`, `worker/**`, and the
package files, so site-only changes don't rebuild them.

The refresh scores all 33 stations, upserts `mw_conditions_cache`, writes one
`mw_feature_log` row per station for the hour, and emails matching alert rules
(once per rule, station, and day). Both jobs are safe to re-run, log one JSON
line per event, and email `ALERT_EMAIL_TO` through Resend if they fail.

Run a job by hand (from the repo root, with the env vars set):

```bash
npx tsx worker/run.ts refresh
npx tsx worker/run.ts probe boca-grande-pass,cedar-key-suwannee   # score and print; writes nothing
```

---

## API routes

| Route | Method | Description |
| ----- | ------ | ----------- |
| `/api/conditions?beach=<id>` | GET | Full conditions, score breakdown, and next window for one beach |
| `/api/summaries?coast=<atlantic\|gulf>` | GET | Score summary per station (map + list), served from the hourly cache |
| `/api/beaches` | GET | Beach list |
| `/api/sightings` | GET / POST | List recent sightings / log a new one |
| `/api/sighting-checks` | GET | Latest daily online check for every beach |
| `/api/alert-rules` | GET | Alert rules |

---

## Tuning

- **Stations** — edit the catalog in [`src/lib/beaches.ts`](src/lib/beaches.ts)
  and mirror it in a migration (the catalog is what the app reads). Tide
  (`tide_station`), met (`buoy_station`, `temp_buoy_station`), and river
  (`usgs_site`) IDs are nearest working stations and can be refined.
- **Scoring weights** — `WEIGHTS` in [`src/lib/score.ts`](src/lib/score.ts)
  (Atlantic) and `GULF_WEIGHTS` in [`src/lib/score-gulf.ts`](src/lib/score-gulf.ts).
- **Season curve** — `seasonFactor` in the same file. A flat-topped window
  (core plateau ~Sep 25–Oct 20 = 1.0) with Gaussian shoulders that ramp up
  through September and taper a little more slowly through November — tuned for
  NE Florida, where the run runs earlier than Central/SE Florida. Adjust the
  `SEASON` bounds/spreads if your local timing differs.

## Content & monetization

Beyond the live tracker, the site is built as a seasonal content hub with a
phased, opt-in revenue model. Everything degrades gracefully — with no IDs
configured it runs as a clean, ad-free site.

### Content cluster

A topical guide cluster under `/guide` establishes topical authority (E-E-A-T)
and captures long-tail search:

| Page | Purpose |
| ---- | ------- |
| `/guide` | Hub linking the four pillar articles |
| `/guide/biology` | What triggers the migration (species, cues, timing) |
| `/guide/locations` | Inlet-by-inlet corridor guide |
| `/guide/regulations` | Plain-English FWC rules + release ethics |
| `/guide/tactics` | How to fish the blitz |

Articles are structured data in
[`src/lib/content/guides.ts`](src/lib/content/guides.ts), server-rendered with
per-page metadata, `Article` JSON-LD, and internal linking. A `sitemap.xml` and
`robots.txt` are generated for indexing
([`src/app/sitemap.ts`](src/app/sitemap.ts),
[`src/app/robots.ts`](src/app/robots.ts)); new beach and guide pages are picked
up automatically from their content files. Every absolute URL comes from
`SITE_URL` in [`src/lib/site.ts`](src/lib/site.ts), which must match the host
Vercel serves as primary (`www.floridamulletrun.com`; the apex 308-redirects
to it). Submit `https://www.floridamulletrun.com/sitemap.xml` in Google Search
Console and Bing Webmaster Tools.

### Monetization

| Feature | Where | How |
| ------- | ----- | --- |
| **Display ads** | `<AdSlot>` across pages | Real AdSense units when `NEXT_PUBLIC_ADS_CLIENT` is set; labeled placeholders otherwise. Swap the component's body for Raptive/Mediavine after crossing their traffic thresholds. |
| **Affiliate gear** | `/gear` | Curated tackle catalog ([`src/lib/content/gear.ts`](src/lib/content/gear.ts)); links carry the Amazon Associates tag when configured, with an FTC disclosure and `rel="sponsored nofollow"`. |
| **Charter lead-gen** | `/charters` | Inlet directory where verified captains claim a listing (Phase 2). |
| **Insider membership** | `/insider` | Subscription waitlist for real-time alerts and member perks (Phase 3). |

All monetization config lives in
[`src/lib/monetization.ts`](src/lib/monetization.ts).

## Roadmap

- Fold sightings back into the score as a weighted factor once enough reports
  have been collected to be predictive.
- Wire a notification channel (email/SMS/push) to act on triggered alert rules.
- Auth for trusted sighting contributors.
- Historical score charts and catch logging.

---

Public data courtesy of NWS, NOAA CO-OPS, and NDBC. Scores are heuristics, not a
guarantee — always check conditions yourself and fish responsibly.
