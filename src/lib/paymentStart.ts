import { track as defaultTrack } from './track';

/** Count the start of payment, then send the visitor to the payment page. */
export function goToPayment(
  url: string,
  product: string,
  deps: { track?: typeof defaultTrack; assign?: (u: string) => void } = {},
): void {
  (deps.track ?? defaultTrack)('payment_start', { product });
  (deps.assign ?? ((u: string) => window.location.assign(u)))(url);
}
