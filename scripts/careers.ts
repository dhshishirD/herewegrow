// Career Hub build step. Role packs written for the site live in content/careers/<slug>.json.
// The build checks every pack with the same validator the admin import uses (a bad pack stops the
// build) and writes them to a private file (admin-careers-seed.json). The Worker never serves that
// file to the public; the Career Hub admin reads it and offers each new or changed pack for import.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { validateRolePack, type RolePack } from '../server/rolePack';

const DIR = join(process.cwd(), 'content', 'careers');
export const CAREERS_SEED_FILE = 'admin-careers-seed.json';

export function loadAllPacks(dir = DIR): RolePack[] {
  if (!existsSync(dir)) return [];
  const packs: RolePack[] = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const checked = validateRolePack(JSON.parse(readFileSync(join(dir, f), 'utf8')));
    if (!checked.ok) throw new Error(`content/careers/${f} is not a valid role pack:\n- ${checked.errors.join('\n- ')}`);
    if (`${checked.pack.slug}.json` !== f) throw new Error(`content/careers/${f} must be named ${checked.pack.slug}.json (its slug)`);
    packs.push(checked.pack);
  }
  return packs;
}

export function careersSeed(): Plugin {
  return {
    name: 'hwg-careers-seed',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: CAREERS_SEED_FILE, source: JSON.stringify(loadAllPacks()) });
    },
  };
}
