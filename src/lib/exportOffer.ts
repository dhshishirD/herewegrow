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
