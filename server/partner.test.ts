import { describe, expect, it } from 'vitest';
import { DAY_MS, findPlan } from '../shared/plans';
import { SAMPLE_MARK } from '../shared/partner';
import { userForPhone } from './auth';
import { grantPass } from './entitlements';
import {
  applyPartner, checkDevice, createClient, deleteClient, getClient, getPartner, intakeCv, listClients, markDelivered, revokeBonus, saveClientCv, summary, updateClient,
} from './partner';
import { adminPartnerAction, listPartners, partnerStats } from './partnerAdmin';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 12, 6); // 12 Nov 2026, 12:00 Dhaka
const starter = findPlan('partner-30')!;

async function partner(db: ReturnType<typeof fakeD1>, phone: string, plan = starter, now = NOW) {
  const user = await userForPhone(db, phone, 'bn', now);
  await applyPartner(db, user, { name: 'Rina Akter', terms: true }, now);
  await grantPass(db, { invoiceId: `INV-${phone}`, productId: plan.id, amount: plan.price, userId: user.id, phone }, plan, now);
  return { user, st: (await getPartner(db, user.id, now))! };
}

const goodCv = (name = 'Karim Uddin') => ({
  data: {
    name,
    summary: 'Hardworking graduate.',
    skills: 'Excel, English',
    education: [{ degree: 'BBA', institution: 'DU' }],
    experience: [],
    training: [],
    custom: [],
    references: [],
  },
  design: 'classic',
});

describe('partner pass', () => {
  it('opens the workspace only while a Partner pass runs', async () => {
    const db = fakeD1();
    const user = await userForPhone(db, '01711111111', 'bn', NOW);
    expect(await getPartner(db, user.id, NOW)).toBeNull();
    await applyPartner(db, user, { name: 'Rina', terms: true }, NOW);
    expect((await getPartner(db, user.id, NOW))?.active).toBe(false); // applied, not paid
    await grantPass(db, { invoiceId: 'A', productId: starter.id, amount: 299, userId: user.id, phone: null }, starter, NOW);
    const st = (await getPartner(db, user.id, NOW))!;
    expect(st.active).toBe(true);
    expect(st.rules?.clientCap).toBe(30);
    expect((await getPartner(db, user.id, NOW + 31 * DAY_MS))?.active).toBe(false);
  });

  it('needs the terms ticked', async () => {
    const db = fakeD1();
    const user = await userForPhone(db, '01711111112', 'bn', NOW);
    expect(await applyPartner(db, user, { name: 'Rina', terms: false }, NOW)).toEqual({ ok: false, error: 'terms' });
  });
});

describe('client folders', () => {
  it('blocks new folders at the cap, and deleting does not free a place', async () => {
    const db = fakeD1();
    const { st } = await partner(db, '01711111113');
    const small = { ...st, rules: { ...st.rules!, clientCap: 2 } };
    const a = await createClient(db, small, { name: 'A' }, NOW);
    await createClient(db, small, { name: 'B' }, NOW);
    expect(await createClient(db, small, { name: 'C' }, NOW)).toEqual({ ok: false, error: 'cap' });
    if (a.ok) await deleteClient(db, st.profile.user_id, a.id, NOW);
    expect(await createClient(db, small, { name: 'D' }, NOW)).toEqual({ ok: false, error: 'cap' });
  });

  it('keeps one partner out of another partner’s data', async () => {
    const db = fakeD1();
    const A = await partner(db, '01711111114');
    const B = await partner(db, '01711111115');
    const made = await createClient(db, A.st, { name: 'Secret Client', phone: '01712345678' }, NOW);
    if (!made.ok) throw new Error('create');
    await saveClientCv(db, A.user.id, made.id, goodCv(), NOW);
    expect(await getClient(db, B.user.id, made.id)).toBeNull();
    expect(await listClients(db, B.user.id)).toEqual([]);
    expect(await updateClient(db, B.user.id, made.id, { name: 'hacked' }, NOW)).toBe(false);
    expect(await saveClientCv(db, B.user.id, made.id, goodCv('X'), NOW)).toBe('not_found');
    expect(await deleteClient(db, B.user.id, made.id, NOW)).toBe(false);
    expect((await markDelivered(db, B.st, made.id, NOW)).ok).toBe(false);
    expect((await getClient(db, A.user.id, made.id))?.name).toBe('Secret Client');
  });

  it('delete removes the details and the CV', async () => {
    const db = fakeD1();
    const { user, st } = await partner(db, '01711111116');
    const made = await createClient(db, st, { name: 'Gone', phone: '01712345678', note: 'n' }, NOW);
    if (!made.ok) throw new Error('create');
    await saveClientCv(db, user.id, made.id, goodCv(), NOW);
    await deleteClient(db, user.id, made.id, NOW);
    const raw = await db.prepare('SELECT name, phone, note, cv_json, deleted_at FROM partner_clients WHERE id = ?').bind(made.id).first();
    expect(raw).toEqual({ name: '', phone: null, note: null, cv_json: null, deleted_at: NOW });
    expect(await listClients(db, user.id)).toEqual([]);
  });
});

describe('delivered count and bonus', () => {
  const deliverMany = async (db: ReturnType<typeof fakeD1>, st: NonNullable<Awaited<ReturnType<typeof getPartner>>>, n: number, now = NOW) => {
    const big = { ...st, rules: { ...st.rules!, clientCap: 500 } };
    let last = null;
    for (let i = 0; i < n; i++) {
      const c = await createClient(db, big, { name: `Client ${i}` }, now);
      if (!c.ok) throw new Error('create');
      await saveClientCv(db, st.profile.user_id, c.id, goodCv(`Person ${i}`), now);
      last = await markDelivered(db, st, c.id, now);
    }
    return last;
  };

  it('refuses a CV with no name, too few sections, or sample text', async () => {
    const db = fakeD1();
    const { user, st } = await partner(db, '01711111117');
    const c = await createClient(db, st, { name: 'Client' }, NOW);
    if (!c.ok) throw new Error('create');
    expect(await markDelivered(db, st, c.id, NOW)).toEqual({ ok: false, error: 'name' });
    await saveClientCv(db, user.id, c.id, { data: { name: 'Karim', summary: 'x' } }, NOW);
    expect(await markDelivered(db, st, c.id, NOW)).toEqual({ ok: false, error: 'sections' });
    await saveClientCv(db, user.id, c.id, { data: { ...goodCv().data, summary: `Hi [${SAMPLE_MARK}]` } }, NOW);
    expect(await markDelivered(db, st, c.id, NOW)).toEqual({ ok: false, error: 'sample' });
  });

  it('counts one client once a month, even when exported again', async () => {
    const db = fakeD1();
    const { user, st } = await partner(db, '01711111118');
    const c = await createClient(db, st, { name: 'Client' }, NOW);
    if (!c.ok) throw new Error('create');
    await saveClientCv(db, user.id, c.id, goodCv(), NOW);
    const first = await markDelivered(db, st, c.id, NOW);
    const again = await markDelivered(db, st, c.id, NOW + 1000);
    expect(first).toMatchObject({ ok: true, counted: true, delivered: 1 });
    expect(again).toMatchObject({ ok: true, counted: false, delivered: 1 });
    expect((await getClient(db, user.id, c.id))?.status).toBe('delivered');
  });

  it('grants Bronze once: +3 days at 10 delivered, and never twice', async () => {
    const db = fakeD1();
    const { user, st } = await partner(db, '01711111119');
    const before = (await getPartner(db, user.id, NOW))!.proUntil!;
    const last = await deliverMany(db, st, 10);
    expect(last).toMatchObject({ ok: true, delivered: 10, level: 'bronze', newLevels: ['bronze'] });
    expect((await getPartner(db, user.id, NOW))!.proUntil).toBe(before + 3 * DAY_MS);
    // an 11th CV and a repeated export do not pay Bronze again
    const more = await deliverMany(db, st, 1);
    expect(more).toMatchObject({ newLevels: [] });
    expect((await getPartner(db, user.id, NOW))!.proUntil).toBe(before + 3 * DAY_MS);
    const s = await summary(db, st, NOW);
    expect(s.month).toMatchObject({ delivered: 11, level: 'bronze' });
    expect(s.bonuses.filter((b) => b.level === 'bronze')).toHaveLength(1);
  });

  it('pays Silver and Gold (with +20 cap) and lets admin take a bonus back', async () => {
    const db = fakeD1();
    const { user, st } = await partner(db, '01711111120');
    const before = st.proUntil!;
    await deliverMany(db, st, 60);
    expect((await getPartner(db, user.id, NOW))!.proUntil).toBe(before + (3 + 7 + 15) * DAY_MS);
    const s = await summary(db, (await getPartner(db, user.id, NOW))!, NOW);
    expect(s.cap).toBe(30 + 20);
    const gold = s.bonuses.find((b) => b.level === 'gold')!;
    expect(await revokeBonus(db, gold.id, NOW)).toBe(true);
    expect(await revokeBonus(db, gold.id, NOW)).toBe(false);
    expect((await getPartner(db, user.id, NOW))!.proUntil).toBe(before + (3 + 7) * DAY_MS);
    expect((await summary(db, (await getPartner(db, user.id, NOW))!, NOW)).cap).toBe(30);
  });

  it('raises an admin flag when one day passes the alert threshold', async () => {
    const db = fakeD1();
    const { st } = await partner(db, '01711111121');
    await db.prepare("INSERT INTO partner_settings (key, value) VALUES ('daily_export_alert', '3')").run();
    await deliverMany(db, st, 3);
    const list = await listPartners(db, NOW);
    expect(list[0].flags.map((f) => f.kind)).toEqual(['many_exports']);
  });
});

describe('devices', () => {
  it('allows two devices and refuses a third until admin resets', async () => {
    const db = fakeD1();
    const { user } = await partner(db, '01711111122');
    expect(await checkDevice(db, user.id, 'device-aaaaaaaa', NOW)).toBe(true);
    expect(await checkDevice(db, user.id, 'device-bbbbbbbb', NOW)).toBe(true);
    expect(await checkDevice(db, user.id, 'device-cccccccc', NOW)).toBe(false);
    expect(await checkDevice(db, user.id, 'device-aaaaaaaa', NOW)).toBe(true);
    expect(await checkDevice(db, user.id, 'bad', NOW)).toBe(false);
    await adminPartnerAction(db, user.id, { action: 'reset_devices' }, NOW);
    expect(await checkDevice(db, user.id, 'device-cccccccc', NOW)).toBe(true);
  });
});

describe('intake link', () => {
  it('turns the client’s answers into a prefilled folder, name and phone only required', async () => {
    expect(intakeCv({ name: 'A', phone: '01712345678' })).toBeNull();
    expect(intakeCv({ name: 'Karim Uddin', phone: '123' })).toBeNull();
    const made = intakeCv({ name: 'Karim Uddin', phone: '+8801712345678', degree: 'BBA', institution: 'DU', skills: 'Excel', target: 'Bank officer', photo: 'javascript:alert(1)' })!;
    const state = JSON.parse(made.cv);
    expect(state.data).toMatchObject({ name: 'Karim Uddin', phone: '01712345678', headline: 'Bank officer', photo: '' });
    expect(state.data.education[0]).toMatchObject({ degree: 'BBA', institution: 'DU' });
    const db = fakeD1();
    const { user, st } = await partner(db, '01711111123');
    const r = await createClient(db, st, { name: made.name, phone: made.phone, source: 'intake', cvJson: made.cv }, NOW);
    expect(r.ok).toBe(true);
    expect((await listClients(db, user.id))[0]).toMatchObject({ source: 'intake', status: 'new' });
  });
});

describe('admin', () => {
  it('suspends, grants days and reports tiles', async () => {
    const db = fakeD1();
    const { user, st } = await partner(db, '01711111124');
    await db.prepare("INSERT INTO partner_events (id, user_id, name, ts) VALUES ('e1', ?, 'PartnerPaid', ?)").bind(user.id, NOW).run();
    const c = await createClient(db, st, { name: 'First' }, NOW + 1000);
    expect(c.ok).toBe(true);
    const stats = await partnerStats(db, NOW + 2000);
    expect(stats).toMatchObject({ paidAll: 1, activated: 1, activationPct: 100 });
    await adminPartnerAction(db, user.id, { action: 'grant_days', days: 5 }, NOW);
    expect((await getPartner(db, user.id, NOW))!.proUntil).toBe(st.proUntil! + 5 * DAY_MS);
    await adminPartnerAction(db, user.id, { action: 'suspend' }, NOW);
    expect((await getPartner(db, user.id, NOW))!.active).toBe(false);
    expect((await adminPartnerAction(db, 'nobody', { action: 'suspend' }, NOW)).status).toBe(404);
  });
});
