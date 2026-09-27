/** Compass-bin boundaries that include NE, ENE, and E winds. */
export const FAVORABLE_EASTERLY_MIN_DEG = 33.75;
export const FAVORABLE_EASTERLY_MAX_DEG = 101.25;

export function isFavorableEasterlyDirection(directionDeg: number): boolean {
  return (
    directionDeg >= FAVORABLE_EASTERLY_MIN_DEG &&
    directionDeg < FAVORABLE_EASTERLY_MAX_DEG
  );
}
