// Funnel drop-off for the admin dashboard. Steps are independent counts (not nested), so a step can exceed the one before.

/** Percent lost from `prev` to `cur`; 'exceeds' when `cur` is larger (no honest drop-off); null when there is no base. */
export function dropOff(prev: number, cur: number): number | 'exceeds' | null {
  if (prev <= 0) return cur > 0 ? 'exceeds' : null;
  if (cur > prev) return 'exceeds';
  return Math.round((1 - cur / prev) * 100);
}
