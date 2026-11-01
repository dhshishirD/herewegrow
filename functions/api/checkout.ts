// POST /api/checkout — starts a bKash/Nagad/Rocket payment for one catalogue item.
// The amount always comes from the shared catalogue, never from the request.

import { findProduct } from '../../shared/catalog';
import { callGateway, isAllowedOrigin, json, type Env } from '../../server/paymently';

interface CheckoutBody {
  productId?: string;
  name?: string;
  phone?: string;
  email?: string;
  note?: string;
  lang?: string;
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
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
    const { data } = await callGateway(env, 'checkout-v2', {
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
    });

    if (data.status && typeof data.payment_url === 'string') {
      return json({ ok: true, paymentUrl: data.payment_url });
    }
    return json({ ok: false, error: 'gateway', message: data.message ?? null }, 502);
  } catch (err) {
    console.error('checkout failed', err);
    return json({ ok: false, error: 'gateway' }, 502);
  }
};
