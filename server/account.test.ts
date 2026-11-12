import { describe, expect, it } from 'vitest';
import { findPlan } from '../shared/plans';
import { userForPhone } from './auth';
import { accountSummary } from './account';
import { grantPass, recordOrder } from './entitlements';
import { createCv } from './cvs';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 12, 6);

describe('account summary', () => {
  it('shows only this person’s CVs, orders and passes', async () => {
    const db = fakeD1();
    const a = await userForPhone(db, '01711111111', 'bn', NOW);
    const b = await userForPhone(db, '01722222222', 'bn', NOW);
    await createCv(db, a, { title: 'A CV', state: { data: { name: 'A' } } }, NOW);
    await createCv(db, b, { title: 'B CV', state: { data: { name: 'B' } } }, NOW);
    await recordOrder(db, { invoiceId: 'INV-1', productId: 'cv-fresher', amount: 499, userId: a.id, phone: '01711111111' }, NOW);
    await recordOrder(db, { invoiceId: 'INV-2', productId: 'cv-fresher', amount: 499, userId: b.id, phone: '01722222222' }, NOW);
    const plan = findPlan('partner-30')!;
    await grantPass(db, { invoiceId: 'INV-3', productId: plan.id, amount: plan.price, userId: a.id, phone: '01711111111' }, plan, NOW);
    const s = await accountSummary(db, a, NOW + 1000);
    expect(s.cvs.map((c) => c.title)).toEqual(['A CV']);
    expect(s.cvLimit).toBeGreaterThan(0);
    expect(s.activity.map((x) => x.id).sort()).toEqual(['INV-1', 'INV-3']);
    expect(s.activity.find((x) => x.id === 'INV-1')).toMatchObject({ kind: 'service', amount: 499 });
    expect(s.partner).toEqual({ applied: false, active: false });
    const other = await accountSummary(db, b, NOW + 1000);
    expect(other.activity.map((x) => x.id)).toEqual(['INV-2']);
  });
});
