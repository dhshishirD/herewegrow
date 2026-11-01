// Payment API handlers, run inside the Cloudflare Worker (see worker/index.ts).
// The amount always comes from the shared catalogue, never from the request.

import { findProduct } from '../shared/catalog';
import { callGateway, describeFailure, isAllowedOrigin, json, type Env } from './paymently';

interface CheckoutBody {
  productId?: string;
  name?: string;
  phone?: string;
  email?: string;
  note?: string;
  lang?: string;
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** POST /api/checkout: starts a bKash/Nagad/Rocket payment for one catalogue item. */
export async function handleCheckout(request: Request, env: Env): Promise<Response> {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);

  const body = (await request.json().catch(() => ({}))) as CheckoutBody;
  const product = findProduct(clean(body.productId, 40));
  if (!product) return json({ ok: false, error: 'product' }, 400);

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20).replace(/[\s-]/g, '').replace(/^\+?88/, '');
  const email = clean(body.email, 120);
  const note = clean(body.note, 500);

  if (name.length < 2) return json({ ok: false, error: 'name' }, 400);
  if (!/^01[3-9]\d{8}$/.test(phone)) return json({ ok: false, error: 'phone' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'email' }, 400);

  const origin = new URL(request.url).origin;
  try {
    const payload = {
      full_name: name,
      email: email || 'orders@herewegrow.pro',
      amount: String(product.price),
      metadata: {
        product_id: product.id,
        product_name: product.name.en,
        phone,
        customer_email: email,
        note,
        lang: body.lang === 'en' ? 'en' : 'bn',
      },
      redirect_url: `${origin}/payment/success`,
      return_type: 'GET',
      cancel_url: `${origin}/payment/cancel`,
    };

    // The v2 endpoint first, then the older one, as some panels only offer one of them.
    let result = await callGateway(env, 'checkout-v2', payload);
    if (!(result.data.status && typeof result.data.payment_url === 'string')) {
      const fallback = await callGateway(env, 'checkout', payload);
      if (fallback.data.status && typeof fallback.data.payment_url === 'string') result = fallback;
      else console.error('checkout gateway refused', describeFailure(result), '| fallback', describeFailure(fallback));
      if (result !== fallback && !(result.data.status && typeof result.data.payment_url === 'string')) {
        return json({ ok: false, error: 'gateway', detail: describeFailure(result) }, 502);
      }
    }
    return json({ ok: true, paymentUrl: result.data.payment_url });
  } catch (err) {
    console.error('checkout failed', err);
    return json({ ok: false, error: 'gateway', detail: err instanceof Error ? err.message : 'request failed' }, 502);
  }
}

/** POST /api/verify: confirms a payment and checks the amount against the catalogue price. */
export async function handleVerify(request: Request, env: Env): Promise<Response> {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);

  const body = (await request.json().catch(() => ({}))) as { invoiceId?: unknown };
  const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId.trim().slice(0, 80) : '';
  if (!invoiceId) return json({ ok: false, error: 'invoice' }, 400);

  try {
    const { data, httpStatus } = await callGateway(env, 'verify-payment', { invoice_id: invoiceId });
    if (httpStatus >= 400) console.error('verify gateway status', httpStatus, data.message ?? '');
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
}
