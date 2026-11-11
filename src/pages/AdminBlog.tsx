// Blog admin (admins only): the blog database at a glance. Every post with its status, publish time
// and pre-publish checks, plus one-click setup and import for a new database. Posts are stored in D1.
// The server checks is_admin on every call; this page only hides itself from everyone else.

import { useCallback, useEffect, useState } from 'react';
import { AdminShell, Card } from '../components/AdminShell';
import { useAuth } from '../lib/auth';
import type { BlogSummary, PostRow, RowStatus } from '../../shared/blogAdmin';
import { BlogEditor } from './AdminBlogEditor';
import { pct, PerformanceDrawer, PerformanceSection, usePerformance, VerdictBadge } from './AdminBlogPerformance';

type Data = (BlogSummary & { filesPending: number | null; setupNeeded?: undefined }) | { setupNeeded: true };

const WEEKDAY = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

function when(r: PostRow) {
  if (!r.publishDate) return '—';
  const wd = WEEKDAY[new Date(`${r.publishDate}T00:00:00Z`).getUTCDay()];
  const rel = r.status === 'live' || r.daysUntil === null ? '' : r.daysUntil === 0 ? ' · আজ' : r.daysUntil === 1 ? ' · কাল' : ` · ${r.daysUntil} দিন পর`;
  return `${r.publishDate} ${r.publishTime} (${wd})${rel}`;
}

const STATUS: Record<RowStatus, { label: string; tone: 'green' | 'amber' | 'red' | 'grey' }> = {
  live: { label: 'লাইভ', tone: 'green' },
  scheduled: { label: 'শিডিউল্ড', tone: 'amber' },
  ready: { label: 'প্রস্তুত', tone: 'grey' },
  draft: { label: 'ড্রাফট', tone: 'grey' },
  unpublished: { label: 'আনপাবলিশ্ড', tone: 'red' },
};

function Badge({ tone, children }: { tone: 'green' | 'amber' | 'red' | 'grey'; children: string }) {
  const c = { green: 'bg-green-100 text-green-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800', grey: 'bg-mist text-muted' }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${c}`}>{children}</span>;
}

export function AdminBlogPage() {
  const { user, ready, openLogin } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const perf = usePerformance(!!user?.isAdmin);
  const byId = new Map((perf.data?.posts ?? []).map((p) => [p.id, p]));

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/admin/blog');
    const d = (await res.json().catch(() => ({}))) as Partial<Data> & { error?: string };
    if (!res.ok) {
      setError(`লোড হয়নি (${d.error ?? res.status}).`);
      return;
    }
    setData(d as Data);
  }, []);

  useEffect(() => {
    if (user?.isAdmin) void load();
  }, [user, load]);

  const act = async (path: string, done: (d: { added?: string[]; skipped?: string[] }) => string) => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; added?: string[]; skipped?: string[] };
      setNotice(d.ok ? done(d) : `ব্যর্থ (${d.error ?? res.status}).`);
      if (d.ok) await load();
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">Blog admin</h1>
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

  const summary = data && !data.setupNeeded ? data : null;
  const next = summary?.rows.find((r) => r.status === 'scheduled');

  return (
    <AdminShell active="/admin/blog" title="Blog" subtitle="সব পোস্ট, প্রকাশের সময় ও প্রকাশের আগের চেক। পোস্ট এখন ডেটাবেসে থাকে; সময় হলেই নিজে লাইভ হয়।">
      {error && <Card><p className="text-red-700">{error}</p></Card>}
      {notice && <Card><p className="text-ink">{notice}</p></Card>}
      {!data && !error && <Card><p className="text-muted">লোড হচ্ছে…</p></Card>}

      {data?.setupNeeded && (
        <Card title="প্রথমবার: ব্লগ ডেটাবেস তৈরি করুন" note="একবারই লাগে। বোতাম চাপলে ব্লগের টেবিলগুলো তৈরি হবে, কিছু মুছবে না।">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void act('/api/admin/blog/setup', () => 'ব্লগ ডেটাবেস তৈরি হয়েছে। এবার পোস্ট ইমপোর্ট করুন।')}>ব্লগ ডেটাবেস তৈরি করুন</button>
        </Card>
      )}

      {summary && (
        <div className="space-y-5">
          {summary.filesPending !== null && summary.filesPending > 0 && (
            <Card title={`${summary.filesPending}টি পোস্ট ইমপোর্টের অপেক্ষায়`} note="সাইটের সাথে আসা পোস্টগুলো ডেটাবেসে নেওয়া হবে। আগে থেকে থাকা পোস্ট বদলাবে না। অনুমোদিত পোস্ট সকাল ৯টায় শিডিউল হবে, খসড়ার চিহ্ন থাকলে ড্রাফট।">
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void act('/api/admin/blog/seed', (d) => `ইমপোর্ট হয়েছে: ${d.added?.length ?? 0}টি, বাদ: ${d.skipped?.length ?? 0}টি।`)}>পোস্ট ইমপোর্ট করুন</button>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-5">
            <Card><p className="text-xs text-muted">লাইভ</p><p className="text-3xl font-bold">{summary.live}</p></Card>
            <Card><p className="text-xs text-muted">শিডিউল্ড</p><p className="text-3xl font-bold">{summary.scheduled}</p></Card>
            <Card><p className="text-xs text-muted">ড্রাফট</p><p className="text-3xl font-bold">{summary.drafts}</p></Card>
            <Card>
              <p className="text-xs text-muted">বাফার (লক্ষ্য {summary.bufferTarget})</p>
              <p className={`text-2xl font-bold ${summary.bufferShort ? 'text-red-700' : 'text-green-700'}`}>{summary.bufferShort ? `${summary.bufferShort}টি কম` : 'ঠিক আছে'}</p>
            </Card>
            <Card>
              <p className="text-xs text-muted">পরের পোস্ট</p>
              <p className="text-sm font-semibold">{next ? `${next.id} · ${when(next)}` : 'নেই'}</p>
            </Card>
          </div>

          {summary.scheduledWithProblems > 0 && (
            <Card><p className="text-amber-800">শিডিউল্ড {summary.scheduledWithProblems}টি পোস্টে ঠিক করার মতো সমস্যা আছে (নিচে লাল চিহ্ন)।</p></Card>
          )}

          <PerformanceSection perf={perf.data} range={perf.range} setRange={perf.setRange} error={perf.error} onOpen={setDetail} />

          <Card title="সব পোস্ট" note={`আজ ${summary.today} (বাংলাদেশ সময়)। শিডিউল্ড পোস্ট নির্ধারিত সময়ে নিজে লাইভ হয়, রিবিল্ড লাগে না।`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr><th className="py-2 pr-3">ID</th><th className="pr-3">শিরোনাম</th><th className="pr-3">সময়</th><th className="pr-3">অবস্থা</th><th className="pr-3">ভিজিটর</th><th className="pr-3">দিনে</th><th className="pr-3">পড়ার হার</th><th className="pr-3">CTA</th><th className="pr-3">অ্যাকশন</th><th className="pr-3">টুল</th><th className="pr-3">অর্ডার</th><th className="pr-3">ফল</th><th className="pr-3">চেক</th><th /></tr>
                </thead>
                <tbody>
                  {summary.rows.map((r) => (
                    <tr key={r.id} className="border-t border-line/70 align-top">
                      <td className="py-2.5 pr-3 font-mono text-xs">{r.id}</td>
                      <td className="pr-3">
                        {r.status === 'live' ? <a className="font-semibold text-leaf-dark underline" href={`/blog/${r.slug}`}>{r.title}</a> : <span className="font-semibold">{r.title}</span>}
                        <div className="text-xs text-muted">{r.primaryKeyword} · {r.words} শব্দ · CTA: {r.cta || '—'}</div>
                      </td>
                      <td className="whitespace-nowrap pr-3">{when(r)}</td>
                      <td className="pr-3"><Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge></td>
                      {(() => {
                        const p = byId.get(r.id);
                        if (!p) return <td colSpan={8} className="pr-3 text-xs text-muted">{r.status === 'live' ? (perf.error ? '—' : '…') : '—'}</td>;
                        return (
                          <>
                            <td className="pr-3">{p.counts.views}</td>
                            <td className="pr-3">{p.rates.viewsPerDay === null ? '—' : p.rates.viewsPerDay.toFixed(1)}</td>
                            <td className="pr-3">{pct(p.rates.readRate)}</td>
                            <td className="pr-3">{p.counts.ctaClicks}</td>
                            <td className="pr-3">{pct(p.rates.actionRate)}</td>
                            <td className="pr-3">{p.counts.toolStarts}</td>
                            <td className="pr-3">{p.counts.orders}</td>
                            <td className="pr-3"><button type="button" onClick={() => setDetail(p.id)}><VerdictBadge p={p} /></button></td>
                          </>
                        );
                      })()}
                      <td className="space-y-1 pr-3">
                        {r.problems.map((p) => <div key={p}><Badge tone="red">সমস্যা</Badge> <span className="text-xs">{p}</span></div>)}
                        {r.notes.map((n) => <div key={n}><Badge tone="grey">নোট</Badge> <span className="text-xs">{n}</span></div>)}
                        {r.unwrittenLinks.length > 0 && <div><Badge tone="grey">লিংক</Badge> <span className="text-xs">এখনও লেখা হয়নি: {r.unwrittenLinks.join(', ')}</span></div>}
                        {!r.problems.length && !r.notes.length && !r.unwrittenLinks.length && <Badge tone="green">ঠিক আছে</Badge>}
                      </td>
                      <td><button type="button" className="btn btn-quiet !px-3 !py-1.5 text-xs" onClick={() => setEditing(r.id)}>এডিট</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {detail && byId.get(detail) && <PerformanceDrawer p={byId.get(detail)!} onClose={() => setDetail(null)} />}
      {editing && summary && (
        <BlogEditor
          key={editing}
          id={editing}
          liveSlugs={new Set(summary.rows.filter((r) => r.status === 'live').map((r) => r.slug))}
          onClose={() => setEditing(null)}
          onChanged={() => void load()}
        />
      )}
    </AdminShell>
  );
}
