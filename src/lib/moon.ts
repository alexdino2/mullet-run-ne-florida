import type { MoonState } from "@/lib/types";

/**
 * Moon phase from a mean synodic month. No API needed; accurate to within a
 * few hours of the true new and full moons, which is plenty for a daily
 * "days from spring tide" signal.
 */
const SYNODIC_DAYS = 29.530588853;
/** Reference new moon: 2000-01-06 18:14 UTC. */
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86400000;

export function moonAt(date: Date): MoonState {
  const days = (date.getTime() - REFERENCE_NEW_MOON_MS) / DAY_MS;
  const phase = (((days / SYNODIC_DAYS) % 1) + 1) % 1; // 0 new → 0.5 full
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const age = phase * SYNODIC_DAYS;
  const toNew = Math.min(age, SYNODIC_DAYS - age);
  const toFull = Math.abs(age - SYNODIC_DAYS / 2);
  return {
    phase: Math.round(phase * 1000) / 1000,
    illumination: Math.round(illumination * 100) / 100,
    name: phaseName(phase),
    daysFromSyzygy: Math.round(Math.min(toNew, toFull) * 10) / 10,
  };
}

function phaseName(phase: number): string {
  if (phase < 0.03 || phase >= 0.97) return "New moon";
  if (phase < 0.22) return "Waxing crescent";
  if (phase < 0.28) return "First quarter";
  if (phase < 0.47) return "Waxing gibbous";
  if (phase < 0.53) return "Full moon";
  if (phase < 0.72) return "Waning gibbous";
  if (phase < 0.78) return "Last quarter";
  return "Waning crescent";
}
