// Blog admin (admins only): every post file with its publish date, status and pre-publish checks.
// Read-only. Posts are markdown files in content/blog/; a post goes live on its publishDate at the
// nightly deploy. The server checks is_admin on every call; this page only hides itself from everyone else.

import { useCallback, useEffect, useState } from 'react';
import { AdminShell, Card } from '../components/AdminShell';
import { useAuth } from '../lib/auth';
import type { BlogSummary, PostRow } from '../../shared/blogAdmin';

const WEEKDAY = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

function when(r: PostRow) {
  const wd = WEEKDAY[new Date(`${r.publishDate}T00:00:00Z`).getUTCDay()];
  const rel = r.status === 'live' ? '' : r.daysUntil === 0 ? ' · আজ' : r.daysUntil === 1 ? ' · কাল' : ` · ${r.daysUntil} দিন পর`;
  return `${r.publishDate} (${wd})${rel}`;
}

function Badge({ tone, children }: { tone: 'green' | 'amber' | 'red' | 'grey'; children: string }) {
  const c = { green: 'bg-green-100 text-green-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800', grey: 'bg-mist text-muted' }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${c}`}>{children}</span>;
}

export function AdminBlogPage() {
  const { user, ready, openLogin } = useAuth();
  const [data, setData] = useState<BlogSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/admin/blog');
    const d = (await res.json().catch(() => ({}))) as Partial<BlogSummary> & { error?: string };
    if (!res.ok) {
      setError(d.error === 'index' ? 'পোস্টের তালিকা পাওয়া যায়নি। সাইট নতুন করে ডিপ্লয় করে আবার দেখুন (লোকাল ডেভ-এ এই ফাইল তৈরি হয় না)।' : `লোড হয়নি (${d.error ?? res.status}).`);
      return;
    }
    setData(d as BlogSummary);
  }, []);

  useEffect(() => {
    if (user?.isAdmin) void load();
  }, [user, load]);

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

  const next = data?.rows.find((r) => r.status === 'scheduled');

  return (
    <AdminShell active="/admin/blog" title="Blog" subtitle="সব পোস্ট, প্রকাশের তারিখ ও প্রকাশের আগের চেক। পোস্ট বদলাতে content/blog/ ফাইল বদলান।">
      {error && <Card><p className="text-red-700">{error}</p></Card>}
      {!data && !error && <Card><p className="text-muted">লোড হচ্ছে…</p></Card>}
      {data && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card><p className="text-xs text-muted">লাইভ</p><p className="text-3xl font-bold">{data.live}</p></Card>
            <Card><p className="text-xs text-muted">শিডিউল্ড</p><p className="text-3xl font-bold">{data.scheduled}</p></Card>
            <Card>
              <p className="text-xs text-muted">বাফার (লক্ষ্য {data.bufferTarget})</p>
              <p className={`text-3xl font-bold ${data.bufferShort ? 'text-red-700' : 'text-green-700'}`}>{data.bufferShort ? `${data.bufferShort}টি কম` : 'ঠিক আছে'}</p>
            </Card>
            <Card>
              <p className="text-xs text-muted">পরের পোস্ট</p>
              <p className="text-base font-semibold">{next ? `${next.id} · ${when(next)}` : 'নেই'}</p>
            </Card>
          </div>

          {data.scheduledWithProblems > 0 && (
            <Card><p className="text-amber-800">শিডিউল্ড {data.scheduledWithProblems}টি পোস্টে ঠিক করার মতো সমস্যা আছে (নিচে লাল চিহ্ন)। সমস্যা না মিটলে প্রকাশের আগে ফাইল ঠিক করুন।</p></Card>
          )}

          <Card title="সব পোস্ট" note={`আজ ${data.today} (বাংলাদেশ সময়)। শিডিউল্ড পোস্ট প্রকাশের দিন রাতের ডিপ্লয়ে লাইভ হয়।`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr><th className="py-2 pr-3">ID</th><th className="pr-3">শিরোনাম</th><th className="pr-3">তারিখ</th><th className="pr-3">অবস্থা</th><th>চেক</th></tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} className="border-t border-line/70 align-top">
                      <td className="py-2.5 pr-3 font-mono text-xs">{r.id}</td>
                      <td className="pr-3">
                        {r.status === 'live' ? <a className="font-semibold text-leaf-dark underline" href={`/blog/${r.slug}`}>{r.title}</a> : <span className="font-semibold">{r.title}</span>}
                        <div className="text-xs text-muted">{r.primaryKeyword} · {r.words} শব্দ · CTA: {r.cta || '—'}</div>
                      </td>
                      <td className="whitespace-nowrap pr-3">{when(r)}</td>
                      <td className="pr-3">{r.status === 'live' ? <Badge tone="green">লাইভ</Badge> : <Badge tone="amber">শিডিউল্ড</Badge>}</td>
                      <td className="space-y-1">
                        {r.problems.map((p) => <div key={p}><Badge tone="red">সমস্যা</Badge> <span className="text-xs">{p}</span></div>)}
                        {r.notes.map((n) => <div key={n}><Badge tone="grey">নোট</Badge> <span className="text-xs">{n}</span></div>)}
                        {r.unwrittenLinks.length > 0 && <div><Badge tone="grey">লিংক</Badge> <span className="text-xs">এখনও লেখা হয়নি: {r.unwrittenLinks.join(', ')}</span></div>}
                        {!r.problems.length && !r.notes.length && !r.unwrittenLinks.length && <Badge tone="green">ঠিক আছে</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
