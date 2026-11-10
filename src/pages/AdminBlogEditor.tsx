// The post editor on the admin Blog page: text and metadata, a live preview, schedule / reschedule,
// publish now, unpublish, and earlier versions. All rules are checked again on the server; this
// panel only shows them early. Opens over the list; closing it does not discard saved work.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { renderMarkdown } from '../../shared/blogParse';
import { DEFAULT_TIME } from '../../shared/blogEdit';
import type { RowStatus } from '../../shared/blogAdmin';

interface Detail {
  post: {
    id: string; title: string; slug: string; metaTitle: string; metaDescription: string; primaryKeyword: string; secondaryKeywords: string[];
    author: string; cta: string; body: string; status: RowStatus; publishAt: number | null; publishDate: string; publishTime: string; updatedAt: number;
  };
  problems: string[];
  notes: string[];
  revisions: Array<{ id: number; savedAt: number; actor: string | null; note: string | null }>;
}
interface Reply extends Partial<Detail> { ok?: boolean; error?: string; problems?: string[]; unchanged?: boolean; slotNotes?: string[] }

interface Form {
  title: string; slug: string; metaTitle: string; metaDescription: string; primaryKeyword: string; secondary: string; author: string; cta: string; body: string;
}
const toForm = (p: Detail['post']): Form => ({ ...p, secondary: p.secondaryKeywords.join(', ') });
const toBody = (f: Form) => ({ ...f, secondaryKeywords: f.secondary.split(',') });

const ERRORS: Record<string, string> = {
  stale: 'এই পোস্ট অন্য কোথাও বদলে গেছে। প্যানেল বন্ধ করে আবার খুলুন।',
  past: 'এই সময় পার হয়ে গেছে। ভবিষ্যতের সময় দিন, নয়তো "এখনই পাবলিশ" চাপুন।',
  bad_time: 'তারিখ বা সময় ঠিক নয়।',
  live: 'পোস্টটি লাইভ। সময় বদলাতে আগে "আনপাবলিশ" করুন।',
  slug_taken: 'এই স্লাগ অন্য পোস্টে আছে।',
  slug_locked: 'শিডিউল বা প্রকাশের পর স্লাগ বদলানো যায় না (লিংক ভেঙে যাবে)।',
  bad_slug: 'স্লাগে শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও হাইফেন চলবে।',
  title_required: 'শিরোনাম লাগবে।',
  body_required: 'লেখা খালি রাখা যাবে না।',
  not_scheduled: 'পোস্টটি শিডিউল্ড নয়।',
  scheduled: 'শিডিউল্ড পোস্টের অবস্থা বদলাতে আগে আনপাবলিশ করুন।',
};
const fmtAt = (ms: number) => new Date(ms + 6 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');

function Counter({ n, min, max }: { n: number; min?: number; max: number }) {
  const bad = n > max || (min !== undefined && n < min && n > 0);
  return <span className={`text-xs ${bad ? 'text-amber-700' : 'text-muted'}`}>{n}/{max}{min ? ` (লক্ষ্য ${min}+)` : ''}</span>;
}

export function BlogEditor({ id, liveSlugs, onClose, onChanged }: { id: string; liveSlugs: ReadonlySet<string>; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [blocked, setBlocked] = useState<string[] | null>(null);
  const [override, setOverride] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(DEFAULT_TIME);
  const [confirm, setConfirm] = useState<'publish' | 'unpublish' | null>(null);

  const adopt = useCallback((d: Detail) => {
    setDetail(d);
    setForm(toForm(d.post));
    setDate(d.post.publishDate);
    setTime(d.post.publishTime || DEFAULT_TIME);
  }, []);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/admin/blog/posts/${id}`);
      const d = (await res.json().catch(() => ({}))) as Reply;
      if (res.ok && d.post) adopt(d as Detail);
      else setMsg({ tone: 'bad', text: `লোড হয়নি (${d.error ?? res.status}).` });
    })();
  }, [id, adopt]);

  const dirty = useMemo(() => !!detail && !!form && JSON.stringify(toBody(form)) !== JSON.stringify(toBody(toForm(detail.post))), [detail, form]);
  const html = useMemo(() => (form ? renderMarkdown(form.body, { liveSlugs }) : ''), [form, liveSlugs]);

  const send = async (action: string, extra: Record<string, unknown>, okText: string) => {
    if (!detail) return;
    setBusy(true);
    setMsg(null);
    setBlocked(null);
    setConfirm(null);
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...extra, updatedAt: detail.post.updatedAt }) });
      const d = (await res.json().catch(() => ({}))) as Reply;
      if (res.ok && d.post) {
        adopt(d as Detail);
        setOverride('');
        setMsg({ tone: 'ok', text: d.unchanged ? 'কিছু বদলায়নি।' : [okText, ...(d.slotNotes ?? [])].join(' · ') });
        if (!d.unchanged) onChanged();
      } else if (d.error === 'problems' && d.problems) {
        setBlocked(d.problems);
        setMsg({ tone: 'bad', text: 'সমস্যা থাকায় আটকে আছে। ঠিক করুন, নয়তো কারণ লিখে ওভাররাইড করুন।' });
      } else {
        setMsg({ tone: 'bad', text: ERRORS[d.error ?? ''] ?? `ব্যর্থ (${d.error ?? res.status}).` });
      }
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => (f ? { ...f, [k]: e.target.value } : f));
  const post = detail?.post;
  const isLive = post?.status === 'live';
  const canSlug = post?.status === 'draft' || post?.status === 'ready';
  const reason = override.trim();
  const ov = blocked ? { override: reason } : {};

  return (
    <div className="fixed inset-0 z-50 flex bg-ink/40" role="dialog" aria-modal="true" aria-label="পোস্ট এডিটর">
      <div className="ml-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-line bg-white px-5 py-3">
          <span className="font-mono text-xs">{id}</span>
          <h2 className="min-w-0 flex-1 truncate text-lg font-bold">{post?.title ?? '…'}</h2>
          {dirty && <span className="text-xs font-semibold text-amber-700">সেভ করা হয়নি</span>}
          <button type="button" className="btn btn-quiet" onClick={() => { if (!dirty || window.confirm('সেভ না করা বদল হারাবে। বন্ধ করবেন?')) onClose(); }}>বন্ধ</button>
        </header>

        {msg && <p className={`mx-5 mt-4 rounded-lg px-3 py-2 text-sm ${msg.tone === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`} role="status">{msg.text}</p>}
        {!detail && !msg && <p className="p-5 text-muted">লোড হচ্ছে…</p>}

        {detail && form && post && (
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-4">
              <div className="flex gap-2" role="tablist">
                {(['write', 'preview'] as const).map((t) => (
                  <button key={t} type="button" role="tab" aria-selected={tab === t} className={`btn ${tab === t ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setTab(t)}>{t === 'write' ? 'লেখা' : 'প্রিভিউ'}</button>
                ))}
              </div>

              {tab === 'write' ? (
                <>
                  <div>
                    <div className="flex justify-between"><label className="label" htmlFor="be-title">শিরোনাম</label><Counter n={form.title.length} max={200} /></div>
                    <input id="be-title" className="field" value={form.title} onChange={set('title')} maxLength={200} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="be-slug">স্লাগ (/blog/…)</label>
                      <input id="be-slug" className="field font-mono text-sm" value={form.slug} onChange={set('slug')} disabled={!canSlug} maxLength={100} />
                      {!canSlug && <p className="mt-1 text-xs text-muted">শিডিউলের পর স্লাগ বদলানো যায় না।</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor="be-author">লেখক</label>
                      <input id="be-author" className="field" value={form.author} onChange={set('author')} maxLength={120} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between"><label className="label" htmlFor="be-mt">মেটা টাইটেল</label><Counter n={form.metaTitle.length} max={70} /></div>
                    <input id="be-mt" className="field" value={form.metaTitle} onChange={set('metaTitle')} maxLength={120} />
                  </div>
                  <div>
                    <div className="flex justify-between"><label className="label" htmlFor="be-md">মেটা ডেসক্রিপশন</label><Counter n={form.metaDescription.length} min={70} max={170} /></div>
                    <textarea id="be-md" className="field" rows={3} value={form.metaDescription} onChange={set('metaDescription')} maxLength={320} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="be-pk">প্রাইমারি কীওয়ার্ড</label>
                      <input id="be-pk" className="field" value={form.primaryKeyword} onChange={set('primaryKeyword')} maxLength={120} />
                    </div>
                    <div>
                      <label className="label" htmlFor="be-cta">CTA</label>
                      <input id="be-cta" className="field" value={form.cta} onChange={set('cta')} maxLength={60} />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="be-sk">অন্য কীওয়ার্ড (কমা দিয়ে)</label>
                    <input id="be-sk" className="field" value={form.secondary} onChange={set('secondary')} />
                  </div>
                  <div>
                    <div className="flex justify-between"><label className="label" htmlFor="be-body">লেখা (markdown)</label><span className="text-xs text-muted">{form.body.split(/\s+/).filter(Boolean).length} শব্দ</span></div>
                    <textarea id="be-body" className="field font-mono text-sm leading-relaxed" rows={26} value={form.body} onChange={set('body')} />
                  </div>
                </>
              ) : (
                <article lang="bn" className="blog-prose max-w-none text-lg leading-[1.85]" dangerouslySetInnerHTML={{ __html: html }} />
              )}

              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" disabled={busy || !dirty} onClick={() => void send('save', toBody(form), 'সেভ হয়েছে।')}>সেভ করুন</button>
                {dirty && <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => setForm(toForm(post))}>বদল বাতিল</button>}
              </div>
            </div>

            <aside className="space-y-5 text-sm">
              <section className="rounded-xl bg-mist p-4">
                <h3 className="font-semibold">অবস্থা</h3>
                <p className="mt-1">{{ live: 'লাইভ', scheduled: 'শিডিউল্ড', ready: 'প্রস্তুত', draft: 'ড্রাফট', unpublished: 'আনপাবলিশ্ড' }[post.status]}{post.publishAt ? ` · ${fmtAt(post.publishAt)}` : ''}</p>
                {isLive && <a className="mt-1 inline-block text-leaf-dark underline" href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">পোস্ট দেখুন</a>}
                {detail.problems.map((p) => <p key={p} className="mt-2 text-red-700">⚠ {p}</p>)}
                {detail.notes.map((n) => <p key={n} className="mt-1 text-xs text-muted">নোট: {n}</p>)}
                {dirty && <p className="mt-2 text-xs text-amber-700">সেভ না করা বদল আছে। সময় ঠিক করার আগে সেভ করুন।</p>}
              </section>

              {!isLive && (
                <section className="space-y-3">
                  <h3 className="font-semibold">{post.status === 'scheduled' ? 'রিশিডিউল' : 'শিডিউল'} (বাংলাদেশ সময়)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input aria-label="তারিখ" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
                    <input aria-label="সময়" type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                  <button type="button" className="btn btn-primary w-full" disabled={busy || dirty || !date || !time} onClick={() => void send('schedule', { date, time, ...ov }, post.status === 'scheduled' ? 'নতুন সময় ঠিক হয়েছে।' : 'শিডিউল হয়েছে।')}>
                    {post.status === 'scheduled' ? 'নতুন সময়ে সরান' : 'শিডিউল করুন'}
                  </button>
                  {blocked && (
                    <div className="rounded-lg bg-red-50 p-3 text-red-800">
                      {blocked.map((b) => <p key={b}>• {b}</p>)}
                      <label className="label mt-2" htmlFor="be-ov">তবু এগোতে চাইলে কারণ লিখুন (অডিট লগে থাকবে)</label>
                      <input id="be-ov" className="field" value={override} onChange={(e) => setOverride(e.target.value)} maxLength={200} />
                      <p className="mt-1 text-xs">কারণ লিখে আবার বোতাম চাপুন।</p>
                    </div>
                  )}
                  {confirm === 'publish' ? (
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-primary flex-1" disabled={busy || dirty} onClick={() => void send('publish-now', ov, 'পোস্ট এখন লাইভ।')}>হ্যাঁ, এখনই</button>
                      <button type="button" className="btn btn-quiet" onClick={() => setConfirm(null)}>না</button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn-quiet w-full" disabled={busy || dirty} onClick={() => setConfirm('publish')}>এখনই পাবলিশ</button>
                  )}
                </section>
              )}

              {post.status === 'scheduled' && (
                confirm === 'unpublish' ? (
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-primary flex-1" disabled={busy} onClick={() => void send('unpublish', {}, isLive ? 'পোস্ট নামানো হয়েছে।' : 'শিডিউল বাতিল।')}>হ্যাঁ, {isLive ? 'নামান' : 'বাতিল'}</button>
                    <button type="button" className="btn btn-quiet" onClick={() => setConfirm(null)}>না</button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-quiet w-full" disabled={busy} onClick={() => setConfirm('unpublish')}>{isLive ? 'আনপাবলিশ' : 'শিডিউল বাতিল'}</button>
                )
              )}

              {post.status !== 'scheduled' && (
                <button type="button" className="btn btn-quiet w-full" disabled={busy || dirty} onClick={() => void send('mark', { status: post.status === 'ready' ? 'draft' : 'ready' }, 'অবস্থা বদলেছে।')}>
                  {post.status === 'ready' ? 'ড্রাফটে ফেরান' : 'প্রস্তুত চিহ্নিত করুন'}
                </button>
              )}

              <section>
                <h3 className="font-semibold">আগের সংস্করণ</h3>
                {detail.revisions.length === 0 && <p className="mt-1 text-muted">এখনও নেই।</p>}
                <ul className="mt-2 space-y-2">
                  {detail.revisions.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                      <span>{fmtAt(r.savedAt)} · {r.note}</span>
                      <button type="button" className="btn btn-quiet !px-2 !py-1 text-xs" disabled={busy || dirty} title="এই সংস্করণের লেখা ও মেটা ফিরিয়ে আনে (অবস্থা ও সময় নয়)" onClick={() => { if (window.confirm('এই সংস্করণের লেখা ফিরিয়ে আনবেন? বর্তমানটিও সংস্করণে থাকবে।')) void send('restore', { revisionId: r.id }, 'আগের সংস্করণ ফিরেছে।'); }}>ফেরান</button>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
