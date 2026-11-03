import { describe, expect, it } from 'vitest';
import { DAY_MS, findPlan } from '../shared/plans';
import { userForPhone } from './auth';
import type { D1Like } from './cf';
import { grantPass, recordOrder, reminderText, sendReminders } from './entitlements';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 3, 6);
const pro7 = findPlan('pro-7')!;
const pro30 = findPlan('pro-30')!;

const setup = async () => {
  const db = fakeD1();
  const user = await userForPhone(db, '01712345678', 'bn', NOW);
  const order = (invoiceId: string, plan = pro7) => ({ invoiceId, productId: plan.id, amount: plan.price, userId: user.id, phone: user.phone });
  return { db, user, order };
};

const until = async (db: D1Like, id: string) =>
  (await db.prepare('SELECT pro_until FROM entitlements WHERE user_id = ?').bind(id).first<{ pro_until: number | null }>())?.pro_until ?? null;

describe('grantPass', () => {
  it('starts Pro from now for a new user and records the order', async () => {
    const { db, user, order } = await setup();
    const r = await grantPass(db, order('INV1'), pro7, NOW);
    expect(r).toEqual({ granted: true, proUntil: NOW + 7 * DAY_MS });
    const o = await db.prepare('SELECT status, amount_bdt, user_id FROM orders WHERE gateway_ref = ?').bind('INV1').first();
    expect(o).toEqual({ status: 'paid', amount_bdt: 49, user_id: user.id });
  });

  it('adds a second pass on top of the time left', async () => {
    const { db, user, order } = await setup();
    await grantPass(db, order('INV1'), pro7, NOW);
    const r = await grantPass(db, order('INV2', pro30), pro30, NOW + DAY_MS);
    expect(r.proUntil).toBe(NOW + 37 * DAY_MS);
    expect(await until(db, user.id)).toBe(NOW + 37 * DAY_MS);
  });

  it('starts again from now when the old pass has ended', async () => {
    const { db, order } = await setup();
    await grantPass(db, order('INV1'), pro7, NOW);
    const later = NOW + 20 * DAY_MS;
    expect((await grantPass(db, order('INV2'), pro7, later)).proUntil).toBe(later + 7 * DAY_MS);
  });

  it('grants once per invoice, however often it is verified', async () => {
    const { db, user, order } = await setup();
    const first = await grantPass(db, order('INV1'), pro7, NOW);
    const again = await grantPass(db, order('INV1'), pro7, NOW + 1000);
    const third = await grantPass(db, order('INV1'), pro7, NOW + 2000);
    expect(first.granted).toBe(true);
    expect(again).toEqual({ granted: false, proUntil: NOW + 7 * DAY_MS });
    expect(third.granted).toBe(false);
    expect(await until(db, user.id)).toBe(NOW + 7 * DAY_MS);
    const n = await db.prepare('SELECT COUNT(*) AS n FROM orders WHERE gateway_ref = ?').bind('INV1').first<{ n: number }>();
    expect(n?.n).toBe(1);
  });
});

describe('recordOrder', () => {
  it('keeps one row per invoice', async () => {
    const db = fakeD1();
    const o = { invoiceId: 'T1', productId: 'tpl-x', amount: 99, userId: null, phone: '01812345678' };
    await recordOrder(db, o, NOW);
    await recordOrder(db, o, NOW + 5);
    const rows = await db.prepare('SELECT phone FROM orders').all();
    expect(rows.results).toEqual([{ phone: '01812345678' }]);
  });
});

describe('sendReminders', () => {
  const sms = () => {
    const sent: { to: string; msg: string }[] = [];
    return { sent, send: async (to: string, msg: string) => (sent.push({ to, msg }), true) };
  };

  it('sends "ending soon" once, within 3 days of the end', async () => {
    const { db, order } = await setup();
    await grantPass(db, order('INV1'), pro7, NOW); // ends NOW + 7 days
    const s = sms();
    expect((await sendReminders(db, s, NOW + 3 * DAY_MS)).soon).toBe(0); // 4 days left: too early
    expect((await sendReminders(db, s, NOW + 5 * DAY_MS)).soon).toBe(1);
    expect((await sendReminders(db, s, NOW + 6 * DAY_MS)).soon).toBe(0); // already sent
    expect(s.sent).toEqual([{ to: '01712345678', msg: reminderText.soon(NOW + 7 * DAY_MS) }]);
  });

  it('sends "ended" once after the end, and again for a new pass', async () => {
    const { db, order } = await setup();
    await grantPass(db, order('INV1'), pro7, NOW);
    const s = sms();
    const after = NOW + 7 * DAY_MS + 3600_000;
    expect((await sendReminders(db, s, after)).ended).toBe(1);
    expect((await sendReminders(db, s, after + 3600_000)).ended).toBe(0);
    expect((await sendReminders(db, s, NOW + 30 * DAY_MS)).ended).toBe(0); // long ended: no message

    // Renewing moves the end date, so the next end gets its own reminders.
    await grantPass(db, order('INV2'), pro7, NOW + 30 * DAY_MS);
    expect((await sendReminders(db, s, NOW + 35 * DAY_MS)).soon).toBe(1);
  });

  it('retries next run when the SMS fails', async () => {
    const { db, order } = await setup();
    await grantPass(db, order('INV1'), pro7, NOW);
    const down = { send: async () => false };
    expect(await sendReminders(db, down, NOW + 5 * DAY_MS)).toEqual({ soon: 0, ended: 0, failed: 1 });
    expect((await sendReminders(db, sms(), NOW + 5 * DAY_MS)).soon).toBe(1);
  });

  it('dates the SMS in Dhaka time', () => {
    // 3 Nov 20:00 UTC is already 4 Nov in Dhaka
    expect(reminderText.soon(Date.UTC(2026, 10, 3, 20))).toContain('4 Nov');
  });
});
