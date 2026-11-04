// Payment API handlers, run inside the Cloudflare Worker (see worker/index.ts).
// The amount always comes from the shared catalogue, never from the request.

import { CART_PRODUCT_ID, cartProduct, quoteCart } from '../shared/cart';
import { findProduct } from '../shared/catalog';
import { findPlan, templatePrice, type Plan } from '../shared/plans';
import { scopeFor } from '../shared/promo';
import { getSessionUser, type User } from './auth';
import { downloadLinks } from './downloads';
import { grantPass, recordOrder } from './entitlements';
import { callGateway, describeFailure, isAllowedOrigin, json, type Env } from './paymently';
import { checkPromo, lookupPromo, normalizeCode, priceWith, recordRedemption, type Promo, type PromoError } from './promo';
import { activePlan, claimTemplate } from './templatePerks';

interface CheckoutBody {
  productId?: string;
  /** For a cart: the template ids chosen. */
  templateIds?: unknown;
  name?: string;
  phone?: string;
  email?: string;
  note?: string;
  lang?: string;
  /** A promo code typed by the buyer; the server decides what, if anything, it changes. */
  promo?: unknown;
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export interface Quote {
  /** List price of the item. */
  list: number;
  /** Price without a code: the list price, or the Pro member's discounted price. */
  base: number;
  /** What will be charged. */
  price: number;
  /** The code, only when it gives a lower price than `base`. */
  promo: Promo | null;
  plan?: Plan;
  product?: ReturnType<typeof resolveTemplateProduct>['product'];
  cartIds: string[];
  proPlanId: string;
}
export type QuoteFailure = { status: number; error: string; reason?: PromoError };

/**
 * The one place a price is worked out, for checkout and for the "check my code" box.
 * Order of rules: list price, then a Pro member's template discount, then a promo code if it is cheaper (never both).
 */
export async function quoteFor(env: Env, user: User | null, body: CheckoutBody, now = Date.now()): Promise<Quote | QuoteFailure> {
  const productId = clean(body.productId, 40);
  const plan = findPlan(productId);
  let list: number;
  let base: number;
  let cartIds: string[] = [];
  let proPlanId = '';
  let product: Quote['product'];
  if (plan) {
    list = base = plan.price;
  } else {
    ({ product, cartIds } = resolveTemplateProduct(body));
    if (!product) return { status: 400, error: 'product' };
    list = base = product.price;
    // Pro members get the template discount. The plan is read from the account here, never from the request.
    if (product.kind !== 'service' && env.DB && user) {
      const pp = await activePlan(env.DB, user.id);
      if (pp && pp.templateOff >= 100) return { status: 409, error: 'claim' };
      if (pp) {
        base = templatePrice(list, pp.id);
        proPlanId = pp.id;
      }
    }
  }

  const code = typeof body.promo === 'string' ? body.promo.trim() : '';
  if (!code) return { list, base, price: base, promo: null, plan, product, cartIds, proPlanId };
  if (!env.DB) return { status: 503, error: 'config' };
  const checked = await checkPromo(env.DB, code, { scope: scopeFor(productId), userId: user?.id ?? null, now });
  if (!checked.ok) return { status: 400, error: 'promo', reason: checked.error };
  if (checked.promo.type === 'trial_days') return { status: 400, error: 'promo', reason: 'type' };
  const withCode = priceWith(list, checked.promo);
  return { list, base, price: Math.min(base, withCode), promo: withCode < base ? checked.promo : null, plan, product, cartIds, proPlanId };
}

const failed = (q: Quote | QuoteFailure): q is QuoteFailure => 'status' in q;

/** POST /api/checkout: starts a bKash/Nagad/Rocket payment for one catalogue item. */
export async function handleCheckout(request: Request, env: Env): Promise<Response> {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);

  const body = (await request.json().catch(() => ({}))) as CheckoutBody;
  const lang = body.lang === 'en' ? 'en' : 'bn';

  // A Pro pass is tied to an account, so the buyer must be logged in.
  const isPlan = !!findPlan(clean(body.productId, 40));
  const user = isPlan || env.DB ? await getSessionUser(env, request).catch(() => null) : null;
  if (isPlan && !user) return json({ ok: false, error: 'login' }, 401);

  const q = await quoteFor(env, user, body);
  if (failed(q)) return json({ ok: false, error: q.error, ...(q.reason ? { reason: q.reason } : {}) }, q.status);

  if (q.plan) return startPayment(request, env, planPayload(q.plan, user!, lang, q.price, q.promo));

  const product = q.product!;
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
    amount: String(q.price),
    metadata: {
      pro_plan: q.proPlanId,
      promo: q.promo?.code ?? '',
      product_id: product.id,
      product_name: product.name.en,
      template_ids: q.cartIds.join(','),
      phone,
      customer_email: email,
      note,
      lang,
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
const planPayload = (plan: Plan, user: User, lang: string, price: number, promo: Promo | null): PaymentPayload => ({
  full_name: user.name || 'HereWeGrow customer',
  email: user.email || 'orders@herewegrow.pro',
  amount: String(price),
  metadata: { product_id: plan.id, product_name: plan.name.en, user_id: user.id, phone: user.phone ?? '', lang, promo: promo?.code ?? '' },
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

    // The discount plan and promo code were stored in the payment's metadata by this server at checkout.
    // A code is looked up as stored (even if switched off since), so a payment started in good time still counts.
    const promoRow = product && normalizeCode(meta.promo) && env.DB ? await lookupPromo(env.DB, meta.promo).catch(() => null) : null;
    const need = product
      ? promoRow
        ? priceWith(product.price, promoRow)
        : templatePrice(product.price, findPlan(String(meta.pro_plan ?? ''))?.id ?? null)
      : 0;
    const paid = status === 'COMPLETED' && !!product && amount >= need;
    const downloads = paid && product ? await downloadLinks(env, invoiceId, product) : [];
    if (paid && product && env.DB) {
      // Keep a record for support and for linking to an account later. Never blocks the buyer's files.
      const user = await getSessionUser(env, request).catch(() => null);
      const phone = String(meta.phone ?? '') || null;
      await recordOrder(env.DB, { invoiceId, productId: product.id, amount, userId: user?.id ?? null, phone }).catch((e) => console.error('record order failed', e));
      if (promoRow) {
        const discount = Math.max(0, product.price - amount);
        await recordRedemption(env.DB, { code: promoRow.code, userId: user?.id ?? null, invoiceId, amount, discount, kind: 'discount' }).catch((e) => console.error('record promo failed', e));
      }
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
  const promoRow = env.DB && normalizeCode(meta.promo) ? await lookupPromo(env.DB, meta.promo).catch(() => null) : null;
  const need = promoRow ? priceWith(plan.price, promoRow) : plan.price;
  if (amount < need || !userId || !env.DB) {
    // Money arrived but something does not match: no Pro time, and the log flags it for a manual check.
    console.error('pro verify mismatch: no grant', { invoiceId, plan: plan.id, amount, need, hasUser: !!userId, hasDb: !!env.DB });
    return json({ ...base, status: 'unpaid', error: 'mismatch' });
  }
  try {
    const phone = String(meta.phone ?? '') || null;
    const r = await grantPass(env.DB, { invoiceId, productId: plan.id, amount, userId, phone }, plan);
    if (promoRow) {
      await recordRedemption(env.DB, { code: promoRow.code, userId, invoiceId, amount, discount: Math.max(0, plan.price - amount), kind: 'discount' }).catch((e) => console.error('record promo failed', e));
    }
    return json({ ...base, status: 'paid', proUntil: r.proUntil });
  } catch (err) {
    console.error('pro grant failed', invoiceId, err);
    return json({ ok: false, error: 'grant' }, 502);
  }
}

/** Product for a template, pack or cart request. Shared by checkout and claim. */
export function resolveTemplateProduct(body: CheckoutBody) {
  let cartIds: string[] = [];
  let product = findProduct(clean(body.productId, 40));
  if (clean(body.productId, 40) === CART_PRODUCT_ID) {
    const raw = Array.isArray(body.templateIds) ? body.templateIds.filter((x): x is string => typeof x === 'string').slice(0, 60) : [];
    const quote = quoteCart(raw);
    if (quote.count === 0) return { product: undefined, cartIds };
    product = cartProduct(quote);
    if (product.id === CART_PRODUCT_ID) cartIds = quote.ids;
  }
  return { product, cartIds };
}

/** POST /api/claim: a Pro member takes templates included in their pass (30-day: one a month, yearly: all). */
export async function handleClaim(request: Request, env: Env): Promise<Response> {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'origin' }, 403);
  if (!env.DB || !env.KV) return json({ ok: false, error: 'config' }, 503);
  const user = await getSessionUser(env, request).catch(() => null);
  if (!user) return json({ ok: false, error: 'login' }, 401);
  const plan = await activePlan(env.DB, user.id);
  if (!plan) return json({ ok: false, error: 'pro' }, 403);

  const body = (await request.json().catch(() => ({}))) as CheckoutBody;
  const { product } = resolveTemplateProduct(body);
  if (!product) return json({ ok: false, error: 'product' }, 400);

  // Make the links first, so a missing file never uses up a claim.
  const invoiceId = `claim-${crypto.randomUUID()}`;
  const downloads = await downloadLinks(env, invoiceId, product);
  if (!downloads.length) return json({ ok: false, error: 'file' }, 503);
  const r = await claimTemplate(env.DB, env.KV, user.id, plan, product);
  if (!r.ok) return json({ ok: false, error: r.error }, r.error === 'product' ? 400 : 403);
  return json({ ok: true, productId: product.id, downloads });
}
