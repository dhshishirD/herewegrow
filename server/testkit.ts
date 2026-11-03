// Test helpers: an in-memory KV and a D1-shaped wrapper over Node's built-in SQLite.
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import type { D1Like, D1Statement, KVLike } from './cf';

export function fakeKV(): KVLike & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    get: async (k) => store.get(k) ?? null,
    put: async (k, v) => void store.set(k, v),
    delete: async (k) => void store.delete(k),
  };
}

export function fakeD1(): D1Like {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  // Every migration, in order, like D1 applies them.
  const dir = new URL('../migrations/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.sql')).sort()) db.exec(readFileSync(new URL(f, dir), 'utf8'));
  const stmt = (sql: string, args: unknown[] = []): D1Statement => ({
    bind: (...v) => stmt(sql, v),
    first: async <T>() => (db.prepare(sql).get(...(args as never[])) as T) ?? null,
    run: async () => {
      const r = db.prepare(sql).run(...(args as never[]));
      return { meta: { changes: Number(r.changes) } };
    },
    all: async <T>() => ({ results: db.prepare(sql).all(...(args as never[])) as T[] }),
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (list) => {
      const out = [];
      for (const s of list) out.push(await s.run());
      return out;
    },
  };
}
