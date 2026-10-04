/** Compass-bin boundaries that include NE, ENE, and E winds. */
export const FAVORABLE_EASTERLY_MIN_DEG = 33.75;
export const FAVORABLE_EASTERLY_MAX_DEG = 101.25;

/**
 * Width of the partial-credit shoulder on each side of the NE–E band. Credit
 * fades linearly to zero at the N/NNW and S/SSE bin edges, so a 10° wobble
 * across the band edge moves the pattern a little instead of all-or-nothing.
 */
export const FAVORABLE_EASTERLY_SHOULDER_DEG = 67.5;

export function isFavorableEasterlyDirection(directionDeg: number): boolean {
  return (
    directionDeg >= FAVORABLE_EASTERLY_MIN_DEG &&
    directionDeg < FAVORABLE_EASTERLY_MAX_DEG
  );
}

/** 0..1 credit for a wind bearing: 1 inside NE–E, tapering across the shoulders. */
export function easterlyDirectionWeight(directionDeg: number): number {
  const deg = ((directionDeg % 360) + 360) % 360;
  if (isFavorableEasterlyDirection(deg)) return 1;
  const outside =
    deg >= FAVORABLE_EASTERLY_MAX_DEG
      ? Math.min(
          deg - FAVORABLE_EASTERLY_MAX_DEG,
          360 - deg + FAVORABLE_EASTERLY_MIN_DEG,
        )
      : FAVORABLE_EASTERLY_MIN_DEG - deg;
  return Math.max(0, 1 - outside / FAVORABLE_EASTERLY_SHOULDER_DEG);
}
