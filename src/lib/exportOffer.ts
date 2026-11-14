import { PLANS, type PlanId } from '../../shared/plans';

/** After a free export: show the clean-PDF offer once and count it as a paywall view. Pro users and partner client exports never see it. */
export function offerAfterExport(o: {
  pro: boolean;
  clientId: string | null | undefined;
  format: string;
  alreadyOpen: boolean;
  track: (name: string, meta?: Record<string, string | number>) => void;
  open: () => void;
}): boolean {
  if (o.pro || o.clientId || o.alreadyOpen) return false;
  o.track('paywall_view', { source: 'export', format: o.format });
  o.open();
  return true;
}


/** The pass the /pro page highlights: the one named in ?plan=, else the 30-day pass. */
export function featuredPlan(search: string): PlanId {
  const p = new URLSearchParams(search).get('plan');
  return PLANS.find((x) => x.id === p)?.id ?? 'pro-30';
}

/** Run the print step, then (only after it finishes) show the offer. `offer` null/undefined means no offer for this export. */
export async function runExport(print: () => Promise<void>, offer?: (() => void) | null): Promise<void> {
  await print();
  offer?.();
}
