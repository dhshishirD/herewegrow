import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../shared/catalog';
import { createManualGrant, findManualGrant, isManualInvoice, listManualGrants } from './manualAccess';
import { handleVerify } from './handlers';
import { revenue } from './stats';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 5, 6);
const DAY = 86_400_000;
const template = PRODUCTS.find((p) => p.kind === 'template' && p.files?.length)!;
const paid = (over: Record<string, unknown> = {}) => ({
  kind: 'paid',
  phone: '01712345678',
  productId: template.id,
  amount: template.price,
  reference: 'CKP1A2B3C4',
  note: 'Paid by bKash, SMS seen',
  ...over,
});

describe('createManualGrant: validation', () => {
  it.each([
    ['bad phone', { phone: '12345' }],
    ['unknown product', { productId: 'nope' }],
    ['cart is not a product', { productId: 'cart' }],
    ['no note', { note: ' ' }],
    ['paid without reference', { reference: '' }],
    ['paid with a short reference', { reference: 'AB1' }],
    ['paid with amount 0', { amount: 0 }],
    ['paid with a fractional amount', { amount: 49.5 }],
    ['unknown kind', { kind: 'gift' }],
  ])('rejects %s and writes nothing', async (_n, over) => {
    const db = fakeD1();
    const r = await createManualGrant(db, 'admin1', paid(over), NOW);
    expect(r.ok).toBe(false);
    expect(await listManualGrants(db)).toEqual([]);
  });
});

describe('createManualGrant: approving a payment', () => {
  it('records the order and grant with the real amount, linked to the phone account', async () => {
    const db = fakeD1();
    const r = await createManualGrant(db, 'admin1', paid(), NOW);
    if (!r.ok) throw new Error('expected ok');
    expect(isManualInvoice(r.grant.invoiceId)).toBe(true);
    expect(r.grant.invoiceId).toMatch(/^manual-[A-Z2-9]{12}$/);
    expect(r.belowPrice).toBe(false);
    const order = await db
      .prepare('SELECT amount_bdt, phone, user_id FROM orders WHERE gateway_ref = ?')
      .bind(r.grant.invoiceId)
      .first<{ amount_bdt: number; phone: string; user_id: string }>();
    expect(order).toMatchObject({ amount_bdt: template.price, phone: '01712345678' });
    expect(order?.user_id).toBeTruthy();
    expect((await revenue(db, NOW)).today).toBe(template.price);
  });

  it('writes one purchase analytics event, and a double approval of the same transaction id changes nothing', async () => {
    const db = fakeD1();
    const first = await createManualGrant(db, 'admin1', paid(), NOW);
    const again = await createManualGrant(db, 'admin2', paid({ reference: ' ckp1a2b3c4 ', phone: '01999999999' }), NOW + 1000);
    expect(first.ok).toBe(true);
    expect(again.ok).toBe(false);
    if (again.ok || again.error !== 'duplicate') throw new Error('expected duplicate');
    if (!first.ok) throw new Error('expected first ok');
    expect(again.grant.invoiceId).toBe(first.grant.invoiceId);
    expect((await listManualGrants(db)).length).toBe(1);
    expect((await db.prepare('SELECT COUNT(*) AS n FROM orders').first<{ n: number }>())?.n).toBe(1);
    expect((await db.prepare("SELECT COUNT(*) AS n FROM events WHERE name = 'purchase'").first<{ n: number }>())?.n).toBe(1);
  });

  it('flags an amount below the list price but still approves it', async () => {
    const r = await createManualGrant(fakeD1(), 'a', paid({ amount: 1 }), NOW);
    expect(r.ok && r.belowPrice).toBe(true);
  });

  it('adds Pro days for a plan, once, and creates the account if the person has not logged in yet', async () => {
    const db = fakeD1();
    const r = await createManualGrant(db, 'admin1', paid({ productId: 'pro-7', amount: 49 }), NOW);
    if (!r.ok) throw new Error('expected ok');
    expect(r.proUntil).toBe(NOW + 7 * DAY);
    const u = await db
      .prepare('SELECT e.pro_until FROM users u JOIN entitlements e ON e.user_id = u.id WHERE u.phone = ?')
      .bind('01712345678')
      .first<{ pro_until: number }>();
    expect(u?.pro_until).toBe(NOW + 7 * DAY);
    await createManualGrant(db, 'admin1', paid({ productId: 'pro-7', amount: 49 }), NOW); // same reference again
    const after = await db.prepare('SELECT pro_until FROM entitlements').first<{ pro_until: number }>();
    expect(after?.pro_until).toBe(NOW + 7 * DAY);
  });
});

describe('createManualGrant: free access', () => {
  it('needs no reference, records 0 taka, is not revenue, and writes no purchase event', async () => {
    const db = fakeD1();
    const r = await createManualGrant(db, 'admin1', { kind: 'free', phone: '01712345678', productId: 'pro-30', note: 'Student scholarship' }, NOW);
    if (!r.ok) throw new Error('expected ok');
    expect(r.grant).toMatchObject({ kind: 'free', amount: 0, reference: null });
    expect(r.grant.invoiceId).toMatch(/^free-/);
    expect(r.proUntil).toBe(NOW + 30 * DAY);
    expect(await revenue(db, NOW)).toMatchObject({ today: 0, orders: 0, proActivations: 1 });
    expect((await db.prepare("SELECT COUNT(*) AS n FROM events WHERE name = 'purchase'").first<{ n: number }>())?.n).toBe(0);
  });

  it('allows several free grants (no reference to collide)', async () => {
    const db = fakeD1();
    const a = await createManualGrant(db, 'a', { kind: 'free', phone: '01712345678', productId: template.id, note: 'gift one' }, NOW);
    const b = await createManualGrant(db, 'a', { kind: 'free', phone: '01712345678', productId: template.id, note: 'gift two' }, NOW);
    expect(a.ok && b.ok).toBe(true);
    expect((await listManualGrants(db)).length).toBe(2);
  });
});

describe('POST /api/verify for manual invoices', () => {
  const verify = (db: ReturnType<typeof fakeD1>, invoiceId: string) =>
    handleVerify(
      new Request('https://herewegrow.pro/api/verify', {
        method: 'POST',
        headers: { Origin: 'https://herewegrow.pro', 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      }),
      { DB: db, KV: fakeKV() } as never,
    );

  it('answers paid from our own records, without calling the gateway', async () => {
    const db = fakeD1();
    const r = await createManualGrant(db, 'admin1', paid(), NOW);
    if (!r.ok) throw new Error('expected ok');
    const body = (await (await verify(db, r.grant.invoiceId)).json()) as { status: string; productId: string; amount: number };
    expect(body).toMatchObject({ status: 'paid', productId: template.id, amount: template.price });
  });

  it('an invented manual-/free- number is unpaid, never paid', async () => {
    const db = fakeD1();
    for (const id of ['manual-AAAAAAAAAAAA', 'free-AAAAAAAAAAAA']) {
      const body = (await (await verify(db, id)).json()) as { status: string };
      expect(body.status).toBe('unpaid');
    }
  });
});

describe('findManualGrant', () => {
  it('finds a grant by invoice number', async () => {
    const db = fakeD1();
    const r = await createManualGrant(db, 'admin1', paid(), NOW);
    if (!r.ok) throw new Error('expected ok');
    expect((await findManualGrant(db, r.grant.invoiceId))?.reference).toBe('CKP1A2B3C4');
    expect(await findManualGrant(db, 'manual-nothere')).toBeNull();
  });
});
