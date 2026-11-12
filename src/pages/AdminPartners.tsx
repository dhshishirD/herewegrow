// Admin: CV Partner list, tiles and actions. Counts and pass facts only; a partner's clients and CVs are never shown here.
import { useCallback, useEffect, useState } from 'react';
import { AdminShell, Badge, Card } from '../components/AdminShell';
import { useAuth } from '../lib/auth';

interface PartnerRow {
  userId: string; name: string; phone: string | null; suspended: boolean; joinedAt: number;
  plan: string | null; active: boolean; daysLeft: number; used: number; cap: number; delivered: number; level: string | null;
  intake: number; devices: number;
  flags: { id: string; kind: string; detail: string | null; day: string }[];
  bonuses: { id: string; month: string; level: string; days: number }[];
}
interface Stats {
  landingViews: number; paid: number; landingToPaidPct: number | null; paidAll: number; activated: number; activationPct: number | null;
  delivered30: number; cvsPerPartner: number | null; renewalEligible: number; renewed: number; renewalPct: number | null; dailyAlert: number;
}

const pct = (n: number | null) => (n === null ? '—' : `${n}%`);

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </Card>
  );
}

export function AdminPartnersPage() {
  const { user, ready, openLogin } = useAuth();
  const [rows, setRows] = useState<PartnerRow[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/partners');
      const d = (await r.json()) as { ok?: boolean; partners?: PartnerRow[]; stats?: Stats };
      if (!d.ok) return setError('Could not load partners.');
      setRows(d.partners ?? []);
      setStats(d.stats ?? null);
      setAlert(String(d.stats?.dailyAlert ?? ''));
    } catch {
      setError('Could not load partners.');
    }
  }, []);
  useEffect(() => {
    if (user?.isAdmin) void load();
  }, [user?.isAdmin, load]);

  const act = async (userId: string, body: Record<string, unknown>, ask?: string) => {
    if (ask && !window.confirm(ask)) return;
    const r = await fetch(`/api/admin/partners/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = (await r.json().catch(() => ({}))) as { ok?: boolean };
    if (!d.ok) setError('That did not work.');
    else setError('');
    await load();
  };
  const askNumber = (text: string) => {
    const v = Number(window.prompt(text));
    return Number.isInteger(v) && v > 0 ? v : null;
  };
  const saveAlert = async () => {
    const r = await fetch('/api/admin/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dailyAlert: Number(alert) }) });
    setError(((await r.json().catch(() => ({}))) as { ok?: boolean }).ok ? '' : 'Alert level must be a whole number from 1 to 1000.');
    await load();
  };

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;
  if (!user?.isAdmin) {
    return (
      <div className="wrap py-24">
        <p>Admin only.</p>
        {!user && <button type="button" className="btn btn-primary mt-4" onClick={openLogin}>Log in</button>}
      </div>
    );
  }

  return (
    <AdminShell active="/admin/partners" title="CV Partners" subtitle="Passes, usage, bonuses and flags. Client details are never shown here.">
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-800">{error}</p>}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Landing → paid" value={pct(stats.landingToPaidPct)} note={`${stats.paid} paid / ${stats.landingViews} visitors, last 30 days`} />
          <Tile label="Activation (first CV within 24h)" value={pct(stats.activationPct)} note={`${stats.activated} of ${stats.paidAll} paid partners`} />
          <Tile label="CVs per partner" value={stats.cvsPerPartner === null ? '—' : String(stats.cvsPerPartner)} note={`${stats.delivered30} delivered in 30 days`} />
          <Tile label="30-day renewal" value={pct(stats.renewalPct)} note={`${stats.renewed} of ${stats.renewalEligible} renewed`} />
        </div>
      )}
      <Card className="mt-4" title="Unusual-activity alert" note="A flag is raised when one partner delivers this many CVs (or more) in one day.">
        <div className="flex flex-wrap items-center gap-2">
          <input className="field max-w-[8rem]" inputMode="numeric" value={alert} onChange={(e) => setAlert(e.target.value)} aria-label="CVs per day" />
          <button type="button" className="btn btn-quiet bg-white" onClick={() => void saveAlert()}>Save</button>
        </div>
      </Card>

      <Card className="mt-4" title={`Partners${rows ? ` (${rows.length})` : ''}`}>
        {!rows ? <p className="text-muted">…</p> : rows.length === 0 ? <p className="text-muted">No partners yet.</p> : (
          <ul className="divide-y divide-line">
            {rows.map((p) => (
              <li key={p.userId} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-sm text-muted">{p.phone}</span>
                  {p.suspended ? <Badge tone="red">Suspended</Badge> : p.active ? <Badge tone="green">Active</Badge> : <Badge tone="slate">{p.plan ? 'Ended' : 'Not paid'}</Badge>}
                  {p.level && <Badge tone="amber">{p.level}</Badge>}
                  {p.flags.length > 0 && <Badge tone="red">{p.flags.length} flag{p.flags.length > 1 ? 's' : ''}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {p.plan ?? 'no pass'} · {p.daysLeft} days left · clients {p.used}/{p.cap} · delivered this month {p.delivered} · intake {p.intake} · devices {p.devices}/2
                </p>
                {p.flags.map((f) => <p key={f.id} className="mt-1 text-sm text-red-800">⚑ {f.detail ?? f.kind}</p>)}
                {p.bonuses.length > 0 && (
                  <p className="mt-1 text-xs text-muted">Bonuses: {p.bonuses.map((b) => (
                    <button key={b.id} type="button" className="mr-2 underline" title="Revoke this bonus" onClick={() => void act(p.userId, { action: 'revoke_bonus', bonusId: b.id }, `Revoke ${b.level} (${b.month}, +${b.days} days)?`)}>{b.level} {b.month}</button>
                  ))}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <button type="button" className="btn btn-quiet bg-white !min-h-8 !px-3" onClick={() => { const n = askNumber('Add how many days?'); if (n) void act(p.userId, { action: 'grant_days', days: n }); }}>+ days</button>
                  <button type="button" className="btn btn-quiet bg-white !min-h-8 !px-3" onClick={() => { const n = askNumber('Remove how many days?'); if (n) void act(p.userId, { action: 'revoke_days', days: n }); }}>− days</button>
                  <button type="button" className="btn btn-quiet bg-white !min-h-8 !px-3" onClick={() => { const n = askNumber('Add how many client places (valid 90 days)?'); if (n) void act(p.userId, { action: 'add_cap', cap: n }); }}>+ cap</button>
                  <button type="button" className="btn btn-quiet bg-white !min-h-8 !px-3" onClick={() => void act(p.userId, { action: 'reset_devices' })}>Reset devices</button>
                  {p.flags.length > 0 && <button type="button" className="btn btn-quiet bg-white !min-h-8 !px-3" onClick={() => void act(p.userId, { action: 'resolve_flags' })}>Clear flags</button>}
                  <button type="button" className="btn btn-quiet !min-h-8 !px-3" onClick={() => void act(p.userId, { action: p.suspended ? 'unsuspend' : 'suspend' }, p.suspended ? undefined : `Suspend ${p.name}? They lose workspace access until you un-suspend.`)}>{p.suspended ? 'Un-suspend' : 'Suspend'}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminShell>
  );
}
