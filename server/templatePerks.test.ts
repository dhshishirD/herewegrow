import { describe, expect, it } from 'vitest';
import { findProduct } from '../shared/catalog';
import { DAY_MS, PRO_LIMITS, findPlan, templatePrice } from '../shared/plans';
import { TEMPLATES } from '../shared/templates';
import { userForPhone } from './auth';
import { grantPass } from './entitlements';
import { activePlan, claimTemplate, dayKey } from './templatePerks';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 4, 6);
const tpl = (i: number) => findProduct(`tpl-${TEMPLATES[i].id}`)!;
const pack = findProduct('pack-best-40')!;

const setup = async (planId: string, extra?: string) => {
  const db = fakeD1();
  const kv = fakeKV();
  const user = await userForPhone(db, '01712345678', 'bn', NOW);
  for (const [i, id] of [planId, extra].entries()) {
    if (!id) continue;
    const plan = findPlan(id)!;
    await grantPass(db, { invoiceId: `INV${i}`, productId: id, amount: plan.price, userId: user.id, phone: user.phone }, plan, NOW);
  }
  return { db, kv, user };
};

describe('template discount', () => {
  it('halves the price for 7 and 30 day passes, rounding up', () => {
    expect(templatePrice(39, 'pro-7')).toBe(20);
    expect(templatePrice(39, 'pro-30')).toBe(20);
    expect(templatePrice(39, 'pro-365')).toBe(0);
    expect(templatePrice(39, null)).toBe(39);
  });
});

describe('activePlan', () => {
  it('is null without Pro', async () => {
    const { db, user } = await setup('pro-7');
    expect(await activePlan(db, user.id, NOW + 8 * DAY_MS)).toBeNull();
  });
  it('keeps the yearly perks after a short top-up', async () => {
    const { db, user } = await setup('pro-365', 'pro-7');
    expect((await activePlan(db, user.id, NOW + DAY_MS))?.id).toBe('pro-365');
  });
});

describe('claimTemplate', () => {
  it('7-day pass gets no free templates', async () => {
    const { db, kv, user } = await setup('pro-7');
    expect(await claimTemplate(db, kv, user.id, findPlan('pro-7')!, tpl(0), NOW)).toEqual({ ok: false, error: 'plan' });
  });
  it('30-day pass gets one single template a month, not a pack', async () => {
    const { db, kv, user } = await setup('pro-30');
    const plan = findPlan('pro-30')!;
    expect(await claimTemplate(db, kv, user.id, plan, pack, NOW)).toEqual({ ok: false, error: 'single' });
    expect(await claimTemplate(db, kv, user.id, plan, tpl(0), NOW)).toEqual({ ok: true });
    expect(await claimTemplate(db, kv, user.id, plan, tpl(1), NOW)).toEqual({ ok: false, error: 'used' });
    expect(await claimTemplate(db, kv, user.id, plan, tpl(1), NOW + 31 * DAY_MS)).toEqual({ ok: true });
  });
  it('yearly pass takes everything up to the daily limit', async () => {
    const { db, kv, user } = await setup('pro-365');
    const plan = findPlan('pro-365')!;
    for (let i = 0; i < PRO_LIMITS.templateDownloadsPerDay; i++) expect((await claimTemplate(db, kv, user.id, plan, tpl(i % 3), NOW)).ok).toBe(true);
    expect(await claimTemplate(db, kv, user.id, plan, tpl(0), NOW)).toEqual({ ok: false, error: 'limit' });
    expect(kv.store.get(`q:dl:${user.id}:${dayKey(NOW)}`)).toBe('10');
    expect((await claimTemplate(db, kv, user.id, plan, pack, NOW + DAY_MS)).ok).toBe(true);
  });
  it('rejects services', async () => {
    const { db, kv, user } = await setup('pro-365');
    expect(await claimTemplate(db, kv, user.id, findPlan('pro-365')!, findProduct('linkedin-profile')!, NOW)).toEqual({ ok: false, error: 'product' });
  });
});
