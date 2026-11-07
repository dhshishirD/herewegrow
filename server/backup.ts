// Weekly backup of the D1 database to the private R2 bucket, as a plain SQL file that can be replayed
// into an empty database. Skips raw analytics events (large; the daily rollup is kept) and never touches
// KV, so sessions and one-time codes are not in the file. The file holds customer phone numbers and orders,
// so it lives only in the private bucket under backups/ and is never given a download link.

import type { D1Like } from './cf';
import type { R2BucketLike } from './paymently';

const SKIP = new Set(['events', 'd1_migrations']);
const PAGE = 500;
export const KEEP_BACKUPS = 8;
export const BACKUP_PREFIX = 'backups/d1/';

const lit = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) return `X'${[...new Uint8Array(v instanceof ArrayBuffer ? v : (v as ArrayBufferView).buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
const ident = (s: string) => `"${s.replace(/"/g, '""')}"`;

/** The whole database as SQL: CREATE statements first, then INSERTs. */
export async function dumpD1(db: D1Like, now = new Date()): Promise<string> {
  const out: string[] = [`-- HereWeGrow D1 backup, ${now.toISOString()}`, 'PRAGMA foreign_keys = OFF;'];
  const tables = (await db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").all<{ name: string; sql: string }>()).results ?? [];
  const wanted = tables.filter((t) => !SKIP.has(t.name) && t.sql);
  for (const t of wanted) out.push(`${t.sql};`);
  for (const t of wanted) {
    for (let offset = 0; ; offset += PAGE) {
      const rows = (await db.prepare(`SELECT * FROM ${ident(t.name)} ORDER BY rowid LIMIT ${PAGE} OFFSET ${offset}`).all<Record<string, unknown>>()).results ?? [];
      for (const r of rows) {
        const cols = Object.keys(r);
        out.push(`INSERT INTO ${ident(t.name)} (${cols.map(ident).join(', ')}) VALUES (${cols.map((c) => lit(r[c])).join(', ')});`);
      }
      if (rows.length < PAGE) break;
    }
  }
  out.push('PRAGMA foreign_keys = ON;');
  return out.join('\n') + '\n';
}

/** Runs on Sundays (the Worker's daily cron calls this every day). Returns what it did, for the log. */
export async function weeklyBackup(db: D1Like, bucket: R2BucketLike | undefined, now = new Date()): Promise<string> {
  if (now.getUTCDay() !== 0) return 'not backup day';
  if (!bucket?.put || !bucket.list || !bucket.delete) return 'no bucket';
  const key = `${BACKUP_PREFIX}herewegrow-${now.toISOString().slice(0, 10)}.sql`;
  const sql = await dumpD1(db, now);
  await bucket.put(key, sql);
  const all = (await bucket.list({ prefix: BACKUP_PREFIX })).objects.map((o) => o.key).sort();
  const old = all.slice(0, Math.max(0, all.length - KEEP_BACKUPS));
  if (old.length) await bucket.delete(old);
  return `saved ${key} (${sql.length} bytes), removed ${old.length} old`;
}
