/**
 * Formatting & Angular Utility Functions
 */

/** Normalize angle to range [0, 360) */
export function normalizeDegrees(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/** Convert degrees to radians */
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees */
export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Format angle into degrees, minutes, and optional seconds string (e.g. 9°26'18") */
export function formatDMS(deg: number, includeSeconds: boolean = false): string {
  const norm = normalizeDegrees(deg);
  const signDeg = norm % 30;
  const d = Math.floor(signDeg);
  const minutesTotal = (signDeg % 1) * 60;
  const m = Math.floor(minutesTotal);
  const s = Math.floor((minutesTotal % 1) * 60);

  if (includeSeconds) {
    return `${d}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`;
  }
  return `${d}°${String(m).padStart(2, '0')}'`;
}

/**
 * Visual SVG chart angle projection.
 * Ensures Ascendant (ascendant, ascendant) === 180° (Left horizontal axis / 9 o'clock)
 */
export function chartAngle(longitude: number, ascendant: number): number {
  return normalizeDegrees(180 + longitude - ascendant);
}
