import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { BEACH_CONTENT } from "@/lib/content/beaches";
import { WEIGHTS } from "@/lib/score";
import { GULF_WEIGHTS, GULF_WEIGHTS_WITH_RIVER } from "@/lib/score-gulf";
import { INSTAGRAM_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Florida Mullet Run & How the Opportunity Score Works",
  description:
    "Florida Mullet Run is an independent Florida fishing resource combining public weather and marine data with angler-submitted sightings to track the annual mullet migration. Here's how the Opportunity Score is calculated.",
  alternates: { canonical: "/about" },
};

// Weights are read from the scoring code so this page can't drift from it.
const ATLANTIC_FACTORS = [
  {
    name: "Season window",
    weight: WEIGHTS.season,
    rewards:
      "Where the calendar sits in the north-to-south migration. Northeast Florida peaks first; the baseline shifts later toward Miami.",
  },
  {
    name: "Tide stage",
    weight: WEIGHTS.tide,
    rewards:
      "Moving water — a falling tide scores best, then rising. Slack water is weaker.",
  },
  {
    name: "Wind direction",
    weight: WEIGHTS.windDir,
    rewards:
      "The broad northeast-through-east band that pushes bait against the beach. Offshore west winds score poorly.",
  },
  {
    name: "Wind speed",
    weight: WEIGHTS.windSpeed,
    rewards:
      "A moderate 10–17 knots. Flat calm or blown-out surf both score low.",
  },
  {
    name: "Recent NE–E pattern",
    weight: WEIGHTS.recentEasterly,
    rewards:
      "How much of the last 18 hours the wind has blown from the northeast to east.",
  },
];

const GULF_FACTORS = [
  {
    name: "Cold front",
    weight: GULF_WEIGHTS.front,
    river: GULF_WEIGHTS_WITH_RIVER.front,
    rewards:
      "The biggest 24-hour pressure fall in the last two days — fronts trigger the exit.",
  },
  {
    name: "Water cooling",
    weight: GULF_WEIGHTS.water,
    river: GULF_WEIGHTS_WITH_RIVER.water,
    rewards:
      "Water temperature dropping out of the 80s toward the low 70s.",
  },
  {
    name: "Season window",
    weight: GULF_WEIGHTS.season,
    river: GULF_WEIGHTS_WITH_RIVER.season,
    rewards:
      "October–November in the Panhandle and Big Bend, sliding later toward Naples.",
  },
  {
    name: "Outgoing tide strength",
    weight: GULF_WEIGHTS.tide,
    river: GULF_WEIGHTS_WITH_RIVER.tide,
    rewards: "A strong ebb on a big tidal range draining the bays through the passes.",
  },
  {
    name: "North-wind flush",
    weight: GULF_WEIGHTS.northWind,
    river: GULF_WEIGHTS_WITH_RIVER.northWind,
    rewards:
      "Northwest-to-northeast wind, which is offshore on the Gulf and pushes water out of the bays.",
  },
  {
    name: "Moon phase",
    weight: GULF_WEIGHTS.moon,
    river: GULF_WEIGHTS_WITH_RIVER.moon,
    rewards: "Days from the nearest new or full moon.",
  },
  {
    name: "River flush",
    weight: null,
    river: GULF_WEIGHTS_WITH_RIVER.river,
    rewards:
      "River flow above its two-week median (or a salinity drop), at stations with a USGS gauge.",
  },
];

function FactorTable({
  rows,
}: {
  rows: { name: string; weight: number | null; rewards: string; river?: number }[];
}) {
  const hasRiver = rows.some((r) => r.river !== undefined);
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[20rem] text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-1 py-1.5 font-semibold">Factor</th>
            <th className="px-1 py-1.5 text-right font-semibold">Points</th>
            <th className="px-1 py-1.5 font-semibold">What it rewards</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-slate-100 align-top">
              <td className="px-1 py-1.5 font-semibold text-slate-800">{r.name}</td>
              <td className="whitespace-nowrap px-1 py-1.5 text-right tabular-nums text-slate-800">
                {r.weight ?? "—"}
                {hasRiver && (
                  <span className="text-slate-400"> ({r.river})</span>
                )}
              </td>
              <td className="px-1 py-1.5 text-slate-600">{r.rewards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AboutPage() {
  return (
    <InfoPage
      title="About Florida Mullet Run"
      lede="An independent Florida fishing resource combining public weather and marine data with angler-submitted sightings to track the annual mullet migration."
    >
      <InfoSection title="What this site is">
        <p>
          Every fall, huge schools of mullet move along Florida’s coasts — pouring
          south down the Atlantic beaches and flooding out of the Gulf passes to
          spawn — with snook, tarpon, redfish, bluefish and sharks on their heels.
          Timing the run is most of the battle, and the signs are scattered across
          weather forecasts, tide tables, buoy readings and word of mouth.
        </p>
        <p>
          Florida Mullet Run pulls those signals into one place. For each of our{" "}
          {BEACH_CONTENT.length} beaches, inlets and passes we show live
          conditions, a daily <strong>Opportunity Score</strong>, the next best
          window over the coming two days, and the latest sightings from anglers
          on the water.
        </p>
        <p>
          We’re independent: not affiliated with the FWC, NOAA or any tackle brand
          or charter company. The site is free and supported by ads and affiliate
          links (see our <Link href="/privacy">Privacy Policy</Link>). Curious
          how it got started? <Link href="/about-us">Read our story</Link>.
        </p>
      </InfoSection>

      <InfoSection id="opportunity-score" title="How the Opportunity Score works">
        <p>
          The Opportunity Score is a 0–100 rating of how favorable conditions are
          for finding mullet — and the fish chasing them — at a given spot right
          now. It isn’t a promise that bait is there; it’s a transparent summary
          of the conditions that tend to move it.
        </p>
        <p>
          Each factor is rated from 0 to 1 and multiplied by its points. Add them
          up and you get the score. Every beach page shows this breakdown
          factor-by-factor under “why this score”, so you can see exactly what’s
          helping or hurting.
        </p>
        <p>
          The two coasts fish differently, so they use different models.
        </p>
        <h3 className="pt-2 text-sm font-bold text-slate-900">
          Atlantic surf score
        </h3>
        <p>
          On the Atlantic side the run is a southbound push along the beach,
          driven by season and onshore wind.
        </p>
        <FactorTable rows={ATLANTIC_FACTORS} />
        <h3 className="pt-2 text-sm font-bold text-slate-900">Gulf exit score</h3>
        <p>
          Gulf mullet stage in bays, marsh and rivers, then leave through the
          passes when fronts cool the water. The Gulf score looks for those exit
          triggers. Points in brackets apply at stations with a river gauge.
        </p>
        <FactorTable rows={GULF_FACTORS} />
        <h3 className="pt-2 text-sm font-bold text-slate-900">
          Next best window
        </h3>
        <p>
          We re-score the hourly forecast against the tide timeline for the next
          ~48 hours and highlight the strongest stretch. On the Gulf this uses
          forecast pressure, so an incoming front shows up before it arrives.
        </p>
      </InfoSection>

      <InfoSection title="Where the data comes from">
        <ul>
          <li>
            <strong>Wind, temperature and pressure</strong> — measured station
            readings from NOAA’s National Data Buoy Center and NOS stations first,
            then Open-Meteo, then the National Weather Service forecast.
          </li>
          <li>
            <strong>Tides</strong> — NOAA Tides & Currents (CO-OPS) predictions.
          </li>
          <li>
            <strong>Water temperature and waves</strong> — NDBC buoys and coastal
            stations.
          </li>
          <li>
            <strong>River flow</strong> — USGS stream gauges on Gulf rivers.
          </li>
          <li>
            <strong>Sightings</strong> — reports from anglers submitted on the{" "}
            <Link href="/sightings">Sightings</Link> page, plus credited public
            Instagram posts.
          </li>
        </ul>
        <p>
          Stale or missing readings are handled honestly: an offline buoy is
          treated as offline, and the affected factor falls back to a neutral
          value rather than a guess.
        </p>
      </InfoSection>

      <InfoSection title="Why sightings aren’t in the score (yet)">
        <p>
          Sightings are shown right next to the score, but they don’t change it.
          The score uses public data only until we’ve collected enough matched
          conditions-and-sightings to know which factors genuinely predict bait.
          The weights above are a research-based starting point, and each season
          of reports lets us recalibrate them. Every sighting you log helps.
        </p>
      </InfoSection>

      <InfoSection title="Fish responsibly">
        <p>
          Scores are heuristics, not guarantees. Bag limits, size limits and
          closures change — always check current rules with the FWC before you
          keep a fish. Our{" "}
          <Link href="/guide/regulations">regulations guide</Link> is a starting
          point, not legal advice.
        </p>
      </InfoSection>

      <InfoSection title="Get in touch">
        <p>
          Spotted an error, have a local tip for a beach page, or want to help?{" "}
          <Link href="/contact">Contact us</Link> or follow along on{" "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          .
        </p>
      </InfoSection>
    </InfoPage>
  );
}
