import { describe, expect, it } from 'vitest';
import { findPlan } from '../shared/plans';
import { applyPartner } from './partner';
import { userForGoogle, userForPhone } from './auth';
import { grantPass, recordOrder } from './entitlements';
import { createCv } from './cvs';
import { linkPhone } from './link';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 12, 6);
const g = { sub: 'g-1', email: 'rina@example.com', name: 'Rina Akter' };

describe('connect a phone number', () => {
  it('just adds the phone when nobody has it', async () => {
    const db = fakeD1();
    const u = await userForGoogle(db, g, NOW);
    const r = await linkPhone(db, u, '01711111111', NOW);
    expect(r).toEqual({ ok: true, userId: u.id, merged: false });
    expect((await userForPhone(db, '01711111111', 'bn', NOW)).id).toBe(u.id);
    expect(await linkPhone(db, { ...u, phone: '01711111111' }, '01722222222', NOW)).toEqual({ ok: false, error: 'already' });
  });

  it('merges a Google-only account into the phone account that holds the pass', async () => {
    const db = fakeD1();
    const phoneUser = await userForPhone(db, '01711111111', 'bn', NOW);
    const plan = findPlan('partner-30')!;
    await applyPartner(db, phoneUser, { name: 'Rina Akter', terms: true }, NOW);
    await grantPass(db, { invoiceId: 'INV-P', productId: plan.id, amount: plan.price, userId: phoneUser.id, phone: '01711111111' }, plan, NOW);
    const googleUser = await userForGoogle(db, g, NOW);
    await createCv(db, googleUser, { title: 'My Google CV', state: { data: { name: 'Rina' } } }, NOW);
    await recordOrder(db, { invoiceId: 'INV-G', productId: 'cv-fresher', amount: 499, userId: googleUser.id, phone: null }, NOW);
    const pro = findPlan('pro-7')!;
    await grantPass(db, { invoiceId: 'INV-G2', productId: pro.id, amount: pro.price, userId: googleUser.id, phone: null }, pro, NOW);

    const r = await linkPhone(db, googleUser, '01711111111', NOW + 1000);
    expect(r).toEqual({ ok: true, userId: phoneUser.id, merged: true });

    const one = async (sql: string, ...b: unknown[]) => db.prepare(sql).bind(...b).first<Record<string, unknown>>();
    expect(await one('SELECT id FROM users WHERE id = ?', googleUser.id)).toBeNull();
    expect(await one('SELECT google_sub, email FROM users WHERE id = ?', phoneUser.id)).toMatchObject({ google_sub: 'g-1', email: 'rina@example.com' });
    expect((await one('SELECT COUNT(*) AS n FROM cvs WHERE user_id = ?', phoneUser.id))?.n).toBe(1);
    expect((await one('SELECT COUNT(*) AS n FROM orders WHERE user_id = ?', phoneUser.id))?.n).toBeGreaterThanOrEqual(2);
    expect(await one('SELECT user_id FROM partner_profiles WHERE user_id = ?', phoneUser.id)).toBeTruthy();
    // 30 days from the partner pass + the 7 Pro days, added together.
    const until = (await one('SELECT pro_until FROM entitlements WHERE user_id = ?', phoneUser.id))?.pro_until as number;
    expect(Math.round((until - NOW) / 86_400_000)).toBe(37);
    // Logging in with Google now opens the phone account.
    expect((await userForGoogle(db, g, NOW + 2000)).id).toBe(phoneUser.id);
  });

  it('refuses to join two partner accounts and changes nothing', async () => {
    const db = fakeD1();
    const a = await userForPhone(db, '01711111111', 'bn', NOW);
    const b = await userForGoogle(db, g, NOW);
    await applyPartner(db, a, { name: 'A Partner', terms: true }, NOW);
    await applyPartner(db, b, { name: 'B Partner', terms: true }, NOW);
    expect(await linkPhone(db, b, '01711111111', NOW)).toEqual({ ok: false, error: 'conflict' });
    expect(await db.prepare('SELECT id FROM users WHERE id = ?').bind(b.id).first()).toBeTruthy();
  });
});
