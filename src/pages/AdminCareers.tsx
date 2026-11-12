// Career Hub admin (admins only), in the same frame as the Blog admin: counts, the roles table with
// its pre-publish checks, and role packs that came with the site waiting to be imported.
// Preview and manual JSON import open in a panel that slides over this page; nothing opens a new window.
// The server checks is_admin on every call; this page only hides itself from everyone else.

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AdminShell, Badge, Card } from '../components/AdminShell';
import { useAuth } from '../lib/auth';

interface RoleRow {
  id: string;
  slug: string;
  title_en: string;
  title_bn: string | null;
  field: string | null;
  status: 'draft' | 'published';
  updated_at: number;
  words: number;
  faq: number;
  questions: number;
  courses: number;
  checked: string;
  problems: string[];
  notes: string[];
  updateWaiting: boolean;
}
interface Pending {
  slug: string;
  title_en: string;
  kind: 'new' | 'update';
  live: boolean;
}
interface Data {
  roles: RoleRow[];
  pending: Pending[] | null;
}
type Notice = { ok: boolean; lines: string[] };

const TEMPLATE = {
  slug: 'bank-officer',
  title_en: 'Bank Officer',
  title_bn: 'ব্যাংক অফিসার',
  field: 'Banking',
  summary: 'One or two sentences on the role.',
  seo_title: 'Bank Officer in Bangladesh: salary, skills, growth | HereWeGrow',
  seo_desc: 'Salary, hiring banks, skills and a 3-year growth plan.',
  salary: { entry: '25,000-35,000', mid: '45,000-70,000', senior: '90,000+', note: 'Ranges; verify before relying on them.', checked: '2026-11-04' },
  benefits: ['Festival bonus'],
  companies: ['Sonali Bank'],
  season: ['Circulars cluster in Jan-Mar'],
  skills: [{ name: 'Excel', level: 'intermediate', tag: 'excel' }],
  gaps_checklist: ['Can build a pivot table'],
  courses: [{ title: 'Excel for Jobs', provider: '10 Minute School', url: 'https://example.com/course', is_affiliate: false, skill_tag: 'excel' }],
  faq: [{ q: 'Question?', a: 'Answer.' }],
  body_md: '## Overview\n\nWrite the free article here.',
  growth_plan: { y1: 'Year 1', y2: 'Year 2', y3: 'Year 3' },
  goal_sheet: ['First goal'],
  test: [{ skill_tag: 'excel', q: 'Question?', options: ['A', 'B', 'C'], answer_idx: 0, explain: 'Why A.' }],
  cv_template_notes: 'Notes for the role CV.',
  cover_letter_md: 'Dear Sir,',
  interview_qs: ['Why this role?'],
};

const post = (path: string, body?: string) =>
  fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ?? '{}' });

/** A panel that slides in from the right over the page (same pattern as the blog performance panel). */
function Drawer({ label, title, wide, onClose, children }: { label: string; title: string; wide?: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div className={`h-full w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} overflow-y-auto bg-white p-6 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold leading-snug">{title}</h2>
          <button type="button" className="btn btn-quiet !px-3 !py-1.5 text-xs" onClick={onClose}>বন্ধ</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// The preview shows the server-rendered role page body. Every piece of text in it is HTML-escaped by
// the server (server/markdown.ts, server/careerPage.ts), so it is safe to place in the panel as HTML.
const PREVIEW_STYLE =
  'text-[15px] leading-relaxed text-ink [&_.crumbs]:hidden [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:font-semibold [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-leaf [&_a]:underline [&_.sub]:text-muted [&_.note]:text-xs [&_.note]:text-muted [&_.card]:mt-3 [&_.card]:rounded-xl [&_.card]:bg-mist/60 [&_.card]:p-4 [&_.table-wrap]:mt-3 [&_.table-wrap]:overflow-x-auto [&_table]:w-full [&_table]:text-left [&_table]:text-sm [&_th]:border-b [&_th]:border-line [&_th]:py-1.5 [&_th]:pr-3 [&_th]:text-xs [&_th]:text-muted [&_td]:border-b [&_td]:border-line/70 [&_td]:py-1.5 [&_td]:pr-3 [&_blockquote]:mt-3 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-leaf [&_blockquote]:bg-mist/60 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_.cta]:hidden';

function PreviewDrawer({ role, onClose }: { role: RoleRow; onClose: () => void }) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(`/api/admin/roles/${role.id}/preview`)
      .then(async (res) => {
        const d = (await res.json().catch(() => ({}))) as { html?: string };
        if (!live) return;
        if (res.ok && typeof d.html === 'string') setHtml(d.html);
        else setFailed(true);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [role.id]);
  return (
    <Drawer label="রোল পেজের প্রিভিউ" title={`প্রিভিউ: ${role.title_en}`} wide onClose={onClose}>
      <p className="text-xs text-muted">{role.status === 'published' ? 'এই রোল এখন লাইভ।' : 'এটি ড্রাফট: শুধু আপনি দেখছেন।'} ভিজিটর যা দেখবে, তা-ই নিচে (হেডার ও Pro বোতাম ছাড়া)।</p>
      {failed && <p className="mt-4 text-red-700">প্রিভিউ লোড হয়নি।</p>}
      {!html && !failed && <p className="mt-4 text-muted">লোড হচ্ছে…</p>}
      {html && <div className={`mt-4 ${PREVIEW_STYLE}`} dangerouslySetInnerHTML={{ __html: html }} />}
    </Drawer>
  );
}

function ImportDrawer({ onClose, onDone }: { onClose: () => void; onDone: (n: Notice) => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[] | null>(null);
  const doImport = async () => {
    setBusy(true);
    setErrors(null);
    try {
      const res = await post('/api/admin/roles/import', text);
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; slug?: string; created?: boolean; errors?: string[]; error?: string };
      if (d.ok) onDone({ ok: true, lines: [d.created ? `“${d.slug}” ড্রাফট হিসেবে ইমপোর্ট হয়েছে।` : `“${d.slug}” আপডেট হয়েছে (অবস্থা আগের মতোই)।`] });
      else setErrors(d.errors ?? [d.error === 'json' ? 'এটি সঠিক JSON নয়।' : d.error === 'db' ? 'ডেটাবেস ইমপোর্ট নেয়নি। Career Hub টেবিল (migration 0003) আছে কি না দেখুন।' : `ইমপোর্ট হয়নি (${d.error ?? res.status}).`]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Drawer label="JSON ইমপোর্ট" title="হাতে JSON ইমপোর্ট" onClose={onClose}>
      <p className="text-sm text-muted">সাধারণত লাগে না: নতুন রোল সাইটের সাথে নিজে আসে। দরকার হলে এখানে role-pack JSON পেস্ট করুন। একই slug আবার দিলে সেই রোল আপডেট হয়; নতুন রোল ড্রাফট হয়।</p>
      <textarea
        className="mt-3 h-72 w-full rounded-xl border border-line bg-white p-3 font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        aria-label="Role pack JSON"
        placeholder="{ ... }"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={busy || !text.trim()} onClick={() => void doImport()}>ইমপোর্ট</button>
        <button type="button" className="btn btn-quiet" onClick={() => setText(JSON.stringify(TEMPLATE, null, 2))}>নমুনা দিয়ে ভরুন</button>
      </div>
      {errors && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          <ul className="list-disc pl-5">{errors.map((l) => <li key={l}>{l}</li>)}</ul>
        </div>
      )}
    </Drawer>
  );
}

const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function AdminCareersPage() {
  const { user, ready, openLogin } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [preview, setPreview] = useState<RoleRow | null>(null);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/roles');
    const d = (await res.json().catch(() => ({}))) as Partial<Data>;
    if (!res.ok) {
      setNotice({ ok: false, lines: [res.status === 500 ? 'ডেটাবেস পড়া যায়নি। Career Hub টেবিল (migration 0003) আছে কি না এবং Worker লগ দেখুন।' : `রোল লোড হয়নি (${res.status}).`] });
      return;
    }
    setData({ roles: d.roles ?? [], pending: d.pending ?? null });
  }, []);

  useEffect(() => {
    if (user?.isAdmin) void load();
  }, [user, load]);

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">Career Hub admin</h1>
        <button type="button" className="btn btn-primary mt-6" onClick={openLogin}>Log in</button>
      </div>
    );
  }
  if (!user.isAdmin) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">Not allowed</h1>
        <p className="mt-3 text-muted">This page is for the site admin.</p>
      </div>
    );
  }

  const run = async (path: string, body: string | undefined, done: (d: Record<string, unknown>) => string[]) => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await post(path, body);
      const d = (await res.json().catch(() => ({}))) as Record<string, unknown> & { ok?: boolean; error?: string; errors?: string[] };
      if (d.ok) setNotice({ ok: true, lines: done(d) });
      else if (d.error === 'checks') setNotice({ ok: false, lines: ['প্রকাশ হয়নি। আগে এগুলো ঠিক করতে হবে:', ...(d.errors ?? [])] });
      else setNotice({ ok: false, lines: [`ব্যর্থ (${d.error ?? res.status}).`] });
      await load();
    } finally {
      setBusy(false);
    }
  };
  const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const importAll = () =>
    run('/api/admin/roles/seed', undefined, (d) => [
      `নতুন ড্রাফট: ${list(d.added).length}টি, ড্রাফট আপডেট: ${list(d.updated).length}টি।`,
      ...(list(d.waiting).length ? [`লাইভ রোলের আপডেট অপেক্ষায়: ${list(d.waiting).join(', ')} (নিচের টেবিলে “আপডেট প্রকাশ” চাপুন)।`] : []),
    ]);
  const applyUpdate = (r: RoleRow) => run('/api/admin/roles/seed', JSON.stringify({ slug: r.slug }), () => [`“${r.slug}” নতুন সংস্করণে আপডেট হয়েছে${r.status === 'published' ? ' এবং লাইভ পেজ বদলেছে' : ''}।`]);
  const act = (r: RoleRow, what: 'publish' | 'unpublish') => run(`/api/admin/roles/${r.id}/${what}`, undefined, () => [what === 'publish' ? `“${r.slug}” প্রকাশ হয়েছে।` : `“${r.slug}” আনপাবলিশ হয়েছে।`]);

  const roles = data?.roles ?? [];
  const live = roles.filter((r) => r.status === 'published');
  const fresh = (data?.pending ?? []).filter((p) => p.kind === 'new');
  const draftUpdates = (data?.pending ?? []).filter((p) => p.kind === 'update' && !p.live);
  const liveUpdates = (data?.pending ?? []).filter((p) => p.kind === 'update' && p.live);
  const oldest = live.map((r) => r.checked).sort()[0];

  return (
    <AdminShell
      active="/admin/careers"
      title="Career Hub"
      subtitle="সব রোল, প্রকাশের আগের চেক ও প্রিভিউ। নতুন রোল সাইটের সাথে নিজে আসে; আপনি শুধু ইমপোর্ট ও প্রকাশ চাপবেন।"
      actions={<button type="button" className="btn btn-quiet !bg-white/10 !text-white ring-1 ring-white/25 hover:!bg-white/20" onClick={() => setImporting(true)}>হাতে JSON ইমপোর্ট</button>}
    >
      <div className="space-y-5">
        {notice && (
          <Card>
            <ul role={notice.ok ? 'status' : 'alert'} className={`space-y-1 text-sm ${notice.ok ? 'text-ink' : 'text-red-700'}`}>{notice.lines.map((l) => <li key={l}>{l}</li>)}</ul>
          </Card>
        )}
        {!data && !notice && <Card><p className="text-muted">লোড হচ্ছে…</p></Card>}

        {data && fresh.length + draftUpdates.length > 0 && (
          <Card
            title={`${fresh.length + draftUpdates.length}টি রোল ইমপোর্টের অপেক্ষায়`}
            note="সাইটের সাথে আসা রোলগুলো ড্রাফট হিসেবে নেওয়া হবে। কিছুই নিজে থেকে প্রকাশ হবে না, আর লাইভ পেজ বদলাবে না।"
          >
            <p className="text-sm">{[...fresh.map((p) => `${p.title_en} (নতুন)`), ...draftUpdates.map((p) => `${p.title_en} (ড্রাফট আপডেট)`)].join(' · ')}</p>
            <button type="button" className="btn btn-primary mt-3" disabled={busy} onClick={() => void importAll()}>রোল ইমপোর্ট করুন</button>
          </Card>
        )}

        {data && (
          <div className="grid gap-4 sm:grid-cols-4">
            <Card><p className="text-xs text-muted">লাইভ</p><p className="text-3xl font-bold">{live.length}</p></Card>
            <Card><p className="text-xs text-muted">ড্রাফট</p><p className="text-3xl font-bold">{roles.length - live.length}</p></Card>
            <Card>
              <p className="text-xs text-muted">লাইভ রোলের আপডেট অপেক্ষায়</p>
              <p className={`text-3xl font-bold ${liveUpdates.length ? 'text-amber-700' : ''}`}>{liveUpdates.length}</p>
            </Card>
            <Card><p className="text-xs text-muted">সবচেয়ে পুরনো তথ্য-যাচাই (লাইভ)</p><p className="text-lg font-semibold">{oldest ?? 'নেই'}</p></Card>
          </div>
        )}

        {data && (
          <Card title="সব রোল" note="প্রকাশের আগে “প্রিভিউ” দেখে নিন। লাল চিহ্ন থাকলে রোল প্রকাশ হবে না।">
            {roles.length === 0 ? (
              <p className="text-muted">এখনও কোনো রোল নেই।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-xs text-muted">
                    <tr><th className="py-2 pr-3">রোল</th><th className="pr-3">অবস্থা</th><th className="pr-3">শব্দ</th><th className="pr-3">FAQ</th><th className="pr-3">টেস্ট</th><th className="pr-3">কোর্স</th><th className="pr-3">তথ্য যাচাই</th><th className="pr-3">চেক</th><th /></tr>
                  </thead>
                  <tbody>
                    {roles.map((r) => (
                      <tr key={r.id} className="border-t border-line/70 align-top">
                        <td className="py-2.5 pr-3">
                          {r.status === 'published' ? <a className="font-semibold text-leaf-dark underline" href={`/careers/${r.slug}`}>{r.title_en}</a> : <span className="font-semibold">{r.title_en}</span>}
                          <div className="text-xs text-muted">{r.field ?? '—'} · {r.slug} · আপডেট {day(r.updated_at)}</div>
                        </td>
                        <td className="space-y-1 pr-3">
                          <div><Badge tone={r.status === 'published' ? 'green' : 'slate'}>{r.status === 'published' ? 'লাইভ' : 'ড্রাফট'}</Badge></div>
                          {r.updateWaiting && <div><Badge tone="amber">আপডেট অপেক্ষায়</Badge></div>}
                        </td>
                        <td className="pr-3">{r.words}</td>
                        <td className="pr-3">{r.faq}</td>
                        <td className="pr-3">{r.questions}</td>
                        <td className="pr-3">{r.courses}</td>
                        <td className="whitespace-nowrap pr-3">{r.checked}</td>
                        <td className="space-y-1 pr-3">
                          {r.problems.map((p) => <div key={p}><Badge tone="red">সমস্যা</Badge> <span className="text-xs">{p}</span></div>)}
                          {r.notes.map((n) => <div key={n}><Badge>নোট</Badge> <span className="text-xs">{n}</span></div>)}
                          {!r.problems.length && !r.notes.length && <Badge tone="green">ঠিক আছে</Badge>}
                        </td>
                        <td>
                          <div className="flex flex-wrap justify-end gap-2">
                            <button type="button" className="btn btn-quiet !px-3 !py-1.5 text-xs" onClick={() => setPreview(r)}>প্রিভিউ</button>
                            {r.updateWaiting && <button type="button" className="btn btn-primary !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void applyUpdate(r)}>{r.status === 'published' ? 'আপডেট প্রকাশ' : 'আপডেট নিন'}</button>}
                            {r.status === 'published' ? (
                              <button type="button" className="btn btn-quiet !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => void act(r, 'unpublish')}>আনপাবলিশ</button>
                            ) : (
                              <button type="button" className="btn btn-primary !px-3 !py-1.5 text-xs" disabled={busy || r.problems.length > 0} title={r.problems.length ? 'আগে লাল চিহ্নের সমস্যা ঠিক করুন' : undefined} onClick={() => void act(r, 'publish')}>প্রকাশ</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
      {preview && <PreviewDrawer role={preview} onClose={() => setPreview(null)} />}
      {importing && <ImportDrawer onClose={() => setImporting(false)} onDone={(n) => { setImporting(false); setNotice(n); void load(); }} />}
    </AdminShell>
  );
}
