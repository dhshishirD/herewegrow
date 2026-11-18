import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_ONLY_PATHS, isAppShellPath } from './appPaths';
import { seoPagePaths } from '../scripts/seo';

describe('real 404 support', () => {
  it('knows every fixed route of the app: prerendered, app-only, or served by the Worker', () => {
    const src = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
    const block = src.slice(src.indexOf('const ROUTES'), src.indexOf('function Page()'));
    const keys = Array.from(block.matchAll(/^\s+'(\/[^']*)':/gm), (m) => m[1]);
    expect(keys.length).toBeGreaterThan(20);
    const known = new Set([...seoPagePaths(), ...APP_ONLY_PATHS, '/blog']);
    expect(keys.filter((k) => !known.has(k))).toEqual([]);
  });
  it('serves the app for partner links and codes, and for nothing else', () => {
    expect(isAppShellPath('/p/abc123xyz')).toBe(true);
    expect(isAppShellPath('/partner')).toBe(true);
    expect(isAppShellPath('/partner/workspace')).toBe(true);
    expect(isAppShellPath('/pro')).toBe(false);
    expect(isAppShellPath('/random-page')).toBe(false);
    expect(isAppShellPath('/p/ab')).toBe(false);
  });
});
