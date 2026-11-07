import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { dumpD1, weeklyBackup } from './backup';
import { fakeD1 } from './testkit';

describe('D1 backup', () => {
  it('dumps schema and rows, escapes quotes, skips raw events', async () => {
    const db = fakeD1();
    await db.prepare("INSERT INTO contact_messages (id, created_at, name, phone, message) VALUES ('c1', 1, 'A''B', '017', 'hi')").run();
    const sql = await dumpD1(db, new Date('2026-11-08T03:31:00Z'));
    expect(sql).toContain('CREATE TABLE');
    expect(sql).toContain(`INSERT INTO "contact_messages"`);
    expect(sql).toContain("'A''B'");
    expect(sql).not.toMatch(/INSERT INTO "events"/);
    expect(sql).not.toContain('CREATE TABLE IF NOT EXISTS events');
  });

  it('replays into an empty database with the same rows', async () => {
    const db = fakeD1();
    await db.prepare("INSERT INTO contact_messages (id, created_at, name, phone, message) VALUES ('c1', 5, 'Ana''s', '017', 'hi, it''s me')").run();
    const sql = await dumpD1(db);
    const copy = new DatabaseSync(':memory:');
    copy.exec(sql);
    const n = (copy.prepare('SELECT COUNT(*) AS n FROM contact_messages').get() as { n: number }).n;
    const src = (await db.prepare('SELECT COUNT(*) AS n FROM contact_messages').first<{ n: number }>())!.n;
    expect(src).toBe(1);
    expect(n).toBe(1);
    expect((copy.prepare('SELECT message FROM contact_messages').get() as { message: string }).message).toBe("hi, it's me");
  });

  it('only writes on Sunday and keeps the newest 8', async () => {
    const db = fakeD1();
    const store = new Map<string, string>();
    const bucket = {
      get: async () => null, head: async () => null,
      put: async (k: string, v: string) => void store.set(k, v),
      list: async ({ prefix }: { prefix: string }) => ({ objects: [...store.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }),
      delete: async (k: string | string[]) => void [k].flat().forEach((x) => store.delete(x)),
    };
    expect(await weeklyBackup(db, bucket, new Date('2026-11-07T03:31:00Z'))).toBe('not backup day'); // Saturday
    for (let i = 0; i < 10; i++) await weeklyBackup(db, bucket, new Date(Date.UTC(2026, 0, 4 + i * 7, 3, 31))); // ten Sundays
    expect(store.size).toBe(8);
    expect([...store.keys()].sort()[0]).toContain('2026-01-18');
    expect(await weeklyBackup(db, undefined, new Date('2026-11-08T03:31:00Z'))).toBe('no bucket');
  });
});
