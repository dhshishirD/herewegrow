// Career Hub admin (admins only): paste a role-pack JSON, import it as a draft, publish or unpublish.
// The server checks is_admin on every call; this page only hides itself from everyone else.

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { Link } from '../lib/router';

interface RoleRow {
  id: string;
  slug: string;
  title_en: string;
  field: string | null;
  status: 'draft' | 'published';
  updated_at: number;
}

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

export function AdminCareersPage() {
  const { user, ready, openLogin } = useAuth();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; lines: string[] } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/roles');
    const d = (await res.json().catch(() => ({}))) as { roles?: RoleRow[] };
    if (!res.ok) {
      setNotice({ ok: false, lines: [res.status === 500 ? 'The database could not be read. Check that all Career Hub tables exist (migration 0003) and look at the Worker logs.' : `Could not load roles (${res.status}).`] });
      return;
    }
    setRoles(d.roles ?? []);
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

  const doImport = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await post('/api/admin/roles/import', text);
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; slug?: string; created?: boolean; errors?: string[]; error?: string };
      if (d.ok) {
        setNotice({ ok: true, lines: [`${d.created ? 'Imported' : 'Updated'} “${d.slug}” as ${d.created ? 'a draft' : 'it was (status kept)'}.`] });
        await load();
      } else {
        setNotice({ ok: false, lines: d.errors ?? [d.error === 'json' ? 'That is not valid JSON.' : d.error === 'db' ? 'The database rejected the import. Check that the Career Hub tables exist (migration 0003).' : `Import failed (${d.error ?? res.status}).`] });
      }
    } finally {
      setBusy(false);
    }
  };

  const act = async (r: RoleRow, what: 'publish' | 'unpublish') => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await post(`/api/admin/roles/${r.id}/${what}`);
      setNotice(res.ok ? { ok: true, lines: [`${what === 'publish' ? 'Published' : 'Unpublished'} “${r.slug}”.`] } : { ok: false, lines: [`Could not ${what} (${res.status}).`] });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Career Hub admin</h1>

      <h2 className="mt-8 text-xl font-semibold">Import a role pack</h2>
      <p className="mt-1 text-sm text-muted">Paste the role-pack JSON. Importing the same slug again updates that role. A new role starts as a draft.</p>
      <textarea
        className="mt-3 h-64 w-full rounded-xl border border-line bg-white p-3 font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        aria-label="Role pack JSON"
        placeholder="{ ... }"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={busy || !text.trim()} onClick={() => void doImport()}>Import</button>
        <button type="button" className="btn btn-quiet" onClick={() => setText(JSON.stringify(TEMPLATE, null, 2))}>Fill with an example</button>
      </div>
      {notice && (
        <div role={notice.ok ? 'status' : 'alert'} className={`mt-4 rounded-lg px-4 py-3 text-sm ${notice.ok ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-800'}`}>
          <ul className="list-disc pl-5">{notice.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </div>
      )}

      <h2 className="mt-10 text-xl font-semibold">Roles</h2>
      {roles.length === 0 ? (
        <p className="mt-2 text-muted">No roles yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
          {roles.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-semibold">{r.title_en}</div>
                <div className="text-sm text-muted">{r.field ?? 'No field'} · {r.slug} · {r.status}</div>
              </div>
              <div className="flex gap-2">
                {r.status === 'published' && <Link href={`/careers/${r.slug}`} className="btn btn-quiet">View</Link>}
                {r.status === 'published' ? (
                  <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => void act(r, 'unpublish')}>Unpublish</button>
                ) : (
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void act(r, 'publish')}>Publish</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
