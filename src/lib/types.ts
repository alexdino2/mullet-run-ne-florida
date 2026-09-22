export type SchoolSize = "small" | "medium" | "large" | "huge";

export type AlertChannel = "none" | "email" | "sms" | "push";

export interface Beach {
  id: string;
  name: string;
  lat: number;
  lon: number;
  priority: number;
  tide_station: string | null;
  buoy_station: string | null;
  nws_note: string | null;
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
  created_at: string;
}

export interface OnlineSightingReport {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
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
}

export interface Conditions {
  wind?: WindObservation;
  airTempF?: number;
  waterTempF?: number;
  waveHeightFt?: number;
  tide?: TideState;
  /** Fraction 0..1 of recent observations blowing from NE through E. */
  recentEasterlyFraction?: number;
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
  score: number; // 0..100
  rating: "poor" | "fair" | "good" | "prime";
  components: ScoreComponent[];
  summary: string;
}

export interface HourlyForecast {
  time: string; // ISO
  wind?: WindObservation;
  airTempF?: number;
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
