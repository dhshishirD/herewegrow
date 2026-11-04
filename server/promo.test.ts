import { describe, expect, it } from 'vitest';
import { MIN_PRICE, discountedPrice, scopeFor, type PromoType } from '../shared/promo';
import { userForPhone } from './auth';
import {
  bulkCreatePromos, checkPromo, createPromo, listPromos, lookupPromo, normalizeCode, recordRedemption, redeemTrial, setPromoActive,
} from './promo';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 4, 6);
const DAY = 86_400_000;

const make = async (over: Record<string, unknown> = {}) => {
  const db = fakeD1();
  const r = await createPromo(db, { code: 'EID30', type: 'percent', value: 30, ...over }, NOW);
  if (!r.ok) throw new Error(r.errors.join('; '));
  return { db, promo: r.promo };
};
const user = (db: ReturnType<typeof fakeD1>, phone = '01712345678') => userForPhone(db, phone, 'bn', NOW);

describe('discountedPrice', () => {
  const p = (type: PromoType, value: number) => ({ type, value }) as never;
  it('takes a percentage off, rounding up to whole taka', () => {
    expect(discountedPrice(149, p('percent', 30))).toBe(105); // 104.3 -> 105
    expect(discountedPrice(499, p('percent', 50))).toBe(250);
  });
  it('takes a fixed amount off', () => {
    expect(discountedPrice(149, p('fixed', 50))).toBe(99);
  });
  it(`never goes below the ${MIN_PRICE} taka minimum`, () => {
    expect(discountedPrice(49, p('percent', 100))).toBe(MIN_PRICE);
    expect(discountedPrice(49, p('fixed', 500))).toBe(MIN_PRICE);
  });
  it('never charges more than the list price (even if the list price is under the minimum)', () => {
    expect(discountedPrice(8, p('percent', 10))).toBe(8);
    expect(discountedPrice(49, p('percent', 0))).toBe(49);
  });
  it('a trial code does not change a price', () => {
    expect(discountedPrice(149, p('trial_days', 7))).toBe(149);
  });
});

describe('scopeFor', () => {
  it('sorts products into pro, service and template', () => {
    expect(scopeFor('pro-30')).toBe('pro');
    expect(scopeFor('cv-fresher')).toBe('service');
    expect(scopeFor('pack-best-40')).toBe('template');
    expect(scopeFor('cart')).toBe('template');
  });
});

describe('normalizeCode', () => {
  it('trims and upper-cases', () => expect(normalizeCode('  eid30 ')).toBe('EID30'));
  it('rejects odd input', () => {
    expect(normalizeCode('')).toBeNull();
    expect(normalizeCode('a')).toBeNull();
    expect(normalizeCode("x'; DROP TABLE users;--")).toBeNull();
    expect(normalizeCode(42)).toBeNull();
  });
});

describe('createPromo', () => {
  it('creates a code and finds it case-insensitively', async () => {
    const { db } = await make();
    expect((await lookupPromo(db, 'eid30'))?.value).toBe(30);
  });
  it('rejects bad input with every reason', async () => {
    const db = fakeD1();
    const r = await createPromo(db, { code: '!', type: 'percent', value: 500 }, NOW);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBeGreaterThanOrEqual(2);
  });
  it('rejects a duplicate code', async () => {
    const { db } = await make();
    const again = await createPromo(db, { code: 'eid30', type: 'fixed', value: 10 }, NOW);
    expect(again.ok).toBe(false);
  });
  it('a trial code is limited to Pro and 1 to 365 days', async () => {
    const db = fakeD1();
    const ok = await createPromo(db, { code: 'TRIAL7', type: 'trial_days', value: 7, scope: 'service' }, NOW);
    expect(ok.ok && ok.promo.scope).toBe('pro');
    expect((await createPromo(db, { code: 'TRIAL9', type: 'trial_days', value: 400 }, NOW)).ok).toBe(false);
  });
});

describe('checkPromo', () => {
  const ctx = (over = {}) => ({ scope: 'pro' as const, userId: null as string | null, now: NOW, ...over });

  it('accepts a valid code', async () => {
    const { db } = await make();
    expect(await checkPromo(db, 'eid30', ctx())).toMatchObject({ ok: true });
  });
  it('unknown, inactive and not-yet-started codes all look the same: invalid', async () => {
    const { db } = await make({ startsAt: NOW + DAY });
    expect(await checkPromo(db, 'NOPE', ctx())).toEqual({ ok: false, error: 'invalid' });
    expect(await checkPromo(db, 'EID30', ctx())).toEqual({ ok: false, error: 'invalid' });
    await setPromoActive(db, 'EID30', false);
    expect(await checkPromo(db, 'EID30', ctx({ now: NOW + 2 * DAY }))).toEqual({ ok: false, error: 'invalid' });
  });
  it('an expired code says expired', async () => {
    const { db } = await make({ expiresAt: NOW - 1 });
    expect(await checkPromo(db, 'EID30', ctx())).toEqual({ ok: false, error: 'expired' });
  });
  it('respects the scope', async () => {
    const { db } = await make({ scope: 'service' });
    expect(await checkPromo(db, 'EID30', ctx({ scope: 'pro' }))).toEqual({ ok: false, error: 'scope' });
    expect(await checkPromo(db, 'EID30', ctx({ scope: 'service' }))).toMatchObject({ ok: true });
  });
  it('scope all fits everything', async () => {
    const { db } = await make({ scope: 'all' });
    for (const scope of ['pro', 'service', 'template'] as const) expect(await checkPromo(db, 'EID30', ctx({ scope }))).toMatchObject({ ok: true });
  });
  it('stops at max uses', async () => {
    const { db } = await make({ maxUses: 2 });
    await recordRedemption(db, { code: 'EID30', userId: null, invoiceId: 'A', amount: 100, discount: 40, kind: 'discount' }, NOW);
    expect(await checkPromo(db, 'EID30', ctx())).toMatchObject({ ok: true });
    await recordRedemption(db, { code: 'EID30', userId: null, invoiceId: 'B', amount: 100, discount: 40, kind: 'discount' }, NOW);
    expect(await checkPromo(db, 'EID30', ctx())).toEqual({ ok: false, error: 'used_up' });
  });
  it('limits uses per account (default 1)', async () => {
    const { db } = await make();
    const u = await user(db);
    await recordRedemption(db, { code: 'EID30', userId: u.id, invoiceId: 'A', amount: 100, discount: 40, kind: 'discount' }, NOW);
    expect(await checkPromo(db, 'EID30', ctx({ userId: u.id }))).toEqual({ ok: false, error: 'already_used' });
    const other = await user(db, '01812345678');
    expect(await checkPromo(db, 'EID30', ctx({ userId: other.id }))).toMatchObject({ ok: true });
  });
});

describe('recordRedemption', () => {
  it('is safe to call twice for the same invoice', async () => {
    const { db } = await make({ maxUses: 5 });
    const o = { code: 'EID30', userId: null, invoiceId: 'INV1', amount: 100, discount: 40, kind: 'discount' as const };
    await recordRedemption(db, o, NOW);
    await recordRedemption(db, o, NOW);
    expect((await listPromos(db))[0].used).toBe(1);
  });
});

describe('redeemTrial', () => {
  const trial = (over = {}) => make({ code: 'TRIAL7', type: 'trial_days', value: 7, ...over });

  it('adds the days to the account and records it', async () => {
    const { db } = await trial();
    const u = await user(db);
    const r = await redeemTrial(db, u, 'trial7', NOW);
    expect(r).toEqual({ ok: true, days: 7, proUntil: NOW + 7 * DAY });
    expect((await listPromos(db))[0].used).toBe(1);
  });
  it('gives one free trial per account, even with a different code', async () => {
    const { db } = await trial();
    await createPromo(db, { code: 'TRIAL3', type: 'trial_days', value: 3 }, NOW);
    const u = await user(db);
    await redeemTrial(db, u, 'TRIAL7', NOW);
    expect(await redeemTrial(db, u, 'TRIAL3', NOW + 1)).toEqual({ ok: false, error: 'trial_used' });
    expect(await redeemTrial(db, u, 'TRIAL7', NOW + 1)).toEqual({ ok: false, error: 'trial_used' });
  });
  it('a different account can use the same unlimited code', async () => {
    const { db } = await trial();
    await redeemTrial(db, await user(db), 'TRIAL7', NOW);
    expect(await redeemTrial(db, await user(db, '01812345678'), 'TRIAL7', NOW)).toMatchObject({ ok: true });
  });
  it('single-use codes work once across accounts', async () => {
    const { db } = await trial({ maxUses: 1 });
    expect((await redeemTrial(db, await user(db), 'TRIAL7', NOW)).ok).toBe(true);
    expect(await redeemTrial(db, await user(db, '01812345678'), 'TRIAL7', NOW)).toEqual({ ok: false, error: 'used_up' });
  });
  it('rejects discount codes, unknown codes and expired codes', async () => {
    const { db } = await trial({ expiresAt: NOW - 1 });
    await createPromo(db, { code: 'EID30', type: 'percent', value: 30 }, NOW);
    const u = await user(db);
    expect(await redeemTrial(db, u, 'EID30', NOW)).toEqual({ ok: false, error: 'type' });
    expect(await redeemTrial(db, u, 'NOPE', NOW)).toEqual({ ok: false, error: 'invalid' });
    expect(await redeemTrial(db, u, 'TRIAL7', NOW)).toEqual({ ok: false, error: 'expired' });
  });
  it('stacks on top of Pro time already bought', async () => {
    const { db } = await trial();
    const u = await user(db);
    await db.prepare('UPDATE entitlements SET pro_until = ? WHERE user_id = ?').bind(NOW + 10 * DAY, u.id).run();
    expect(await redeemTrial(db, u, 'TRIAL7', NOW)).toMatchObject({ ok: true, proUntil: NOW + 17 * DAY });
  });
});

describe('bulkCreatePromos and admin list', () => {
  it('makes the requested number of unique single-use codes', async () => {
    const db = fakeD1();
    const r = await bulkCreatePromos(db, { prefix: 'WS', count: 25, type: 'trial_days', value: 7 }, NOW);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(new Set(r.codes).size).toBe(25);
      expect(r.codes.every((c) => /^WS-[A-Z0-9]{6}$/.test(c))).toBe(true);
    }
    const all = await listPromos(db);
    expect(all).toHaveLength(25);
    expect(all.every((p) => p.maxUses === 1)).toBe(true);
  });
  it('limits bulk size', async () => {
    const db = fakeD1();
    expect((await bulkCreatePromos(db, { prefix: 'WS', count: 5000, type: 'trial_days', value: 7 }, NOW)).ok).toBe(false);
    expect((await bulkCreatePromos(db, { prefix: '!!', count: 5, type: 'trial_days', value: 7 }, NOW)).ok).toBe(false);
  });
  it('lists newest first with usage counts', async () => {
    const { db } = await make();
    await createPromo(db, { code: 'LATER', type: 'fixed', value: 10 }, NOW + 5);
    expect((await listPromos(db)).map((p) => p.code)).toEqual(['LATER', 'EID30']);
  });
});
