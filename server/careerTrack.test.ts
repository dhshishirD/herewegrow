import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { renderCareersIndex } from './careerIndex';
import { renderRolePage } from './careerPage';
import { samplePack } from './rolePack.fixture';
import { validateRolePack } from './rolePack';

const SRC = readFileSync(new URL('../public/career-track.js', import.meta.url), 'utf8');

function run(opts: { noTrack?: boolean; search?: string; referrer?: string } = {}) {
  const sent: Record<string, unknown>[] = [];
  const store = (init: Record<string, string> = {}) => {
    const m = new Map(Object.entries(init));
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
  };
  const ls = store(opts.noTrack ? { hwg_noTrack: '1' } : {});
  const ss = store();
  let onClick: ((e: unknown) => void) | undefined;
  const ctx = {
    window: { localStorage: ls, sessionStorage: ss, crypto: { randomUUID: () => `id-${sent.length + ls.m.size + ss.m.size}` } },
    location: { search: opts.search ?? '', pathname: '/careers/bank-officer' },
    document: { referrer: opts.referrer ?? '', addEventListener: (_: string, f: (e: unknown) => void) => (onClick = f) },
    crypto: { randomUUID: () => 'uuid-1' },
    URLSearchParams,
    JSON,
    Date,
    Math,
    fetch: (url: string, init: { body: string }) => {
      expect(url).toBe('/api/t');
      sent.push(JSON.parse(init.body));
      return Promise.resolve();
    },
  };
  runInNewContext(SRC, ctx);
  const click = (href: string, box?: string, cls = '') =>
    onClick?.({ target: { closest: (sel: string) => (sel === 'a[href]' ? { getAttribute: () => href, classList: { contains: (c: string) => c === cls }, closest: () => (box ? { getAttribute: () => box } : null) } : null) } });
  return { sent, ls, ss, click };
}

describe('career-track.js', () => {
  it('sends one pageview with referrer and utm on the first hit, reusing the visitor id', () => {
    const t = run({ search: '?utm_source=facebook&utm_medium=group&utm_campaign=bank', referrer: 'https://m.facebook.com/' });
    expect(t.sent).toHaveLength(1);
    expect(t.sent[0]).toMatchObject({ type: 'pageview', path: '/careers/bank-officer', ref: 'https://m.facebook.com/', utmSource: 'facebook', utmMedium: 'group', utmCampaign: 'bank' });
    expect(t.ls.getItem('hwg_vid')).toBe(t.sent[0].vid);
  });

  it('sends cta_click for the Builder buttons and ignores other links', () => {
    const t = run();
    t.click('/builder', 'bottom');
    t.click('/careers/accountant');
    t.click('/templates/x?y=1');
    expect(t.sent.map((s) => [s.type, s.name ?? null])).toEqual([['pageview', null], ['event', 'cta_click'], ['event', 'cta_click']]);
    expect(t.sent[1]).toMatchObject({ meta: { where: 'careers_bottom', to: '/builder' } });
    expect(t.sent[2]).toMatchObject({ meta: { where: 'careers_link', to: '/templates/x' } });
    expect(t.sent[1].ref).toBeUndefined();
  });

  it('sends nothing on an opted-out device, and ?notrack=1 opts the device out', () => {
    expect(run({ noTrack: true }).sent).toHaveLength(0);
    const t = run({ search: '?notrack=1' });
    expect(t.sent).toHaveLength(0);
    expect(t.ls.getItem('hwg_noTrack')).toBe('1');
  });
});

describe('career pages load the script', () => {
  it('role page and roles index both include it', () => {
    const r = validateRolePack(samplePack());
    if (!r.ok) throw new Error(r.errors.join('; '));
    expect(renderRolePage(r.pack, Date.UTC(2026, 10, 4))).toContain('<script src="/career-track.js" defer></script>');
    expect(renderCareersIndex([])).toContain('<script src="/career-track.js" defer></script>');
  });
});
