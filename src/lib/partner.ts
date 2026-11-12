// Browser side of the CV Partner Workspace (server: server/partner.ts).
import type { BuilderState } from '../builder/model';
import type { ClientStatus, LevelId, ProfessionId } from '../../shared/partner';

type B = { en: string; bn: string };

const DEVICE_KEY = 'hwg_partner_device';
/** One random id per browser, sent with every partner call. The server allows two active devices per account. */
export function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id || !/^[\w-]{8,64}$/.test(id)) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/[^\w-]/g, '').slice(0, 40);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'nostorage-device-id';
  }
}

export interface PartnerMe {
  ok: true;
  applied: boolean;
  hasPass?: boolean;
  name?: string | null;
  active?: boolean;
  suspended?: boolean;
  code?: string;
  intakeUrl?: string;
  brandingOn?: boolean;
  removeBranding?: boolean;
  plan?: { id: string; name: B; brandingRemovable: boolean; badge: boolean; periodDays: number } | null;
  proUntil?: number | null;
  daysLeft?: number;
  used?: number;
  cap?: number;
  month?: { key: string; delivered: number; level: LevelId | null; next: { id: LevelId; at: number; days: number; capExtra: number } | null };
  bonuses?: { id: string; month: string; level: LevelId; days: number; capExtra: number; at: number; revoked: boolean }[];
}

export interface ClientSummary {
  id: string;
  name: string;
  phone: string | null;
  profession: ProfessionId | null;
  note: string | null;
  status: ClientStatus;
  source: 'manual' | 'intake';
  createdAt: number;
  updatedAt: number;
  deliveredAt: number | null;
}

export type PartnerError = 'login' | 'apply' | 'inactive' | 'suspended' | 'devices' | 'cap' | 'name' | 'sections' | 'sample' | 'phone' | 'plan' | 'rate' | 'closed' | 'captcha' | 'invalid' | 'not_found' | 'network' | string;
export type Res<T> = { ok: true; value: T } | { ok: false; error: PartnerError };

async function call<T>(path: string, init: RequestInit = {}, pick: (d: Record<string, unknown>) => T = (d) => d as T): Promise<Res<T>> {
  try {
    const r = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', 'X-HWG-Device': deviceId() } });
    const d = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (d.ok) return { ok: true, value: pick(d) };
    return { ok: false, error: (d.error as string) ?? 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}

const send = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

export const partnerMe = () => call<PartnerMe>('/api/partner/me');
export const partnerApply = (b: { name: string; fbLink: string; sellsWhere: string; terms: boolean }) => call<string>('/api/partner/apply', send('POST', b), (d) => d.code as string);
export const partnerSettings = (removeBranding: boolean) => call<true>('/api/partner/settings', send('POST', { removeBranding }), () => true);
export const listClients = (q = '') => call<ClientSummary[]>(`/api/partner/clients${q ? `?q=${encodeURIComponent(q)}` : ''}`, {}, (d) => d.clients as ClientSummary[]);
export const createClient = (b: { name: string; phone?: string; profession?: ProfessionId | null; note?: string }) => call<string>('/api/partner/clients', send('POST', b), (d) => d.id as string);
export const getClient = (id: string) => call<ClientSummary & { state: BuilderState | null }>(`/api/partner/clients/${id}`, {}, (d) => d.client as ClientSummary & { state: BuilderState | null });
export const patchClient = (id: string, b: Partial<Pick<ClientSummary, 'name' | 'phone' | 'note' | 'status' | 'profession'>>) => call<true>(`/api/partner/clients/${id}`, send('PATCH', b), () => true);
export const saveClientCv = (id: string, state: BuilderState) => call<true>(`/api/partner/clients/${id}/cv`, send('PUT', { state }), () => true);
export const removeClient = (id: string) => call<true>(`/api/partner/clients/${id}`, send('DELETE'), () => true);
export const exportClient = (id: string) => call<unknown>(`/api/partner/clients/${id}/export`);
export const markDelivered = (id: string) =>
  call<{ counted: boolean; delivered: number; level: LevelId | null; newLevels: LevelId[] }>(`/api/partner/clients/${id}/delivered`, send('POST', {}), (d) => d as never);

export interface IntakeInfo { partner: string; siteKey: string | null }
export async function intakeInfo(code: string): Promise<Res<IntakeInfo>> {
  try {
    const d = (await (await fetch(`/api/partner/intake/${code}`)).json()) as Record<string, unknown>;
    return d.ok ? { ok: true, value: { partner: String(d.partner ?? ''), siteKey: (d.siteKey as string) ?? null } } : { ok: false, error: (d.error as string) ?? 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}
export async function intakeSubmit(code: string, b: Record<string, unknown>): Promise<Res<true>> {
  try {
    const r = await fetch(`/api/partner/intake/${code}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    const d = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    return d.ok ? { ok: true, value: true } : { ok: false, error: (d.error as string) ?? 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}

/** Plain-language messages for server errors. */
export const PARTNER_ERRORS: Record<string, B> = {
  cap: { en: 'You have used all client places in this period. Upgrade or wait for the next period.', bn: 'এই মেয়াদের সব ক্লায়েন্ট জায়গা শেষ। প্যাকেজ বাড়ান অথবা পরের মেয়াদের জন্য অপেক্ষা করুন।' },
  inactive: { en: 'Your Partner pass has ended. Renew to open the workspace.', bn: 'আপনার পার্টনার পাসের মেয়াদ শেষ। ওয়ার্কস্পেস খুলতে নবায়ন করুন।' },
  suspended: { en: 'This account is paused. Please contact us on WhatsApp.', bn: 'এই অ্যাকাউন্ট সাময়িক বন্ধ। হোয়াটসঅ্যাপে যোগাযোগ করুন।' },
  devices: { en: 'This account is already used on 2 devices. Ask us on WhatsApp to reset.', bn: 'এই অ্যাকাউন্ট ইতিমধ্যে ২টি ডিভাইসে চালু। রিসেট করতে হোয়াটসঅ্যাপে জানান।' },
  login: { en: 'Please log in first.', bn: 'আগে লগইন করুন।' },
  phone: { en: 'Enter a valid mobile number (01XXXXXXXXX).', bn: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)।' },
  name: { en: 'Add the client name and the name on the CV first.', bn: 'আগে ক্লায়েন্টের নাম এবং সিভির নাম দিন।' },
  sections: { en: 'Fill at least 3 sections of the CV before delivering.', bn: 'ডেলিভারির আগে সিভির অন্তত ৩টি অংশ পূরণ করুন।' },
  sample: { en: 'Some sample text is still in the CV. Replace every "sample - replace" line.', bn: 'সিভিতে নমুনা লেখা রয়ে গেছে। "sample - replace" লেখা সব বদলান।' },
  network: { en: 'No connection. Try again.', bn: 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।' },
  generic: { en: 'Something went wrong. Please try again.', bn: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।' },
};
export const partnerErrorText = (e: string, t: (b: B) => string) => t(PARTNER_ERRORS[e] ?? PARTNER_ERRORS.generic);
