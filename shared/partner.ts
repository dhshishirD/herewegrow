// CV Partner rules shared by the server (which decides and counts) and the browser (which only shows).

export const DAY = 86_400_000;
export const PARTNER_WHATSAPP = '8801981505761';
/** Marks sample text in a new client CV. A CV that still contains it is not counted as delivered. */
export const SAMPLE_MARK = 'sample - replace';

export const LEVELS = [
  { id: 'bronze', at: 10, days: 3, capExtra: 0, name: { en: 'Bronze', bn: 'ব্রোঞ্জ' } },
  { id: 'silver', at: 30, days: 7, capExtra: 0, name: { en: 'Silver', bn: 'সিলভার' } },
  { id: 'gold', at: 60, days: 15, capExtra: 20, name: { en: 'Gold', bn: 'গোল্ড' } },
] as const;
export type LevelId = (typeof LEVELS)[number]['id'];
/** The cap bonus of Gold lasts one quarter. */
export const GOLD_CAP_DAYS = 90;

/** Highest level reached with `delivered` CVs this month, or null. */
export const levelFor = (delivered: number): LevelId | null => [...LEVELS].reverse().find((l) => delivered >= l.at)?.id ?? null;
export const nextLevel = (delivered: number) => LEVELS.find((l) => delivered < l.at) ?? null;

export const PROFESSIONS = [
  { id: 'fresher', name: { en: 'Fresher', bn: 'ফ্রেশার' } },
  { id: 'nurse', name: { en: 'Nurse', bn: 'নার্স' } },
  { id: 'teacher', name: { en: 'Teacher', bn: 'শিক্ষক' } },
  { id: 'banker', name: { en: 'Banker', bn: 'ব্যাংকার' } },
  { id: 'merchandiser', name: { en: 'Merchandiser', bn: 'মার্চেন্ডাইজার' } },
  { id: 'gulf', name: { en: 'Gulf jobs', bn: 'গালফ জব' } },
  { id: 'driver', name: { en: 'Driver', bn: 'ড্রাইভার' } },
  { id: 'it', name: { en: 'IT / Software', bn: 'আইটি / সফটওয়্যার' } },
  { id: 'ngo', name: { en: 'NGO', bn: 'এনজিও' } },
  { id: 'sales', name: { en: 'Sales', bn: 'সেলস' } },
  { id: 'abroad', name: { en: 'Study / work abroad', bn: 'বিদেশ' } },
] as const;
export type ProfessionId = (typeof PROFESSIONS)[number]['id'];
export const isProfession = (v: unknown): v is ProfessionId => PROFESSIONS.some((p) => p.id === v);

export const CLIENT_STATUSES = ['new', 'progress', 'delivered'] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

const DHAKA = 6 * 3_600_000;
/** Asia/Dhaka month (yyyy-mm) and day (yyyy-mm-dd) of a timestamp. */
export const dhakaMonth = (ms: number) => new Date(ms + DHAKA).toISOString().slice(0, 7);
export const dhakaDayKey = (ms: number) => new Date(ms + DHAKA).toISOString().slice(0, 10);

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const arr = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object') : []);

/** Names of the CV sections that have real content. Works on the raw stored JSON. */
export function filledSections(data: unknown): string[] {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const out: string[] = [];
  if (str(d.summary)) out.push('summary');
  if (arr(d.experience).some((e) => str(e.role) || str(e.org))) out.push('experience');
  if (arr(d.education).some((e) => str(e.degree) || str(e.institution))) out.push('education');
  if (str(d.skills)) out.push('skills');
  if (arr(d.training).some((e) => str(e.name))) out.push('training');
  if (d.showPersonal && ['father', 'mother', 'dob', 'presentAddress', 'permanentAddress'].some((k) => str(d[k]))) out.push('personal');
  if (arr(d.references).some((e) => str(e.name))) out.push('references');
  for (const c of arr(d.custom)) if (arr(c.items).some((i) => str(i.title) || str(i.details))) out.push(`custom:${str(c.id)}`);
  return out;
}

export type DeliveryCheck = { ok: true } | { ok: false; reason: 'name' | 'sections' | 'sample' };

/**
 * Delivered = the client folder has a name, the CV has a name and at least 3 filled sections, and no sample text is left.
 * `state` is the stored builder state ({ data, design, ... }).
 */
export function deliveryCheck(clientName: string, state: unknown): DeliveryCheck {
  const data = (state && typeof state === 'object' ? (state as Record<string, unknown>).data : null) as Record<string, unknown> | null;
  if (!str(clientName) || !data || !str(data.name)) return { ok: false, reason: 'name' };
  if (JSON.stringify(data).toLowerCase().includes(SAMPLE_MARK)) return { ok: false, reason: 'sample' };
  if (filledSections(data).length < 3) return { ok: false, reason: 'sections' };
  return { ok: true };
}

/** Whole days left of a pass; 0 when over. */
export const daysLeft = (until: number | null, now = Date.now()) => (until && until > now ? Math.ceil((until - now) / DAY) : 0);

/** "01XXXXXXXXX" → wa.me link, or null. */
export function whatsappLink(phone: string | null | undefined, text?: string): string | null {
  const p = (phone ?? '').replace(/[\s-]/g, '').replace(/^\+?88/, '');
  if (!/^01[3-9]\d{8}$/.test(p)) return null;
  return `https://wa.me/88${p}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
