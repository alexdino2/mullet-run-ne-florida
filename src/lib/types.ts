export type SchoolSize = "small" | "medium" | "large" | "huge";

export type AlertChannel = "none" | "email" | "sms" | "push";
export type SightingSource = "eyewitness" | "instagram";
export type VerificationStatus = "unverified" | "verified";

export type Coast = "atlantic" | "gulf";

export type RegionId =
  | "northeast-florida"
  | "space-coast"
  | "treasure-coast"
  | "southeast-florida"
  | "panhandle"
  | "big-bend"
  | "tampa-bay"
  | "sarasota-charlotte"
  | "southwest-florida";

/** Beaches are where bait runs the surf; passes and river mouths are exits. */
export type StationType = "beach" | "pass" | "river";

export interface Beach {
  id: string;
  name: string;
  lat: number;
  lon: number;
  priority: number;
  /** NOAA CO-OPS station used for high/low tide predictions. */
  tide_station: string | null;
  /** NDBC station (buoy or NOS/C-MAN) for wind, pressure, and water temp. */
  buoy_station: string | null;
  nws_note: string | null;
  coast: Coast;
  region: RegionId;
  station_type: StationType;
  /** Optional second NDBC station used only when the primary has no water temp. */
  temp_buoy_station: string | null;
  /**
   * Optional NDBC/NOS station with an anemometer, used for wind ahead of
   * `buoy_station`. Several Atlantic wave buoys (41117, 41112, 41114, 41122)
   * have no wind sensor, which left those beaches on model wind. Code-only:
   * the catalog in lib/beaches.ts is the source of truth, not mw_beaches.
   */
  wind_station?: string | null;
  /** Optional USGS river gauge feeding this pass or river mouth. */
  usgs_site: string | null;
}

export interface Sighting {
  id: string;
  beach_id: string;
  observed_at: string;
  school_size: SchoolSize;
  notes: string | null;
  /** Optional reporter position; older reports fall back to the selected beach. */
  lat: number | null;
  lon: number | null;
  location_accuracy_m: number | null;
  source_type: SightingSource;
  source_url: string | null;
  source_handle: string | null;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface OnlineSightingReport {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export type LocationMethod = "caption" | "ai" | "none";
export type LocationConfidence = "high" | "medium" | "low" | "none";
export type CandidateStatus = "pending" | "approved" | "rejected" | "duplicate";

/** A public Instagram post found by the hashtag job, awaiting review. */
export interface InstagramCandidate {
  id: string;
  media_id: string;
  permalink: string;
  media_type: string | null;
  media_url: string | null;
  caption: string | null;
  hashtags: string[];
  posted_at: string;
  source_handle: string | null;
  location_method: LocationMethod;
  location_name: string | null;
  lat: number | null;
  lon: number | null;
  location_confidence: LocationConfidence;
  location_evidence: string | null;
  beach_id: string | null;
  station_distance_km: number | null;
  ai_is_report: boolean | null;
  ai_reason: string | null;
  ai_summary: string | null;
  ai_school_size: SchoolSize | null;
  ai_error: string | null;
  status: CandidateStatus;
  sighting_id: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

export interface SightingCheck {
  id?: string;
  beach_id: string;
  checked_at: string;
  check_date: string;
  status: "checked" | "unavailable";
  reports: OnlineSightingReport[];
}

export interface AlertRule {
  id: string;
  name: string;
  beach_id: string | null;
  min_score: number;
  wind_dir_min: number | null;
  wind_dir_max: number | null;
  max_wind_kt: number | null;
  channel: AlertChannel;
  enabled: boolean;
}

export interface WindObservation {
  /** Direction the wind is coming FROM, in meteorological degrees (0=N, 90=E). */
  directionDeg: number;
  directionLabel: string;
  speedKt: number;
  gustKt?: number;
}

export type TideStage = "rising" | "falling" | "high" | "low" | "unknown";

export interface TideEvent {
  time: string; // ISO
  type: "H" | "L";
  heightFt: number;
}

export interface TideState {
  stage: TideStage;
  nextEvent?: TideEvent;
  events: TideEvent[];
  /** Range near `atMs` relative to the biggest range in the window (0..1). */
  rangeRatio?: number;
}

export interface Conditions {
  wind?: WindObservation;
  /**
   * Where `wind` came from: a station observation (NDBC/NOS), the Open-Meteo
   * model, or the NWS forecast grid — in that order of preference.
   */
  windSource?: "station" | "model" | "forecast";
  airTempF?: number;
  waterTempF?: number;
  waveHeightFt?: number;
  tide?: TideState;
  /** Fraction 0..1 of recent observations blowing from NE through E. */
  recentEasterlyFraction?: number;
  /** Latest sea-level pressure (hPa). */
  pressureHpa?: number;
  /**
   * Largest 24-hour pressure fall seen over the last ~48 hours, in hPa
   * (positive number = pressure dropped). The signature of a cold front.
   */
  pressureDrop24hHpa?: number;
  /** Water temp change over the last ~48 hours in °F (negative = cooling). */
  waterTempChange48hF?: number;
  /** Fraction 0..1 of recent hours with a north-sector (NW–NE) breeze. */
  recentNortherlyFraction?: number;
  moon?: MoonState;
  river?: RiverState;
  /** Source labels for transparency in the UI. */
  sources: string[];
  observedAt: string;
}

export interface ScoreComponent {
  key: string;
  label: string;
  weight: number;
  factor: number; // 0..1
  points: number; // weight * factor, rounded
  reason: string;
  available: boolean;
}

export interface ScoreResult {
  /** Which scoring model produced this result. */
  model?: "atlantic-surf" | "gulf-trigger";
  score: number; // 0..100
  rating: "poor" | "fair" | "good" | "prime";
  components: ScoreComponent[];
  summary: string;
}

export interface HourlyForecast {
  time: string; // ISO
  wind?: WindObservation;
  airTempF?: number;
  /** Sea-level pressure (hPa), when the forecast source provides it. */
  pressureHpa?: number;
}

export interface MoonState {
  /** 0 = new, 0.5 = full, cycles to 1. */
  phase: number;
  /** Illuminated fraction 0..1. */
  illumination: number;
  name: string;
  /** Days to the nearest new or full moon (spring tides). */
  daysFromSyzygy: number;
}

export interface RiverState {
  site: string;
  label: string;
  /** Latest 24-hour mean discharge (cubic feet per second). */
  dischargeCfs?: number;
  /** Latest 24-hour mean relative to the prior two-week median. */
  dischargeRatio?: number;
  /** Latest specific conductance (µS/cm), a salinity proxy at tidal gauges. */
  conductance?: number;
  /** Conductance change over ~48h as a fraction (negative = freshening). */
  conductanceChange?: number;
}

export interface OpportunityWindow {
  start: string; // ISO
  end: string; // ISO
  peakTime: string; // ISO
  peakScore: number;
}

export interface BeachConditions {
  beach: Beach;
  conditions: Conditions;
  score: ScoreResult;
  nextWindow: OpportunityWindow | null;
  recentSightings: Sighting[];
  generatedAt: string;
}

export interface BeachSummary {
  beach: Beach;
  score: number;
  rating: ScoreResult["rating"];
  summary: string;
  wind?: WindObservation;
  waterTempF?: number;
}
