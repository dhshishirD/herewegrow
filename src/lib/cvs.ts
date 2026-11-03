// Saved CVs in the user's account (server: server/cvs.ts).
import type { BuilderState } from '../builder/model';

export interface CvSummary {
  id: string;
  title: string;
  design: string | null;
  updatedAt: number;
}

export type CvError = 'limit' | 'size' | 'bad' | 'not_found' | 'login' | 'network';

type Res<T> = { ok: true; value: T } | { ok: false; error: CvError };

async function call<T>(path: string, init: RequestInit, pick: (d: Record<string, unknown>) => T): Promise<Res<T>> {
  try {
    const r = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json' } });
    const d = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (d.ok) return { ok: true, value: pick(d) };
    return { ok: false, error: (d.error as CvError) ?? 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}

/** Name shown in the CV list: the person's name and headline. */
export const cvTitle = (s: BuilderState) => [s.data.name, s.data.headline].filter(Boolean).join(' · ').slice(0, 80) || 'My CV';

export const listCvs = () => call('/api/cvs', { method: 'GET' }, (d) => ({ cvs: d.cvs as CvSummary[], limit: d.limit as number }));
export const loadCv = (id: string) => call(`/api/cvs/${id}`, { method: 'GET' }, (d) => (d.cv as { state: BuilderState }).state);
export const createCv = (s: BuilderState) => call('/api/cvs', { method: 'POST', body: JSON.stringify({ title: cvTitle(s), state: s }) }, (d) => d.id as string);
export const updateCv = (id: string, s: BuilderState) =>
  call(`/api/cvs/${id}`, { method: 'PUT', body: JSON.stringify({ title: cvTitle(s), state: s }) }, (d) => d.id as string);
export const deleteCv = (id: string) => call(`/api/cvs/${id}`, { method: 'DELETE' }, () => true);

const ID_KEY = 'hwg_builder_cloud_id';
/** Which saved CV this device is editing, so autosave goes to the right one. */
export const cloudId = {
  get: () => { try { return localStorage.getItem(ID_KEY); } catch { return null; } },
  set: (id: string | null) => { try { if (id) localStorage.setItem(ID_KEY, id); else localStorage.removeItem(ID_KEY); } catch { /* storage off */ } },
};
