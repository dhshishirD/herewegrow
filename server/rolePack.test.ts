import { describe, expect, it } from 'vitest';
import { saveRolePack, validateRolePack, type RolePack } from './rolePack';
import { samplePack } from './rolePack.fixture';
import { fakeD1 } from './testkit';

const NOW = Date.UTC(2026, 10, 4, 6);


const ok = (input: unknown) => {
  const r = validateRolePack(input);
  if (!r.ok) throw new Error(r.errors.join('; '));
  return r.pack;
};

describe('validateRolePack', () => {
  it('accepts a complete pack', () => {
    expect(ok(samplePack()).slug).toBe('bank-officer');
  });

  it('lists every problem, not just the first', () => {
    const r = validateRolePack(samplePack({ slug: 'Bad Slug', title_en: '', test: [] }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.join('|')).toMatch(/slug/);
      expect(r.errors.join('|')).toMatch(/title_en/);
      expect(r.errors.join('|')).toMatch(/test/);
    }
  });

  it('rejects non-objects', () => {
    expect(validateRolePack('x').ok).toBe(false);
    expect(validateRolePack(null).ok).toBe(false);
  });

  it('rejects a test answer index outside its options', () => {
    const r = validateRolePack(samplePack({ test: [{ skill_tag: 'excel', q: 'Q?', options: ['a', 'b'], answer_idx: 2, explain: 'e' }] }));
    expect(r.ok).toBe(false);
  });

  it('rejects course links that are not http(s)', () => {
    const r = validateRolePack(samplePack({ courses: [{ title: 'X', provider: 'P', url: 'javascript:alert(1)', is_affiliate: false, skill_tag: 'excel' }] }));
    expect(r.ok).toBe(false);
  });

  it('rejects raw script or javascript: links in markdown fields', () => {
    expect(validateRolePack(samplePack({ body_md: 'hi <script>alert(1)</script>' })).ok).toBe(false);
    expect(validateRolePack(samplePack({ body_md: '[x](javascript:alert(1))' })).ok).toBe(false);
    expect(validateRolePack(samplePack({ cover_letter_md: '<SCRIPT src=x>' })).ok).toBe(false);
  });

  it('rejects an oversized pack', () => {
    expect(validateRolePack(samplePack({ body_md: 'x'.repeat(300_000) })).ok).toBe(false);
  });
});

describe('saveRolePack', () => {
  it('creates a draft role with its courses and questions', async () => {
    const db = fakeD1();
    const r = await saveRolePack(db, ok(samplePack()) as RolePack, NOW);
    expect(r.created).toBe(true);
    const role = await db.prepare('SELECT * FROM roles WHERE id = ?').bind(r.id).first<Record<string, unknown>>();
    expect(role).toMatchObject({ slug: 'bank-officer', status: 'draft', title_en: 'Bank Officer', field: 'Banking', updated_at: NOW, published_at: null });
    expect(JSON.parse(role!.pack_json as string).interview_qs).toEqual(['Why banking?']);
    expect((await db.prepare('SELECT COUNT(*) AS n FROM role_courses WHERE role_id = ?').bind(r.id).first<{ n: number }>())!.n).toBe(1);
    expect((await db.prepare('SELECT COUNT(*) AS n FROM skill_questions WHERE role_id = ?').bind(r.id).first<{ n: number }>())!.n).toBe(1);
  });

  it('re-importing the same slug updates in place, replaces children, and keeps published status', async () => {
    const db = fakeD1();
    const first = await saveRolePack(db, ok(samplePack()), NOW);
    await db.prepare("UPDATE roles SET status = 'published', published_at = ? WHERE id = ?").bind(NOW, first.id).run();
    const second = await saveRolePack(db, ok(samplePack({ title_en: 'Senior Bank Officer', courses: [] })), NOW + 5);
    expect(second).toEqual({ id: first.id, created: false });
    const role = await db.prepare('SELECT title_en, status, published_at, updated_at FROM roles WHERE id = ?').bind(first.id).first();
    expect(role).toEqual({ title_en: 'Senior Bank Officer', status: 'published', published_at: NOW, updated_at: NOW + 5 });
    expect((await db.prepare('SELECT COUNT(*) AS n FROM role_courses WHERE role_id = ?').bind(first.id).first<{ n: number }>())!.n).toBe(0);
    expect((await db.prepare('SELECT COUNT(*) AS n FROM roles').first<{ n: number }>())!.n).toBe(1);
  });
});
