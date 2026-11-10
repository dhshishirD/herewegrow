// /api/admin/blog/posts/<id>[/<action>]: edit, schedule, reschedule, publish now, unpublish and
// restore one post. Admin only (the caller checks). Every change keeps the old version as a revision
// and writes an audit line; every change checks the post has not changed since the page loaded.
//   GET  .../posts/<id>             the whole post, its checks and its revisions
//   POST .../posts/<id>/save        new text and metadata
//   POST .../posts/<id>/schedule    {date, time?, override?}  schedule, or move an already scheduled post
//   POST .../posts/<id>/publish-now {override?}
//   POST .../posts/<id>/unpublish
//   POST .../posts/<id>/mark        {status: 'draft' | 'ready'}
//   POST .../posts/<id>/restore     {revisionId}  put back the text of an earlier version
// Every POST also sends {updatedAt}, the value it loaded; a mismatch answers 409 "stale".

import { summarize } from '../shared/blogAdmin';
import { LIMITS, parseEdit, parseWhen, problemsOf, slotNotes, type EditableFields } from '../shared/blogEdit';
import { getAny, listAll, toEntry, type StoredPost } from './blogDb';
import type { D1Like } from './cf';
import { json } from './paymently';

const KEEP_REVISIONS = 50;
const SHOWN_REVISIONS = 30;
const MAX_BODY = LIMITS.body * 4;

const fieldsOf = (p: StoredPost): EditableFields => ({
  title: p.title, slug: p.slug, metaTitle: p.metaTitle, metaDescription: p.metaDescription, primaryKeyword: p.primaryKeyword,
  secondaryKeywords: p.secondaryKeywords, author: p.author, cta: p.cta, body: p.body,
});
const isLive = (p: StoredPost, now: number) => p.status === 'scheduled' && p.publishAt !== null && p.publishAt <= now;
const slugEditable = (p: StoredPost) => p.status === 'draft' || p.status === 'ready';
const fmt = (ms: number | null) => (ms === null ? '—' : new Date(ms + 6 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '));

interface Change {
  set: Record<string, string | number | null>;
  action: string;
  detail: string;
}

/** Applies `change` if the post still has `expected` as its updated_at; keeps the old version as a revision. */
async function apply(db: D1Like, before: StoredPost, expected: number, change: Change, actor: string | null, now: number): Promise<boolean> {
  const cols = Object.keys(change.set);
  const stamp = Math.max(now, expected + 1);
  const res = await db
    .prepare(`UPDATE blog_posts SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE id = ? AND updated_at = ?`)
    .bind(...cols.map((c) => change.set[c]), stamp, before.id, expected)
    .run();
  if ((res.meta?.changes ?? 0) === 0) return false;
  await db.batch([
    db.prepare('INSERT INTO blog_revisions (post_id, saved_at, actor, note, snapshot) VALUES (?, ?, ?, ?, ?)').bind(before.id, now, actor, change.action, JSON.stringify({ ...fieldsOf(before), status: before.status, publishAt: before.publishAt })),
    db.prepare('INSERT INTO blog_audit (at, actor, post_id, action, detail) VALUES (?, ?, ?, ?, ?)').bind(now, actor, before.id, change.action, change.detail),
    db.prepare('DELETE FROM blog_revisions WHERE post_id = ? AND id NOT IN (SELECT id FROM blog_revisions WHERE post_id = ? ORDER BY id DESC LIMIT ?)').bind(before.id, before.id, KEEP_REVISIONS),
  ]);
  return true;
}

const columns = (f: EditableFields): Record<string, string> => ({
  title: f.title, slug: f.slug, meta_title: f.metaTitle, meta_description: f.metaDescription, primary_keyword: f.primaryKeyword,
  secondary_keywords: JSON.stringify(f.secondaryKeywords), author: f.author, cta: f.cta, body_md: f.body,
});

const LABEL: Record<keyof EditableFields, string> = {
  title: 'শিরোনাম', slug: 'স্লাগ', metaTitle: 'মেটা টাইটেল', metaDescription: 'মেটা ডেসক্রিপশন', primaryKeyword: 'প্রাইমারি কীওয়ার্ড',
  secondaryKeywords: 'অন্য কীওয়ার্ড', author: 'লেখক', cta: 'CTA', body: 'লেখা',
};
const changedFields = (a: EditableFields, b: EditableFields) => (Object.keys(LABEL) as Array<keyof EditableFields>).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));

async function view(db: D1Like, id: string, now: number, extra: Record<string, unknown> = {}): Promise<Response> {
  const p = await getAny(db, id);
  if (!p) return json({ ok: false, error: 'not_found' }, 404);
  const all = await listAll(db);
  const row = summarize(all.map(toEntry), now).rows.find((r) => r.id === id)!;
  const { results } = await db
    .prepare('SELECT id, saved_at, actor, note FROM blog_revisions WHERE post_id = ? ORDER BY id DESC LIMIT ?')
    .bind(id, SHOWN_REVISIONS)
    .all<{ id: number; saved_at: number; actor: string | null; note: string | null }>();
  const slots = p.status === 'scheduled' && p.publishAt !== null ? slotNotes(p.publishAt, all.filter((o) => o.id !== id && o.status === 'scheduled')) : [];
  return json({
    ok: true,
    post: { ...fieldsOf(p), id: p.id, status: row.status, publishAt: p.publishAt, publishDate: row.publishDate, publishTime: row.publishTime, updatedAt: p.updatedAt },
    problems: row.problems,
    notes: [...row.notes, ...slots],
    revisions: (results ?? []).map((r) => ({ id: r.id, savedAt: r.saved_at, actor: r.actor, note: r.note })),
    ...extra,
  });
}

const overrideReason = (b: Record<string, unknown>) => (typeof b.override === 'string' && b.override.trim().length >= 3 ? b.override.trim().slice(0, 200) : null);

export async function handlePostRoute(request: Request, db: D1Like, actor: string | null, id: string, action: string | undefined, now: number): Promise<Response> {
  if (!action) {
    if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
    return view(db, id, now);
  }
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ ok: false, error: 'too_big' }, 413);
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('shape');
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'bad_input' }, 400);
  }
  if (typeof body.updatedAt !== 'number') return json({ ok: false, error: 'bad_input' }, 400);
  const expected = body.updatedAt;
  const p = await getAny(db, id);
  if (!p) return json({ ok: false, error: 'not_found' }, 404);
  if (p.updatedAt !== expected) return json({ ok: false, error: 'stale' }, 409);
  const live = isLive(p, now);
  const done = async (change: Change, extra: Record<string, unknown> = {}) =>
    (await apply(db, p, expected, change, actor, now)) ? view(db, id, now, extra) : json({ ok: false, error: 'stale' }, 409);

  if (action === 'save' || action === 'restore') {
    let next: EditableFields;
    let change: Pick<Change, 'action' | 'detail'>;
    if (action === 'save') {
      const parsed = parseEdit(body);
      if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
      next = parsed.value;
      const changed = changedFields(fieldsOf(p), next);
      if (!changed.length) return view(db, id, now, { unchanged: true });
      change = { action: 'edit', detail: changed.map((k) => LABEL[k]).join(', ') };
    } else {
      if (typeof body.revisionId !== 'number') return json({ ok: false, error: 'bad_input' }, 400);
      const rev = await db.prepare('SELECT snapshot FROM blog_revisions WHERE id = ? AND post_id = ?').bind(body.revisionId, id).first<{ snapshot: string }>();
      if (!rev) return json({ ok: false, error: 'not_found' }, 404);
      let snap: unknown;
      try {
        snap = JSON.parse(rev.snapshot);
      } catch {
        return json({ ok: false, error: 'bad_revision' }, 500);
      }
      const parsed = parseEdit(snap);
      if (!parsed.ok) return json({ ok: false, error: 'bad_revision' }, 500);
      next = { ...parsed.value, slug: slugEditable(p) ? parsed.value.slug : p.slug };
      const changed = changedFields(fieldsOf(p), next);
      if (!changed.length) return view(db, id, now, { unchanged: true });
      change = { action: 'restore', detail: `সংস্করণ #${body.revisionId} (${changed.map((k) => LABEL[k]).join(', ')})` };
    }
    if (next.slug !== p.slug) {
      if (!slugEditable(p)) return json({ ok: false, error: 'slug_locked' }, 409);
      const taken = await db.prepare('SELECT 1 AS x FROM blog_posts WHERE slug = ? AND id <> ?').bind(next.slug, id).first();
      if (taken) return json({ ok: false, error: 'slug_taken' }, 409);
    }
    return done({ ...change, set: columns(next) });
  }

  if (action === 'schedule' || action === 'publish-now') {
    if (live) return json({ ok: false, error: 'live' }, 409);
    let when: number;
    if (action === 'publish-now') when = now;
    else {
      const w = parseWhen(body.date, body.time ?? undefined);
      if (w === null) return json({ ok: false, error: 'bad_time' }, 400);
      if (w <= now) return json({ ok: false, error: 'past' }, 400);
      when = w;
    }
    const problems = problemsOf(fieldsOf(p));
    const reason = overrideReason(body);
    if (problems.length && !reason) return json({ ok: false, error: 'problems', problems }, 422);
    const name = action === 'publish-now' ? 'publish-now' : p.status === 'scheduled' ? 'reschedule' : 'schedule';
    const detail = `${fmt(p.publishAt)} → ${fmt(when)}${problems.length ? ` · ওভাররাইড: ${reason} (${problems.join('; ')})` : ''}`;
    const others = action === 'schedule' ? slotNotes(when, (await listAll(db)).filter((o) => o.id !== id && o.status === 'scheduled')) : [];
    return done({ action: name, detail, set: { status: 'scheduled', publish_at: when } }, { slotNotes: others });
  }

  if (action === 'unpublish') {
    if (p.status !== 'scheduled') return json({ ok: false, error: 'not_scheduled' }, 409);
    if (live) return done({ action: 'unpublish', detail: `লাইভ ছিল ${fmt(p.publishAt)}`, set: { status: 'unpublished' } });
    return done({ action: 'unschedule', detail: `শিডিউল ছিল ${fmt(p.publishAt)}`, set: { status: problemsOf(fieldsOf(p)).length ? 'draft' : 'ready', publish_at: null } });
  }

  if (action === 'mark') {
    if (body.status !== 'draft' && body.status !== 'ready') return json({ ok: false, error: 'bad_input' }, 400);
    if (p.status === 'scheduled') return json({ ok: false, error: 'scheduled' }, 409);
    if (body.status === 'ready') {
      const problems = problemsOf(fieldsOf(p));
      if (problems.length) return json({ ok: false, error: 'problems', problems }, 422);
    }
    if (p.status === body.status) return view(db, id, now, { unchanged: true });
    return done({ action: 'mark', detail: `${p.status} → ${body.status}`, set: { status: body.status, publish_at: p.status === 'unpublished' ? null : p.publishAt } });
  }

  return json({ ok: false, error: 'not_found' }, 404);
}
