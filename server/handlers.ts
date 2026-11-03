// Payment API handlers, run inside the Cloudflare Worker (see worker/index.ts).
// The amount always comes from the shared catalogue, never from the request.

import { CART_PRODUCT_ID, cartProduct, quoteCart } from '../shared/cart';
import { findProduct } from '../shared/catalog';
import { findPlan, type Plan } from '../shared/plans';
import { getSessionUser, type User } from './auth';
import { downloadLinks } from './downloads';
import { grantPass, recordOrder } from './entitlements';
import { callGateway, describeFailure, isAllowedOrigin, json, type Env } from './paymently';

interface CheckoutBody {
  productId?: string;
  /** For a cart: the template ids chosen. */
  templateIds?: unknown;
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

  // A Pro pass is tied to an account, so the buyer must be logged in.
  const plan = findPlan(clean(body.productId, 40));
  if (plan) {
    const user = await getSessionUser(env, request);
    if (!user) return json({ ok: false, error: 'login' }, 401);
    return startPayment(request, env, planPayload(plan, user, body.lang === 'en' ? 'en' : 'bn'));
  }

  // A cart is priced here from the template ids, with the same rules the site shows.
  let cartIds: string[] = [];
  let product = findProduct(clean(body.productId, 40));
  if (clean(body.productId, 40) === CART_PRODUCT_ID) {
    const raw = Array.isArray(body.templateIds) ? body.templateIds.filter((x): x is string => typeof x === 'string').slice(0, 60) : [];
    const quote = quoteCart(raw);
    if (quote.count === 0) return json({ ok: false, error: 'product' }, 400);
    product = cartProduct(quote);
    if (product.id === CART_PRODUCT_ID) cartIds = quote.ids;
  }
  if (!product) return json({ ok: false, error: 'product' }, 400);

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20).replace(/[\s-]/g, '').replace(/^\+?88/, '');
  const email = clean(body.email, 120);
  const note = clean(body.note, 500);

  // Every field is optional: a buyer can pay without giving any details.
  // Anything given is checked so typos are caught; empty is fine.
  if (phone && !/^01[3-9]\d{8}$/.test(phone)) return json({ ok: false, error: 'phone' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'email' }, 400);

  return startPayment(request, env, {
    full_name: name || 'HereWeGrow customer',
    email: email || 'orders@herewegrow.pro',
    amount: String(product.price),
    metadata: {
      product_id: product.id,
      product_name: product.name.en,
      template_ids: cartIds.join(','),
      phone,
      customer_email: email,
      note,
      lang: body.lang === 'en' ? 'en' : 'bn',
    },
  });
}

interface PaymentPayload {
  full_name: string;
  email: string;
  amount: string;
  metadata: Record<string, string>;
}

/** Metadata for a Pro pass. The user id is set here, on the server, and read back at verify. */
const planPayload = (plan: Plan, user: User, lang: string): PaymentPayload => ({
  full_name: user.name || 'HereWeGrow customer',
  email: user.email || 'orders@herewegrow.pro',
  amount: String(plan.price),
  metadata: { product_id: plan.id, product_name: plan.name.en, user_id: user.id, phone: user.phone ?? '', lang },
});

async function startPayment(request: Request, env: Env, base: PaymentPayload): Promise<Response> {
  const origin = new URL(request.url).origin;
  try {
    const payload = { ...base, redirect_url: `${origin}/payment/success`, return_type: 'GET', cancel_url: `${origin}/payment/cancel` };

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
    const productId = String(meta.product_id ?? '');
    const product =
      productId === CART_PRODUCT_ID
        ? (() => {
            const quote = quoteCart(String(meta.template_ids ?? '').split(','));
            return quote.count > 1 && !quote.upgrade ? cartProduct(quote) : undefined;
          })()
        : findProduct(productId);
    const amount = Number(data.amount ?? data.charged_amount ?? 0);
    const status = String(data.status ?? '').toUpperCase();

    const plan = findPlan(productId);
    if (plan) return verifyPlan(env, invoiceId, plan, meta, data, amount, status);

    const paid = status === 'COMPLETED' && !!product && amount >= product.price;
    const downloads = paid && product ? await downloadLinks(env, invoiceId, product) : [];
    if (paid && product && env.DB) {
      // Keep a record for support and for linking to an account later. Never blocks the buyer's files.
      const user = await getSessionUser(env, request).catch(() => null);
      const phone = String(meta.phone ?? '') || null;
      await recordOrder(env.DB, { invoiceId, productId: product.id, amount, userId: user?.id ?? null, phone }).catch((e) => console.error('record order failed', e));
    }

    return json({
      ok: true,
      status: paid ? 'paid' : status === 'PENDING' ? 'pending' : 'unpaid',
      invoiceId,
      productId: product?.id ?? null,
      templateIds: product?.id === CART_PRODUCT_ID ? product.templates : undefined,
      amount,
      name: typeof data.full_name === 'string' ? data.full_name : null,
      method: typeof data.payment_method === 'string' ? data.payment_method : null,
      transactionId: typeof data.transaction_id === 'string' ? data.transaction_id : null,
      downloads,
    });
  } catch (err) {
    console.error('verify failed', err);
    return json({ ok: false, error: 'gateway' }, 502);
  }
}

/** A Pro pass payment: check it, then add the days to the account named in the payment's metadata. */
async function verifyPlan(
  env: Env,
  invoiceId: string,
  plan: Plan,
  meta: Record<string, unknown>,
  data: Record<string, unknown>,
  amount: number,
  status: string,
): Promise<Response> {
  const userId = String(meta.user_id ?? '');
  const base = {
    ok: true,
    invoiceId,
    productId: plan.id,
    amount,
    transactionId: typeof data.transaction_id === 'string' ? data.transaction_id : null,
    downloads: [],
  };
  if (status === 'PENDING') return json({ ...base, status: 'pending' });
  if (status !== 'COMPLETED') return json({ ...base, status: 'unpaid' });
  if (amount < plan.price || !userId || !env.DB) {
    // Money arrived but something does not match: no Pro time, and the log flags it for a manual check.
    console.error('pro verify mismatch: no grant', { invoiceId, plan: plan.id, amount, hasUser: !!userId, hasDb: !!env.DB });
    return json({ ...base, status: 'unpaid', error: 'mismatch' });
  }
  try {
    const phone = String(meta.phone ?? '') || null;
    const r = await grantPass(env.DB, { invoiceId, productId: plan.id, amount, userId, phone }, plan);
    return json({ ...base, status: 'paid', proUntil: r.proUntil });
  } catch (err) {
    console.error('pro grant failed', invoiceId, err);
    return json({ ok: false, error: 'grant' }, 502);
  }
}
