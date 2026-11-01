// POST /api/verify — confirms a payment with the gateway after the buyer returns.
// Returns only what the success page needs, and checks the amount paid
// against the catalogue price for the product in the order.

import { findProduct } from '../../shared/catalog';
import { callGateway, isAllowedOrigin, json, type Env } from '../../server/paymently';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);

  const body = (await request.json().catch(() => ({}))) as { invoiceId?: unknown };
  const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId.trim().slice(0, 80) : '';
  if (!invoiceId) return json({ ok: false, error: 'invoice' }, 400);

  try {
    const { data } = await callGateway(env, 'verify-payment', { invoice_id: invoiceId });
    const meta = (data.metadata ?? {}) as Record<string, unknown>;
    const product = findProduct(String(meta.product_id ?? ''));
    const amount = Number(data.amount ?? data.charged_amount ?? 0);
    const status = String(data.status ?? '').toUpperCase();

    const paid = status === 'COMPLETED' && !!product && amount >= product.price;

    return json({
      ok: true,
      status: paid ? 'paid' : status === 'PENDING' ? 'pending' : 'unpaid',
      invoiceId,
      productId: product?.id ?? null,
      amount,
      name: typeof data.full_name === 'string' ? data.full_name : null,
      method: typeof data.payment_method === 'string' ? data.payment_method : null,
      transactionId: typeof data.transaction_id === 'string' ? data.transaction_id : null,
    });
  } catch (err) {
    console.error('verify failed', err);
    return json({ ok: false, error: 'gateway' }, 502);
  }
};
