// Admin Blog → post performance: the period toggle, the four "top posts" cards, the weekly note, the traits
// panel, and the per-post detail drawer. Data comes from GET /api/admin/blog/performance (server/blogPerformance.ts);
// verdicts and hints are decided on the server, this file only shows them.

import { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/AdminShell';
import { reach, RULES, SCROLL_MARKS, type VerdictKind } from '../../shared/blogPerformance';
import type { Performance, PerfRange, PostPerformance } from '../../server/blogPerformance';

export type { Performance, PostPerformance, PerfRange };

const RANGES: Array<[PerfRange, string]> = [['7d', '৭ দিন'], ['30d', '৩০ দিন'], ['all', 'সব সময়']];

export const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);
const num = (v: number | null, d = 1) => (v === null ? '—' : v.toFixed(d).replace(/\.0$/, ''));
const taka = (v: number) => (v ? `৳${v.toLocaleString('en-US')}` : '—');

export function usePerformance(enabled: boolean) {
  const [range, setRange] = useState<PerfRange>('30d');
  const [data, setData] = useState<Performance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/performance?range=${range}`);
      const d = (await res.json().catch(() => ({}))) as Partial<Performance> & { error?: string };
      if (!res.ok) setError(`পারফরম্যান্স লোড হয়নি (${d.error ?? res.status}).`);
      else setData(d as Performance);
    } catch {
      setError('পারফরম্যান্স লোড হয়নি।');
    }
  }, [range]);
  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);
  return { range, setRange, data, error };
}

const VERDICT: Record<VerdictKind, { label: string; cls: string }> = {
  keep: { label: 'রাখুন', cls: 'bg-green-100 text-green-800' },
  fix: { label: 'ঠিক করুন', cls: 'bg-amber-100 text-amber-800' },
  early: { label: 'জমা হচ্ছে', cls: 'bg-mist text-muted' },
  stop: { label: 'বন্ধ/মেলান?', cls: 'bg-red-100 text-red-800' },
};

export function VerdictBadge({ p }: { p: PostPerformance }) {
  const v = VERDICT[p.verdict.kind];
  return <span title={p.verdict.reasons.join('; ')} className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.cls}`}>{v.label}</span>;
}

export function PerformanceSection({ perf, range, setRange, error, onOpen }: { perf: Performance | null; range: PerfRange; setRange: (r: PerfRange) => void; error: string | null; onOpen: (id: string) => void }) {
  const tops: Array<[keyof Performance['top'], string, (p: NonNullable<Performance['top']['views']>) => string]> = [
    ['views', 'সবচেয়ে বেশি ভিজিটর', (p) => `${p.views} জন`],
    ['read', 'সেরা পড়ার হার', (p) => pct(p.readRate)],
    ['action', 'সবচেয়ে বেশি অ্যাকশন (CTA/টুল)', (p) => pct(p.actionRate)],
    ['revenue', 'সবচেয়ে বেশি অর্ডার/আয়', (p) => `${p.orders}টি · ${taka(p.revenue)}`],
  ];
  const w = perf?.weekly;
  return (
    <div className="space-y-5">
      <Card
        title="পোস্ট পারফরম্যান্স"
        note={`পড়া = ${RULES.readSeconds} সেকেন্ড থাকা ও ${RULES.readScroll}% স্ক্রল। অ্যাকশন = CTA ক্লিক বা টুল চালু (প্রতি ভিজিটরে একবার)। ভিজিটর কম থাকলে “জমা হচ্ছে” দেখায়।`}
        aside={
          <div className="inline-flex rounded-full bg-mist p-1 text-sm" role="group" aria-label="সময়কাল">
            {RANGES.map(([r, label]) => (
              <button key={r} type="button" onClick={() => setRange(r)} className={`rounded-full px-3 py-1 font-semibold ${range === r ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>{label}</button>
            ))}
          </div>
        }
      >
        {error && <p className="text-red-700">{error}</p>}
        {!perf && !error && <p className="text-muted">লোড হচ্ছে…</p>}
        {perf && perf.livePosts === 0 && <p className="text-muted">ডেটা জমা হচ্ছে: লাইভ পোস্ট হলে এখানে দেখা যাবে।</p>}
        {perf && perf.livePosts > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tops.map(([key, label, show]) => {
              const p = perf.top[key];
              return (
                <button key={key} type="button" disabled={!p} onClick={() => p && onOpen(p.id)} className="rounded-xl bg-mist/60 p-4 text-left ring-1 ring-line/60 enabled:hover:ring-leaf">
                  <p className="text-xs text-muted">{label}</p>
                  {p ? (
                    <>
                      <p className="mt-1 text-2xl font-bold">{show(p)}</p>
                      <p className="mt-1 line-clamp-2 text-sm"><span className="font-mono text-xs">{p.id}</span> {p.title}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted">ডেটা জমা হচ্ছে</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {w && (w.best || w.weakest) && (
          <div className="mt-4 space-y-1 border-t border-line/70 pt-3 text-sm">
            <p className="text-xs font-semibold text-muted">গত ৭ দিন</p>
            {w.best && <p>সেরা: <b>{w.best.id}</b> {w.best.title} (পড়ার হার {pct(w.best.readRate)}, অ্যাকশন {pct(w.best.actionRate)})</p>}
            {w.weakest && <p>দুর্বল: <b>{w.weakest.id}</b> {w.weakest.title} (পড়ার হার {pct(w.weakest.readRate)}, অ্যাকশন {pct(w.weakest.actionRate)}){w.weakest.hint ? `। পরামর্শ: ${w.weakest.hint}` : ''}</p>}
          </div>
        )}
      </Card>

      {perf && (
        <Card title="সেরা পোস্টগুলোর মিল কোথায়" note="কোন বৈশিষ্ট্যের পোস্টে গড় পড়ার হার ও অ্যাকশন বেশি। পরের পোস্ট লেখার আইডিয়ার জন্য।">
          {perf.traits === null && <p className="text-muted">ডেটা জমা হচ্ছে ({RULES.traitMinPosts}টি পোস্ট লাইভ হলে চালু হবে)।</p>}
          {perf.traits && perf.traits.length === 0 && <p className="text-muted">এখনও তুলনা করার মতো ভিজিটর নেই।</p>}
          {perf.traits && perf.traits.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-xs text-muted"><tr><th className="py-2 pr-3">বৈশিষ্ট্য</th><th className="pr-3">মান</th><th className="pr-3">পোস্ট</th><th className="pr-3">গড় পড়ার হার</th><th>গড় অ্যাকশন</th></tr></thead>
                <tbody>
                  {perf.traits.map((t) => (
                    <tr key={`${t.trait}|${t.value}`} className="border-t border-line/70"><td className="py-1.5 pr-3">{t.trait}</td><td className="pr-3">{t.value}</td><td className="pr-3">{t.posts}</td><td className="pr-3">{pct(t.readRate)}</td><td>{pct(t.actionRate)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

const KIND_LABEL: Record<string, string> = { builder: 'Builder', cv_checker: 'CV checker', templates: 'Templates', whatsapp: 'WhatsApp', other: 'অন্যান্য' };
const POS_LABEL = { top: 'উপরে', middle: 'মাঝখানে', end: 'শেষে' } as const;

function Bar({ label, value, max, text }: { label: string; value: number; max: number; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-muted">{label}</span>
      <span className="h-3 flex-1 rounded bg-mist"><span className="block h-3 rounded bg-leaf" style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%` }} /></span>
      <span className="w-16 shrink-0 text-right">{text}</span>
    </div>
  );
}

export function PerformanceDrawer({ p, onClose }: { p: PostPerformance; onClose: () => void }) {
  const c = p.counts;
  const rc = reach(c.scroll);
  const totalSources = c.sources.reduce((s, x) => s + x.n, 0);
  const ctaMax = Math.max(1, ...Object.values(c.ctaByPos));
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true" aria-label="পোস্টের পারফরম্যান্স" onClick={onClose}>
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted">{p.id} · {p.publishDate} · {p.daysLive} দিন লাইভ</p>
            <h2 className="mt-1 text-lg font-bold leading-snug">{p.title}</h2>
            <div className="mt-2"><VerdictBadge p={p} /> {p.verdict.reasons.map((r) => <span key={r} className="ml-2 text-xs text-muted">{r}</span>)}</div>
          </div>
          <button type="button" className="btn btn-quiet !px-3 !py-1.5 text-xs" onClick={onClose}>বন্ধ</button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[['ভিজিটর', String(c.views)], ['পড়ার হার', pct(p.rates.readRate)], ['অ্যাকশন হার', pct(p.rates.actionRate)], ['CTA ক্লিক', String(c.ctaClicks)], ['টুল চালু', String(c.toolStarts)], ['অর্ডার', `${c.orders} · ${taka(c.revenue)}`]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-mist/60 p-3"><p className="text-xs text-muted">{k}</p><p className="text-lg font-bold">{v}</p></div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">দিনে গড় ভিজিটর: {num(p.rates.viewsPerDay)}</p>

        <h3 className="mt-6 text-sm font-semibold">কী ঠিক করবেন</h3>
        {p.hints.length === 0 ? <p className="mt-1 text-sm text-muted">{p.verdict.kind === 'early' ? 'ডেটা জমা হচ্ছে: আরও ভিজিটর এলে পরামর্শ দেখাবে।' : 'এখন বিশেষ কিছু ঠিক করার নেই।'}</p> : (
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{p.hints.map((h) => <li key={h}>{h}</li>)}</ul>
        )}

        <h3 className="mt-6 text-sm font-semibold">পাঠক কতদূর পড়ে</h3>
        {rc ? (
          <div className="mt-2 space-y-1.5">{SCROLL_MARKS.map((m) => <Bar key={m} label={m === 0 ? 'শুরু' : `${m}%`} value={rc[m]} max={1} text={pct(rc[m])} />)}</div>
        ) : <p className="mt-1 text-sm text-muted">ডেটা জমা হচ্ছে ({RULES.minExits}+ ভিজিটর লাগে)।</p>}

        <h3 className="mt-6 text-sm font-semibold">কোথায় CTA-তে ক্লিক হয়</h3>
        {c.ctaClicks === 0 ? <p className="mt-1 text-sm text-muted">এখনও কোনো ক্লিক নেই।</p> : (
          <div className="mt-2 space-y-1.5">
            {(['top', 'middle', 'end'] as const).map((k) => <Bar key={k} label={POS_LABEL[k]} value={c.ctaByPos[k]} max={ctaMax} text={String(c.ctaByPos[k])} />)}
            <p className="pt-1 text-xs text-muted">{Object.entries(c.ctaByKind).map(([k, n]) => `${KIND_LABEL[k] ?? k}: ${n}`).join(' · ')}</p>
          </div>
        )}

        <h3 className="mt-6 text-sm font-semibold">ভিজিটর কোথা থেকে এসেছে</h3>
        {c.sources.length === 0 ? <p className="mt-1 text-sm text-muted">ডেটা জমা হচ্ছে।</p> : (
          <div className="mt-2 space-y-1.5">
            {c.sources.slice(0, 6).map((s) => <Bar key={s.source} label={s.source} value={s.n} max={c.sources[0].n} text={`${s.n} (${pct(s.n / totalSources)})`} />)}
            <p className="pt-1 text-xs text-muted">শুধু রেফারার বা UTM থাকা ভিজিট ধরা হয়; গত ৯০ দিনের ডেটা।</p>
          </div>
        )}
      </div>
    </div>
  );
}
