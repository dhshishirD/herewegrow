import { describe, expect, it } from 'vitest';
import { createSession, userForPhone, SESSION_COOKIE } from './auth';
import { handleAdmin } from './admin';
import type { CareerAdminEnv } from './careerAdmin';
import { publishablePack } from './rolePack.fixture';
import { fakeD1, fakeKV } from './testkit';

const NOW = Date.UTC(2026, 10, 12, 6);

const setup = async (seed: unknown[] | null) => {
  const db = fakeD1();
  const env: CareerAdminEnv = { DB: db, KV: fakeKV(), SESSION_SECRET: 's' };
  let files = seed;
  if (seed) env.ASSETS = { fetch: async () => new Response(JSON.stringify(files)) };
  const admin = await userForPhone(db, '01712345678', 'bn', NOW);
  await db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').bind(admin.id).run();
  const cookie = `${SESSION_COOKIE}=${await createSession(env, admin.id, NOW)}`;
  const call = async <T>(path: string, method = 'GET', body?: unknown) => {
    const res = await handleAdmin(
      new Request(`https://herewegrow.pro${path}`, { method, headers: { Cookie: cookie, Origin: 'https://herewegrow.pro', 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }),
      env,
      path,
    );
    return { status: res.status, data: (await res.json()) as T };
  };
  return { env, call, ship: (next: unknown[]) => { files = next; } };
};

type List = { roles: { id: string; slug: string; status: string; words: number; problems: string[]; updateWaiting: boolean }[]; pending: { slug: string; kind: string; live: boolean }[] | null };

describe('role packs shipped with the site', () => {
  it('a new pack waits, is imported as a draft with its checks, and a second import adds nothing', async () => {
    const { call } = await setup([publishablePack({ slug: 'accountant', title_en: 'Accountant' })]);
    expect((await call<List>('/api/admin/roles')).data.pending).toEqual([{ slug: 'accountant', title_en: 'Accountant', kind: 'new', live: false }]);

    expect((await call('/api/admin/roles/seed', 'POST', {})).data).toMatchObject({ ok: true, added: ['accountant'], updated: [], waiting: [] });
    const list = (await call<List>('/api/admin/roles')).data;
    expect(list.pending).toEqual([]);
    expect(list.roles[0]).toMatchObject({ slug: 'accountant', status: 'draft', problems: [], updateWaiting: false });
    expect(list.roles[0].words).toBeGreaterThan(300);

    expect((await call('/api/admin/roles/seed', 'POST', {})).data).toMatchObject({ added: [], updated: [] });
  });

  it('a changed pack never touches a published page until that update is applied by name', async () => {
    const { call, env, ship } = await setup([publishablePack()]);
    await call('/api/admin/roles/seed', 'POST', {});
    const id = (await call<List>('/api/admin/roles')).data.roles[0].id;
    expect((await call(`/api/admin/roles/${id}/publish`, 'POST')).status).toBe(200);

    ship([publishablePack({ summary: 'A newer summary for the role.' })]);
    const list = (await call<List>('/api/admin/roles')).data;
    expect(list.pending).toEqual([expect.objectContaining({ slug: 'bank-officer', kind: 'update', live: true })]);
    expect(list.roles[0].updateWaiting).toBe(true);

    expect((await call('/api/admin/roles/seed', 'POST', {})).data).toMatchObject({ updated: [], waiting: ['bank-officer'] });
    expect(await env.KV!.get('career:bank-officer')).not.toContain('A newer summary');

    expect((await call('/api/admin/roles/seed', 'POST', { slug: 'bank-officer' })).data).toMatchObject({ updated: ['bank-officer'] });
    expect(await env.KV!.get('career:bank-officer')).toContain('A newer summary');
    expect((await call<List>('/api/admin/roles')).data.pending).toEqual([]);
  });

  it('invalid shipped packs are ignored, an unknown slug is 404, and no file means 502', async () => {
    const { call } = await setup([{ slug: 'BAD' }]);
    expect((await call<List>('/api/admin/roles')).data.pending).toEqual([]);
    expect((await call('/api/admin/roles/seed', 'POST', { slug: 'nope' })).status).toBe(404);
    expect((await (await setup(null)).call('/api/admin/roles/seed', 'POST', {})).status).toBe(502);
  });

  it('previews a draft as escaped page HTML', async () => {
    const { call } = await setup([publishablePack({ body_md: `## Pay\n\n| Level | Pay |\n|---|---|\n| Entry | 20k |\n\n> A quote\n\n<b onclick=x>raw</b> ${'word '.repeat(320)}` })]);
    await call('/api/admin/roles/seed', 'POST', {});
    const id = (await call<List>('/api/admin/roles')).data.roles[0].id;
    const p = (await call<{ title: string; html: string }>(`/api/admin/roles/${id}/preview`)).data;
    expect(p.title).toBe('Bank Officer');
    expect(p.html).toContain('<table><thead><tr><th>Level</th><th>Pay</th></tr></thead>');
    expect(p.html).toContain('<blockquote><p>A quote</p></blockquote>');
    expect(p.html).not.toContain("<b onclick");
    expect((await call('/api/admin/roles/nope/preview')).status).toBe(404);
  });
});
