import { STATIONS } from "@/lib/beaches";
import type { Beach, LocationConfidence } from "@/lib/types";

/**
 * Florida coastal places that anglers name in captions and hashtags, used to
 * place an Instagram post before (and instead of) any AI call.
 *
 * `spot` is a specific beach, pier, pass, or inlet; `area` is a town or stretch
 * of coast, which places the post less precisely. Aliases are matched as whole
 * words in the caption, and with spaces removed against hashtags (so
 * "jax beach" also matches #jaxbeach and #jaxbeachfishing). Avoid aliases that
 * are common words, first names, or places abroad on their own ("sebastian",
 * "stuart", "jupiter", "boca", "melbourne"); use the longer form instead.
 * #mulletrun is also used for Australia's sea mullet run, so a match here is
 * a hint for the reviewer, not proof the post is from Florida.
 */
export interface Place {
  name: string;
  aliases: string[];
  lat: number;
  lon: number;
  kind: "spot" | "area";
}

export const PLACES: Place[] = [
  // Northeast Florida
  { name: "Fernandina Beach", aliases: ["fernandina", "amelia island", "fort clinch"], lat: 30.669, lon: -81.462, kind: "area" },
  { name: "Little Talbot Island", aliases: ["little talbot", "big talbot", "talbot island"], lat: 30.46, lon: -81.41, kind: "spot" },
  { name: "Huguenot Memorial Park", aliases: ["huguenot"], lat: 30.412, lon: -81.418, kind: "spot" },
  { name: "Mayport", aliases: ["mayport", "mayport jetties", "st johns river jetties"], lat: 30.3936, lon: -81.4137, kind: "spot" },
  { name: "Hanna Park", aliases: ["hanna park", "kathryn abbey hanna"], lat: 30.37, lon: -81.403, kind: "spot" },
  { name: "Atlantic Beach", aliases: ["atlantic beach"], lat: 30.334, lon: -81.398, kind: "spot" },
  { name: "Neptune Beach", aliases: ["neptune beach"], lat: 30.311, lon: -81.396, kind: "spot" },
  { name: "Jacksonville Beach", aliases: ["jacksonville beach", "jax beach", "jax beach pier", "jaxbeach"], lat: 30.2775, lon: -81.3933, kind: "spot" },
  { name: "Jacksonville", aliases: ["jacksonville", "duval"], lat: 30.33, lon: -81.5, kind: "area" },
  { name: "Ponte Vedra Beach", aliases: ["ponte vedra", "pvb"], lat: 30.24, lon: -81.38, kind: "area" },
  { name: "Mickler's Landing", aliases: ["micklers", "micklers landing", "mickler"], lat: 30.2016, lon: -81.3702, kind: "spot" },
  { name: "Guana River", aliases: ["guana"], lat: 30.02, lon: -81.33, kind: "spot" },
  { name: "Vilano Beach", aliases: ["vilano"], lat: 29.918, lon: -81.293, kind: "spot" },
  { name: "St. Augustine Inlet", aliases: ["st augustine inlet"], lat: 29.91, lon: -81.28, kind: "spot" },
  { name: "St. Augustine Beach", aliases: ["st augustine beach", "st augustine pier", "anastasia", "st aug beach"], lat: 29.8497, lon: -81.2653, kind: "spot" },
  { name: "St. Augustine", aliases: ["st augustine", "staug", "st aug"], lat: 29.89, lon: -81.31, kind: "area" },
  { name: "Crescent Beach", aliases: ["crescent beach"], lat: 29.77, lon: -81.25, kind: "spot" },
  { name: "Matanzas Inlet", aliases: ["matanzas"], lat: 29.71, lon: -81.23, kind: "spot" },
  { name: "Flagler Beach", aliases: ["flagler beach", "flagler pier"], lat: 29.475, lon: -81.127, kind: "spot" },
  { name: "Ormond Beach", aliases: ["ormond beach", "ormond"], lat: 29.286, lon: -81.056, kind: "spot" },
  { name: "Daytona Beach", aliases: ["daytona", "sunglow pier"], lat: 29.21, lon: -81.02, kind: "area" },
  { name: "Ponce Inlet", aliases: ["ponce inlet", "ponce de leon inlet"], lat: 29.0808, lon: -80.925, kind: "spot" },
  { name: "New Smyrna Beach", aliases: ["new smyrna", "nsb"], lat: 29.026, lon: -80.927, kind: "spot" },

  // Space Coast
  { name: "Port Canaveral", aliases: ["port canaveral", "jetty park", "canaveral"], lat: 28.407, lon: -80.593, kind: "spot" },
  { name: "Cocoa Beach", aliases: ["cocoa beach", "cocoa beach pier"], lat: 28.3206, lon: -80.6076, kind: "spot" },
  { name: "Satellite Beach", aliases: ["satellite beach"], lat: 28.176, lon: -80.59, kind: "spot" },
  { name: "Melbourne Beach", aliases: ["melbourne beach", "melbourne fl", "indialantic"], lat: 28.068, lon: -80.56, kind: "area" },
  { name: "Sebastian Inlet", aliases: ["sebastian inlet"], lat: 27.8609, lon: -80.4483, kind: "spot" },

  // Treasure Coast
  { name: "Vero Beach", aliases: ["vero beach", "vero"], lat: 27.64, lon: -80.36, kind: "area" },
  { name: "Fort Pierce Inlet", aliases: ["fort pierce", "ft pierce", "fort pierce inlet"], lat: 27.4467, lon: -80.3256, kind: "spot" },
  { name: "Jensen Beach", aliases: ["jensen beach", "hutchinson island"], lat: 27.25, lon: -80.21, kind: "area" },
  { name: "St. Lucie Inlet", aliases: ["st lucie inlet", "stuart beach", "stuart fl"], lat: 27.167, lon: -80.155, kind: "spot" },
  { name: "Hobe Sound", aliases: ["hobe sound", "blowing rocks"], lat: 27.07, lon: -80.12, kind: "area" },
  { name: "Jupiter Inlet", aliases: ["jupiter inlet", "jupiter beach", "jupiter fl", "dubois park"], lat: 26.9434, lon: -80.073, kind: "spot" },
  { name: "Juno Beach", aliases: ["juno beach", "juno pier"], lat: 26.89, lon: -80.055, kind: "spot" },

  // Southeast Florida
  { name: "Palm Beach Inlet", aliases: ["palm beach inlet", "lake worth inlet", "singer island", "peanut island"], lat: 26.772, lon: -80.037, kind: "spot" },
  { name: "Palm Beach", aliases: ["palm beach", "west palm"], lat: 26.7, lon: -80.036, kind: "area" },
  { name: "Lake Worth Beach", aliases: ["lake worth pier", "lake worth beach"], lat: 26.612, lon: -80.034, kind: "spot" },
  { name: "Boynton Inlet", aliases: ["boynton inlet", "boynton beach", "boynton"], lat: 26.545, lon: -80.043, kind: "spot" },
  { name: "Delray Beach", aliases: ["delray"], lat: 26.46, lon: -80.06, kind: "area" },
  { name: "Boca Raton Inlet", aliases: ["boca raton", "boca inlet"], lat: 26.336, lon: -80.071, kind: "spot" },
  { name: "Deerfield Beach", aliases: ["deerfield beach", "deerfield pier"], lat: 26.317, lon: -80.075, kind: "spot" },
  { name: "Hillsboro Inlet", aliases: ["hillsboro inlet"], lat: 26.257, lon: -80.081, kind: "spot" },
  { name: "Pompano Beach", aliases: ["pompano beach", "pompano pier"], lat: 26.235, lon: -80.086, kind: "spot" },
  { name: "Lauderdale-by-the-Sea", aliases: ["lauderdale by the sea", "anglins pier"], lat: 26.19, lon: -80.095, kind: "spot" },
  { name: "Fort Lauderdale", aliases: ["fort lauderdale", "ft lauderdale", "port everglades"], lat: 26.1224, lon: -80.104, kind: "area" },
  { name: "Dania Beach", aliases: ["dania beach", "dania pier"], lat: 26.055, lon: -80.11, kind: "spot" },
  { name: "Hollywood Beach", aliases: ["hollywood beach"], lat: 26.01, lon: -80.117, kind: "spot" },
  { name: "Haulover Inlet", aliases: ["haulover", "sunny isles", "bal harbour"], lat: 25.9, lon: -80.122, kind: "spot" },
  { name: "Miami Beach", aliases: ["miami beach", "south beach", "south pointe", "government cut"], lat: 25.7907, lon: -80.13, kind: "spot" },
  { name: "Miami", aliases: ["miami", "key biscayne"], lat: 25.76, lon: -80.19, kind: "area" },

  // Panhandle
  { name: "Perdido Key", aliases: ["perdido key", "perdido"], lat: 30.3, lon: -87.45, kind: "area" },
  { name: "Pensacola Pass", aliases: ["pensacola pass", "fort pickens", "ft pickens"], lat: 30.3233, lon: -87.294, kind: "spot" },
  { name: "Pensacola Beach", aliases: ["pensacola beach", "pensacola"], lat: 30.333, lon: -87.14, kind: "area" },
  { name: "Navarre Beach", aliases: ["navarre"], lat: 30.379, lon: -86.865, kind: "spot" },
  { name: "Okaloosa Island", aliases: ["okaloosa island", "fort walton beach", "fort walton", "okaloosa pier"], lat: 30.393, lon: -86.6, kind: "spot" },
  { name: "Destin East Pass", aliases: ["destin", "east pass", "destin jetties"], lat: 30.3935, lon: -86.5135, kind: "spot" },
  { name: "30A", aliases: ["30a", "seaside", "santa rosa beach", "grayton"], lat: 30.32, lon: -86.14, kind: "area" },
  { name: "St. Andrew Pass", aliases: ["st andrew pass", "st andrews state park", "st andrews"], lat: 30.125, lon: -85.733, kind: "spot" },
  { name: "Panama City Beach", aliases: ["panama city beach", "panama city", "pcb"], lat: 30.176, lon: -85.805, kind: "area" },
  { name: "Mexico Beach", aliases: ["mexico beach"], lat: 29.94, lon: -85.42, kind: "spot" },
  { name: "Cape San Blas", aliases: ["cape san blas", "port st joe", "indian pass"], lat: 29.764, lon: -85.402, kind: "spot" },
  { name: "Apalachicola", aliases: ["apalachicola", "apalach"], lat: 29.725, lon: -84.983, kind: "area" },
  { name: "St. George Island", aliases: ["st george island", "sikes cut", "bob sikes"], lat: 29.613, lon: -84.958, kind: "spot" },
  { name: "Carrabelle", aliases: ["carrabelle", "alligator point", "dog island"], lat: 29.853, lon: -84.664, kind: "area" },

  // Big Bend
  { name: "St. Marks", aliases: ["st marks", "shell point", "panacea", "wakulla"], lat: 30.078, lon: -84.178, kind: "area" },
  { name: "Keaton Beach", aliases: ["keaton beach"], lat: 29.82, lon: -83.59, kind: "spot" },
  { name: "Steinhatchee", aliases: ["steinhatchee"], lat: 29.672, lon: -83.39, kind: "spot" },
  { name: "Horseshoe Beach", aliases: ["horseshoe beach"], lat: 29.44, lon: -83.29, kind: "spot" },
  { name: "Suwannee River", aliases: ["suwannee"], lat: 29.33, lon: -83.15, kind: "spot" },
  { name: "Cedar Key", aliases: ["cedar key"], lat: 29.137, lon: -83.035, kind: "spot" },
  { name: "Yankeetown", aliases: ["yankeetown", "withlacoochee"], lat: 29.03, lon: -82.72, kind: "area" },
  { name: "Crystal River", aliases: ["crystal river", "fort island"], lat: 28.905, lon: -82.72, kind: "spot" },
  { name: "Homosassa", aliases: ["homosassa"], lat: 28.772, lon: -82.695, kind: "spot" },
  { name: "Hernando Beach", aliases: ["hernando beach", "aripeka", "hudson beach"], lat: 28.47, lon: -82.66, kind: "area" },

  // Tampa Bay
  { name: "Tarpon Springs", aliases: ["tarpon springs", "anclote", "honeymoon island", "dunedin"], lat: 28.1, lon: -82.8, kind: "area" },
  { name: "Clearwater Beach", aliases: ["clearwater", "sand key", "pier 60"], lat: 27.978, lon: -82.83, kind: "spot" },
  { name: "Indian Rocks Beach", aliases: ["indian rocks"], lat: 27.875, lon: -82.851, kind: "spot" },
  { name: "John's Pass", aliases: ["johns pass", "madeira beach", "treasure island"], lat: 27.783, lon: -82.782, kind: "spot" },
  { name: "St. Pete Beach", aliases: ["st pete beach", "pass a grille", "blind pass st pete"], lat: 27.7, lon: -82.738, kind: "spot" },
  { name: "St. Petersburg", aliases: ["st pete", "st petersburg", "sunshine skyway", "skyway pier"], lat: 27.77, lon: -82.64, kind: "area" },
  { name: "Fort De Soto", aliases: ["fort de soto", "ft de soto", "fort desoto", "ft desoto", "egmont"], lat: 27.615, lon: -82.735, kind: "spot" },
  { name: "Tampa Bay", aliases: ["tampa bay", "tampa"], lat: 27.76, lon: -82.55, kind: "area" },
  { name: "Anna Maria Island", aliases: ["anna maria", "ami", "passage key", "rod and reel pier", "bradenton beach"], lat: 27.52, lon: -82.72, kind: "spot" },

  // Sarasota–Charlotte
  { name: "Longboat Pass", aliases: ["longboat"], lat: 27.44, lon: -82.69, kind: "spot" },
  { name: "Sarasota", aliases: ["sarasota", "lido key", "siesta key", "big pass", "new pass"], lat: 27.29, lon: -82.56, kind: "area" },
  { name: "Venice Inlet", aliases: ["venice inlet", "venice jetty", "venice jetties", "venice pier", "venice fl", "venice beach fl"], lat: 27.112, lon: -82.465, kind: "spot" },
  { name: "Venice", aliases: ["venice", "nokomis", "casey key"], lat: 27.1, lon: -82.45, kind: "area" },
  { name: "Stump Pass", aliases: ["stump pass", "englewood", "manasota key"], lat: 26.9, lon: -82.345, kind: "spot" },
  { name: "Boca Grande Pass", aliases: ["boca grande", "gasparilla"], lat: 26.717, lon: -82.26, kind: "spot" },
  { name: "Charlotte Harbor", aliases: ["charlotte harbor", "port charlotte", "punta gorda"], lat: 26.85, lon: -82.1, kind: "area" },

  // Southwest Florida
  { name: "Redfish Pass", aliases: ["redfish pass", "captiva"], lat: 26.55, lon: -82.197, kind: "spot" },
  { name: "Sanibel", aliases: ["sanibel", "blind pass"], lat: 26.483, lon: -82.183, kind: "spot" },
  { name: "Fort Myers Beach", aliases: ["fort myers beach", "fort myers", "ft myers", "estero island", "bonita beach", "big carlos pass"], lat: 26.45, lon: -81.95, kind: "area" },
  { name: "Wiggins Pass", aliases: ["wiggins pass", "delnor wiggins"], lat: 26.29, lon: -81.818, kind: "spot" },
  { name: "Naples", aliases: ["naples", "naples pier", "gordon pass"], lat: 26.132, lon: -81.808, kind: "spot" },
  { name: "Marco Island", aliases: ["marco island", "caxambas"], lat: 25.908, lon: -81.728, kind: "spot" },
  { name: "Everglades City", aliases: ["everglades city", "chokoloskee"], lat: 25.86, lon: -81.385, kind: "area" },
];

/** Posts farther than this from every station get no station suggestion. */
const MAX_STATION_KM = 100;
/** Matches this far apart describe different parts of the coast. */
const AMBIGUOUS_KM = 60;

export interface PlaceMatch {
  place: Place;
  alias: string;
}

export interface InferredLocation {
  name: string;
  lat: number;
  lon: number;
  confidence: LocationConfidence;
  evidence: string;
}

/** Lowercase, drop apostrophes and punctuation, and spell "Saint" as "st". */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’`]/g, "")
    .replace(/\bsaint\b/g, "st")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function extractHashtags(caption: string): string[] {
  const tags = caption.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return [...new Set(tags.map((t) => t.slice(1).toLowerCase()))];
}

const squash = (s: string) => s.replace(/ /g, "");

/** Every known place named in the caption text or its hashtags. */
export function matchPlaces(caption: string): PlaceMatch[] {
  const text = ` ${normalizeText(caption)} `;
  const tags = extractHashtags(caption).map((t) => squash(normalizeText(t)));
  const matches: PlaceMatch[] = [];

  for (const place of PLACES) {
    const alias = place.aliases
      .map(normalizeText)
      .sort((a, b) => b.length - a.length)
      .find((a) => {
        if (text.includes(` ${a} `)) return true;
        // Hashtags: exact for short aliases, prefix/substring for long ones.
        const s = squash(a);
        return tags.some((t) => t === s || (s.length >= 6 && t.includes(s)));
      });
    if (alias) matches.push({ place, alias });
  }
  return matches;
}

export function distanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function nearestStation(
  point: { lat: number; lon: number },
  stations: Beach[] = STATIONS,
): { station: Beach; km: number } | null {
  let best: { station: Beach; km: number } | null = null;
  for (const station of stations) {
    const km = distanceKm(point, station);
    if (!best || km < best.km) best = { station, km };
  }
  return best && best.km <= MAX_STATION_KM ? best : null;
}

/**
 * Pick one location from the caption's place matches. A specific spot beats a
 * town; several spots on different parts of the coast make the result
 * low-confidence so the reviewer checks it.
 */
export function inferLocationFromCaption(caption: string): InferredLocation | null {
  const matches = matchPlaces(caption);
  if (matches.length === 0) return null;

  const spots = matches.filter((m) => m.place.kind === "spot");
  const pool = spots.length ? spots : matches;
  // Longest alias first: "st augustine beach" is more specific than "st augustine".
  const best = [...pool].sort((a, b) => b.alias.length - a.alias.length)[0];
  const spread = Math.max(...matches.map((m) => distanceKm(m.place, best.place)));

  let confidence: LocationConfidence =
    best.place.kind === "spot" ? "high" : "medium";
  if (spread > AMBIGUOUS_KM) confidence = "low";

  const named = matches.map((m) => `"${m.alias}"`).join(", ");
  return {
    name: best.place.name,
    lat: best.place.lat,
    lon: best.place.lon,
    confidence,
    evidence:
      spread > AMBIGUOUS_KM
        ? `Caption names places ${Math.round(spread)} km apart: ${named}`
        : `Caption mentions ${named}`,
  };
}
