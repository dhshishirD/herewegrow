import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CvDocument, DESIGNS, degreeLine, isProDesign } from '../builder/designs';
import { ImportError, parseCv, readCvFile } from '../builder/importCv';
import {
  ACCENTS,
  SECTION_PRESETS,
  emptyCv,
  list,
  loadState,
  newCustomItem,
  newEducation,
  newExperience,
  newReference,
  newTraining,
  normalise,
  sampleCv,
  saveState,
  uid,
  type BuilderState,
  type Margins,
  DEFAULT_MARGINS,
  MARGIN_LIMITS,
  MARGIN_PRESETS,
  clampMargin,
  type CustomItem,
  type CustomSection,
  type CvData,
  type DesignId,
  type HeadingLang,
} from '../builder/model';
import { PageHead } from '../components/PageHead';
import { ProGate } from '../components/ProGate';
import { useAuth } from '../lib/auth';
import { analyzeCv } from '../lib/cvAnalysis';
import { cloudId, createCv, cvTitle, deleteCv, listCvs, loadCv, updateCv, type CvSummary } from '../lib/cvs';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';

type T = (x: { en: string; bn: string }) => string;

/** Height of one A4 page in CSS pixels (297 mm at 96 dpi). */
const A4_PX = 1123;
type ListKey = 'experience' | 'education' | 'training' | 'references';

/* ── small form parts ──────────────────────────────────────────── */

function Field({ label, value, onChange, placeholder, type = 'text', hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
    </label>
  );
}

function Area({ label, value, onChange, placeholder, rows = 4, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="field" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
    </label>
  );
}

function Section({ title, open, onToggle, children, count, extra }: { title: ReactNode; open: boolean; onToggle: () => void; children: ReactNode; count?: number; extra?: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-line">
      <div className="flex items-center gap-2 pr-3">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex flex-1 items-center justify-between gap-3 px-5 py-4 text-left font-display text-lg font-semibold">
          <span className="min-w-0 truncate">{title}{count ? <span className="ml-2 rounded-full bg-mist px-2 py-0.5 font-body text-sm text-muted">{num(String(count), 'bn')}</span> : null}</span>
          <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-leaf transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
        </button>
        {extra}
      </div>
      {open && <div className="space-y-4 border-t border-line px-5 pb-5 pt-4">{children}</div>}
    </section>
  );
}

function ItemBox({ title, onRemove, onUp, onDown, children, t }: { title: string; onRemove: () => void; onUp?: () => void; onDown?: () => void; children: ReactNode; t: T }) {
  return (
    <div className="rounded-xl bg-mist/60 p-4 ring-1 ring-line">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate font-semibold">{title}</p>
        <div className="flex shrink-0 gap-1 text-sm">
          {onUp && <button type="button" onClick={onUp} className="rounded px-2 py-1 hover:bg-white" aria-label={t({ en: 'Move up', bn: 'উপরে নিন' })}>↑</button>}
          {onDown && <button type="button" onClick={onDown} className="rounded px-2 py-1 hover:bg-white" aria-label={t({ en: 'Move down', bn: 'নিচে নিন' })}>↓</button>}
          <button type="button" onClick={onRemove} className="rounded px-2 py-1 text-alert hover:bg-white">{t({ en: 'Remove', bn: 'মুছুন' })}</button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button type="button" className="btn btn-quiet w-full bg-white" onClick={onClick}>+ {children}</button>;
}

const move = <X,>(arr: X[], i: number, dir: -1 | 1) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};

/** Shrinks a chosen photo to a small square JPEG so it fits in the browser's storage. */
async function photoToDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const c = document.createElement('canvas');
  c.width = c.height = 320;
  c.getContext('2d')!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 3, side, side, 0, 0, 320, 320);
  return c.toDataURL('image/jpeg', 0.82);
}

/** Plain text of the CV for the live score (personal details left out: they are a choice, not a mistake). */
function cvText(d: CvData) {
  const parts = [d.name, d.headline, d.phone, d.email, d.location, d.linkedin];
  if (d.summary) parts.push('Professional Summary', d.summary);
  if (d.experience.length) parts.push('Work Experience', ...d.experience.flatMap((e) => [e.role, e.org, e.start, e.end, e.bullets]));
  if (d.education.length) parts.push('Education', ...d.education.flatMap((e) => [degreeLine(e.degree, e.major), e.institution, e.result, e.year, e.details]));
  if (d.skills) parts.push('Skills', list(d.skills).join(', '));
  if (d.languages) parts.push('Languages', d.languages);
  if (d.training.length) parts.push('Training', ...d.training.flatMap((x) => [x.name, x.org, x.details]));
  for (const c of d.custom) parts.push(c.title, ...c.items.flatMap((i) => [i.title, i.subtitle, i.details]));
  if (d.references.length) parts.push('References', ...d.references.flatMap((r) => [r.name, r.title, r.org]));
  return parts.filter(Boolean).join('\n');
}

/* ── design gallery ──────────────────────────────────────────────── */

const THUMB = 0.15;

/** A live, scaled-down copy of the CV in one design. Memoised so typing re-draws only once per pause. */
const Thumb = memo(function Thumb({ d, design, accent, headings }: { d: CvData; design: DesignId; accent: string; headings?: HeadingLang }) {
  return (
    <div aria-hidden="true" className="pointer-events-none overflow-hidden rounded-md bg-white" style={{ width: 794 * THUMB, height: 1123 * THUMB }}>
      <div style={{ width: 794, transform: `scale(${THUMB})`, transformOrigin: 'top left' }}>
        <CvDocument d={d} design={design} accent={accent} headings={headings} />
      </div>
    </div>
  );
});

/** Page margin picker: presets plus fine sliders for the sides and for top and bottom. */
function MarginControl({ margins, onChange, t }: { margins?: Margins; onChange: (m: Margins | undefined) => void; t: T }) {
  const m = margins ?? DEFAULT_MARGINS;
  const active = margins ? MARGIN_PRESETS.find((p) => p.m.x === m.x && p.m.y === m.y)?.id : undefined;
  const slider = (label: string, key: 'x' | 'y') => (
    <label className="block text-sm">
      <span className="flex justify-between font-medium"><span>{label}</span><span className="text-muted">{m[key]} mm</span></span>
      <input type="range" min={MARGIN_LIMITS.min} max={MARGIN_LIMITS.max} step={1} value={m[key]} className="mt-1 w-full accent-[#12805c]"
        onChange={(e) => onChange({ ...m, [key]: clampMargin(Number(e.target.value)) })} />
    </label>
  );
  return (
    <details className="relative">
      <summary className="btn btn-quiet bg-white !min-h-10 cursor-pointer list-none text-sm" title={t({ en: 'Page margins', bn: 'পৃষ্ঠার মার্জিন' })}>
        {t({ en: 'Margins', bn: 'মার্জিন' })}
      </summary>
      <div className="absolute left-0 top-12 z-30 w-72 rounded-xl bg-white p-4 shadow-xl ring-1 ring-line">
        <p className="text-sm font-semibold">{t({ en: 'Page margins (A4)', bn: 'পৃষ্ঠার মার্জিন (A4)' })}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MARGIN_PRESETS.map((p) => (
            <button key={p.id} type="button" aria-pressed={active === p.id} onClick={() => onChange(p.m)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${active === p.id ? 'border-leaf bg-leaf text-white' : 'border-line hover:border-leaf'}`}>
              {t(p.name)}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {slider(t({ en: 'Left and right', bn: 'বাম ও ডান' }), 'x')}
          {slider(t({ en: 'Top and bottom', bn: 'উপর ও নিচ' }), 'y')}
        </div>
        <button type="button" className="mt-4 text-sm font-semibold text-leaf underline underline-offset-4" onClick={() => onChange(undefined)}>
          {t({ en: 'Reset to the design’s own spacing', bn: 'ডিজাইনের নিজস্ব মার্জিনে ফিরুন' })}
        </button>
      </div>
    </details>
  );
}

function DesignGallery({ state, pro, onPick, t }: { state: BuilderState; pro: boolean; onPick: (id: DesignId) => void; t: T }) {
  // Thumbnails follow the person's own CV (or the example while it is empty), a beat behind their typing
  const live = useDeferredValue(state.data);
  const sample = useMemo(sampleCv, []);
  const d = live.name || live.experience.length ? live : sample;
  return (
    <div role="radiogroup" aria-label={t({ en: 'Design', bn: 'ডিজাইন' })} className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3 pt-1">
      {DESIGNS.map((x) => {
        const on = state.design === x.id;
        return (
          <button key={x.id} type="button" role="radio" aria-checked={on} title={t(x.note)} onClick={() => onPick(x.id)}
            className={`group shrink-0 snap-start rounded-xl p-1.5 text-left transition ${on ? 'bg-white ring-2 ring-leaf shadow-md' : 'ring-1 ring-line hover:bg-white hover:ring-leaf/50'}`}>
            <div className="relative">
              <Thumb d={d} design={x.id} accent={state.accent} headings={state.headings} />
              {x.pro && (
                <span className={`absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${pro ? 'bg-leaf text-white' : 'bg-saffron text-ink'}`}>
                  {pro ? 'Pro ✓' : 'Pro'}
                </span>
              )}
            </div>
            <p className={`mt-1.5 truncate px-0.5 text-sm font-semibold ${on ? 'text-leaf-dark' : ''}`} style={{ maxWidth: 794 * THUMB }}>{t(x.name)}</p>
          </button>
        );
      })}
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────── */

export function BuilderPage() {
  const { t, lang } = useLang();
  const [state, setState] = useState<BuilderState>(() => loadState() ?? { data: emptyCv(), design: 'classic', accent: ACCENTS[0] });
  const [open, setOpen] = useState<string>('import');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [newSection, setNewSection] = useState('');
  const previewBox = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const docBox = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);

  // Account: saved CVs and Pro gating (Phase 1 spec, section 6)
  const { user, openLogin } = useAuth();
  const pro = !!user?.pro;
  const [cvId, setCvId] = useState<string | null>(() => cloudId.get());
  const [savedRaw, setSaved] = useState<{ list: CvSummary[]; limit: number } | null>(null);
  const saved = user ? savedRaw : null;
  const [sync, setSync] = useState<'idle' | 'saving' | 'saved' | 'error' | 'limit'>('idle');

  const title = t({ en: 'Free CV builder', bn: 'ফ্রি সিভি বিল্ডার' });
  const intro = t({
    en: 'Upload your old CV or start fresh, pick a design and download PDF or Word. Free, no sign-up, and your CV stays on your device.',
    bn: 'পুরনো সিভি আপলোড করুন বা নতুন করে শুরু করুন, ডিজাইন বেছে নিন, PDF বা Word ডাউনলোড করুন। বিনামূল্যে, সাইন-আপ ছাড়া, আর সিভি আপনার ডিভাইসেই থাকে।',
  });
  useEffect(() => setPageMeta(title, intro, '/builder'), [title, intro]);
  useEffect(() => saveState(state), [state]);
  useEffect(() => cloudId.set(cvId), [cvId]);

  const userId = user?.id;
  const refreshList = useCallback(async () => {
    const r = await listCvs();
    if (r.ok) setSaved({ list: r.value.cvs, limit: r.value.limit });
  }, []);
  useEffect(() => {
    if (userId) void refreshList();
  }, [userId, refreshList]);

  // Autosave the open CV to the account, 1.5 seconds after the last change.
  useEffect(() => {
    if (!userId || !cvId) return;
    setSync('saving');
    const h = setTimeout(async () => {
      const r = await updateCv(cvId, state);
      if (r.ok) {
        setSync('saved');
        setSaved((x) => x && { ...x, list: x.list.map((c) => (c.id === cvId ? { ...c, title: cvTitle(state), updatedAt: Date.now() } : c)) });
      } else if (r.error === 'not_found') {
        setCvId(null); // deleted elsewhere, or saved by another account on this device
        setSync('idle');
      } else setSync('error');
    }, 1500);
    return () => clearTimeout(h);
  }, [state, cvId, userId]);

  useEffect(() => {
    const el = previewBox.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / 794));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  // How many A4 pages the CV fills, so the preview shows every page and where each one ends.
  useEffect(() => {
    const el = docBox.current;
    if (!el) return;
    const count = () => setPages(Math.max(1, Math.ceil((el.scrollHeight - 2) / A4_PX)));
    count();
    const ro = new ResizeObserver(count);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const d = state.data;
  const score = useMemo(() => analyzeCv(cvText(d), { fromPdf: false, splitRowShare: 0 }), [d]);
  const set = (patch: Partial<CvData>) => setState((s) => ({ ...s, data: { ...s.data, ...patch } }));
  const toggle = (id: string) => setOpen((cur) => (cur === id ? '' : id));
  const upd = <K extends ListKey>(key: K, id: string, patch: Partial<CvData[K][number]>) =>
    set({ [key]: (d[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) } as Partial<CvData>);
  const del = (key: ListKey, id: string) => set({ [key]: (d[key] as { id: string }[]).filter((x) => x.id !== id) } as Partial<CvData>);
  const mv = (key: ListKey, i: number, dir: -1 | 1) => set({ [key]: move(d[key] as { id: string }[], i, dir) } as Partial<CvData>);

  // Custom sections
  const updSection = (id: string, patch: Partial<CustomSection>) => set({ custom: d.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const updItem = (sid: string, iid: string, patch: Partial<CustomItem>) =>
    set({ custom: d.custom.map((c) => (c.id === sid ? { ...c, items: c.items.map((i) => (i.id === iid ? { ...i, ...patch } : i)) } : c)) });
  const addSection = (name: string) => {
    if (!name.trim()) return;
    const id = uid();
    set({ custom: [...d.custom, { id, title: name.trim(), items: [newCustomItem()] }], order: [...d.order, `custom:${id}`] });
    setOpen(`custom:${id}`);
    setNewSection('');
  };
  const removeSection = (id: string) => set({ custom: d.custom.filter((c) => c.id !== id), order: d.order.filter((k) => k !== `custom:${id}`) });

  const sectionName = (k: string) => {
    const names: Record<string, { en: string; bn: string }> = {
      summary: { en: 'Summary', bn: 'সামারি' }, experience: { en: 'Work experience', bn: 'কাজের অভিজ্ঞতা' }, education: { en: 'Education', bn: 'শিক্ষাগত যোগ্যতা' },
      skills: { en: 'Skills and languages', bn: 'দক্ষতা ও ভাষা' }, training: { en: 'Training and certificates', bn: 'প্রশিক্ষণ ও সার্টিফিকেট' },
      personal: { en: 'Personal details', bn: 'ব্যক্তিগত তথ্য' }, references: { en: 'References', bn: 'রেফারেন্স' },
    };
    if (names[k]) return t(names[k]);
    return d.custom.find((c) => `custom:${c.id}` === k)?.title || t({ en: 'Untitled section', bn: 'শিরোনামহীন অংশ' });
  };

  const onImport = async (file: File) => {
    setImporting(true);
    setImportMsg(null);
    try {
      const text = await readCvFile(file);
      if (text.replace(/\s/g, '').length < 40) throw new ImportError('empty');
      const { data, found } = parseCv(text);
      const hasContent = d.name || d.experience.length || d.education.length;
      if (hasContent && !window.confirm(t({ en: 'Replace what you have typed with the uploaded CV?', bn: 'আপনার লেখা তথ্যের জায়গায় আপলোড করা সিভি বসাবেন?' }))) {
        setImporting(false);
        return;
      }
      setState((s) => ({ ...s, data: normalise({ ...data, photo: s.data.photo }) }));
      const counts = found.filter((f) => f.includes(':')).map((f) => f.split(':')).filter(([, n]) => /^\d+$/.test(n));
      const parts = [
        found.includes('contact') ? t({ en: 'contact details', bn: 'যোগাযোগের তথ্য' }) : '',
        found.includes('summary') ? t({ en: 'summary', bn: 'সামারি' }) : '',
        ...counts.map(([k, n]) => `${sectionName(k)} (${num(n, lang)})`),
        found.includes('skills') ? t({ en: 'skills', bn: 'দক্ষতা' }) : '',
        found.includes('personal') ? t({ en: 'personal details', bn: 'ব্যক্তিগত তথ্য' }) : '',
      ].filter(Boolean);
      setImportMsg({
        ok: true,
        text: t({
          en: `Filled: ${parts.join(', ') || 'a few fields'}. Please check every section: CV layouts vary, and two-column designs can mix up.`,
          bn: `পূরণ হয়েছে: ${parts.join(', ') || 'কিছু ঘর'}। প্রতিটি অংশ একবার দেখে নিন: সিভির লেআউট ভিন্ন হয়, আর দুই কলামের ডিজাইনে লেখা এলোমেলো হতে পারে।`,
        }),
      });
      setOpen('contact');
    } catch (err) {
      const code = err instanceof ImportError ? err.code : 'read';
      const msg: Record<string, { en: string; bn: string }> = {
        doc: { en: 'Old .doc files cannot be read here. Open it in Word and save as .docx or PDF, then upload again.', bn: 'পুরনো .doc ফাইল এখানে পড়া যায় না। Word-এ খুলে .docx বা PDF হিসেবে সেভ করে আবার আপলোড করুন।' },
        type: { en: 'Upload a PDF or a Word (.docx) file.', bn: 'PDF বা Word (.docx) ফাইল আপলোড করুন।' },
        empty: { en: 'No text found. If the PDF is a scanned image, type your details instead.', bn: 'কোনো লেখা পাওয়া যায়নি। PDF যদি স্ক্যান করা ছবি হয়, তথ্যগুলো টাইপ করে দিন।' },
        read: { en: 'This file could not be read. Try saving it again as PDF or .docx.', bn: 'ফাইলটি পড়া যায়নি। আবার PDF বা .docx হিসেবে সেভ করে চেষ্টা করুন।' },
      };
      setImportMsg({ ok: false, text: t(msg[code]) });
    }
    setImporting(false);
  };

  const [wordBusy, setWordBusy] = useState(false);
  const downloadWord = async () => {
    setWordBusy(true);
    try {
      const { buildDocx } = await import('../builder/word');
      const blob = await buildDocx(state, { watermark: !pro });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(d.name || 'My').replace(/\s+/g, '_')}_CV.docx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (err) {
      console.error(err);
      window.alert(t({ en: 'The Word file could not be made. Try again, or use Download PDF.', bn: 'Word ফাইল তৈরি করা যায়নি। আবার চেষ্টা করুন, অথবা PDF ডাউনলোড করুন।' }));
    }
    setWordBusy(false);
  };

  const needPro = !pro && isProDesign(state.design);
  const [gate, setGate] = useState(false);
  const askPro = () => setGate(true);
  const pickDesign = (id: DesignId) => setState((s) => ({ ...s, design: id }));

  const saveToAccount = async () => {
    if (!user) return openLogin();
    setSync('saving');
    const r = await createCv(state);
    if (r.ok) {
      setCvId(r.value);
      setSync('saved');
      void refreshList();
    } else setSync(r.error === 'limit' ? 'limit' : 'error');
  };
  const openSaved = async (id: string) => {
    if (id === cvId) return;
    if (!cvId && !isEmpty && !window.confirm(t({ en: 'Open this CV? The one on screen is not saved to your account and will be replaced.', bn: 'এই সিভি খুলবেন? স্ক্রিনের সিভিটি অ্যাকাউন্টে সেভ করা নেই, এটি বদলে যাবে।' }))) return;
    const r = await loadCv(id);
    if (r.ok && r.value?.data) {
      setState({ ...r.value, design: r.value.design ?? 'classic', accent: r.value.accent ?? ACCENTS[0], data: normalise(r.value.data) });
      setCvId(id);
      setSync('saved');
    } else setSync('error');
  };
  const newCv = () => {
    if (!window.confirm(t({ en: 'Start a new CV? The current one stays saved in your account.', bn: 'নতুন সিভি শুরু করবেন? বর্তমানটি আপনার অ্যাকাউন্টে সেভ থাকবে।' }))) return;
    setCvId(null);
    setState((s) => ({ ...s, data: emptyCv() }));
    setSync('idle');
  };
  const removeSaved = async (c: CvSummary) => {
    if (!window.confirm(t({ en: `Delete “${c.title}” from your account?`, bn: `“${c.title}” অ্যাকাউন্ট থেকে মুছবেন?` }))) return;
    const r = await deleteCv(c.id);
    if (r.ok) {
      if (c.id === cvId) setCvId(null);
      void refreshList();
    }
  };

  const printNow = () => {
    const prev = document.title;
    document.title = `${(d.name || 'My').replace(/\s+/g, '_')}_CV`;
    window.print();
    document.title = prev;
  };
  const download = () => (needPro ? askPro() : printNow());

  const isEmpty = !d.name && d.experience.length === 0 && d.education.length === 0;
  const failing = score.checks.filter((c) => !c.pass).sort((a, b) => b.weight - a.weight).slice(0, 3);

  return (
    <>
      <div className="no-print">
        <PageHead crumbs={[{ href: '/tools', label: { en: 'Free tools', bn: 'ফ্রি টুলস' } }, { href: '/builder', label: { en: 'CV builder', bn: 'সিভি বিল্ডার' } }]} title={title} intro={intro} />

        {/* Toolbar */}
        <div className="sticky top-[4.25rem] z-20 border-b border-line bg-paper/95 backdrop-blur max-md:top-[7.6rem]">
          <div className="wrap flex flex-wrap items-center gap-3 py-3">
            <label className="md:hidden">
              <span className="sr-only">{t({ en: 'Design', bn: 'ডিজাইন' })}</span>
              <select className="field !min-h-10 !w-auto !py-1.5 text-sm font-semibold" value={state.design} onChange={(e) => pickDesign(e.target.value as DesignId)}>
                {DESIGNS.map((x) => <option key={x.id} value={x.id}>{t(x.name)}{x.pro && !pro ? ' · Pro' : ''}</option>)}
              </select>
            </label>
            <div role="radiogroup" aria-label={t({ en: 'Heading language', bn: 'শিরোনামের ভাষা' })} className="flex rounded-full bg-white p-0.5 ring-1 ring-line">
              {(['en', 'bn'] as const).map((h) => (
                <button key={h} type="button" role="radio" aria-checked={(state.headings ?? 'en') === h} onClick={() => setState((s) => ({ ...s, headings: h }))}
                  title={t({ en: 'Language of the section headings on your CV', bn: 'সিভির শিরোনামগুলোর ভাষা' })}
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${(state.headings ?? 'en') === h ? 'bg-leaf text-white' : ''}`}>
                  {h === 'en' ? 'EN' : 'বাংলা'}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label={t({ en: 'Colour', bn: 'রং' })} className="flex gap-1.5">
              {ACCENTS.map((c) => (
                <button key={c} type="button" role="radio" aria-checked={state.accent === c} aria-label={c} onClick={() => setState((s) => ({ ...s, accent: c }))}
                  className={`h-7 w-7 rounded-full ring-offset-2 ${state.accent === c ? 'ring-2 ring-ink' : ''}`} style={{ background: c }} />
              ))}
            </div>
            <MarginControl margins={state.margins} onChange={(margins) => setState((s) => ({ ...s, margins }))} t={t} />
            <div className="ml-auto flex items-center gap-2">
              <div className="flex rounded-lg bg-mist p-1 md:hidden">
                {(['edit', 'preview'] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setView(v)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === v ? 'bg-white shadow-sm' : ''}`}>
                    {v === 'edit' ? t({ en: 'Edit', bn: 'এডিট' }) : t({ en: 'Preview', bn: 'প্রিভিউ' })}
                  </button>
                ))}
              </div>
              <button type="button" onClick={downloadWord} disabled={wordBusy} className="btn btn-quiet bg-white !min-h-10" title={t({ en: 'Editable Word file, Classic layout', bn: 'এডিটযোগ্য Word ফাইল, ক্লাসিক লেআউট' })}>
                {wordBusy ? t({ en: 'Making…', bn: 'তৈরি হচ্ছে…' }) : 'Word'}
              </button>
              <button type="button" onClick={download} className="btn btn-primary !min-h-10">
                {needPro && <span aria-hidden="true">🔒 </span>}{t({ en: 'Download PDF', bn: 'PDF ডাউনলোড' })}
              </button>
            </div>
          </div>
        </div>

        <div className="wrap grid grid-cols-1 gap-8 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Form */}
          <div className={`min-w-0 space-y-3 ${view === 'preview' ? 'max-md:hidden' : ''}`}>
            {/* Saved CVs */}
            <section className="rounded-2xl bg-white p-5 ring-1 ring-line">
              {!user ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold">{t({ en: 'Save your CV online', bn: 'সিভি অনলাইনে সেভ করুন' })}</p>
                    <p className="mt-1 text-sm text-muted">{t({ en: 'Log in with your phone number to keep your CV safe and open it on any device.', bn: 'ফোন নম্বর দিয়ে লগইন করুন: সিভি নিরাপদ থাকবে, যেকোনো ডিভাইসে খুলতে পারবেন।' })}</p>
                  </div>
                  <button type="button" className="btn btn-quiet bg-white !min-h-10" onClick={openLogin}>{t({ en: 'Log in', bn: 'লগইন' })}</button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-lg font-semibold">
                      {t({ en: 'My CVs', bn: 'আমার সিভি' })}
                      {saved && <span className="ml-2 font-body text-sm font-normal text-muted">{num(`${saved.list.length}/${saved.limit}`, lang)}</span>}
                    </p>
                    <span className={`text-sm ${sync === 'error' ? 'text-alert' : 'text-muted'}`} aria-live="polite">
                      {cvId && sync === 'saving' && t({ en: 'Saving…', bn: 'সেভ হচ্ছে…' })}
                      {cvId && sync === 'saved' && t({ en: 'Saved to your account', bn: 'অ্যাকাউন্টে সেভ হয়েছে' })}
                      {sync === 'error' && t({ en: 'Could not save. Check your internet.', bn: 'সেভ হয়নি। ইন্টারনেট দেখুন।' })}
                    </span>
                  </div>
                  {!!saved?.list.length && (
                    <ul className="mt-3 space-y-1.5">
                      {saved.list.map((c) => (
                        <li key={c.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 ring-1 ${c.id === cvId ? 'bg-leaf-soft/60 ring-leaf/40' : 'ring-line'}`}>
                          <button type="button" className="min-w-0 flex-1 truncate text-left font-semibold" onClick={() => void openSaved(c.id)} aria-current={c.id === cvId || undefined}>
                            {c.title}
                          </button>
                          {c.id === cvId && <span className="text-xs text-leaf-dark">{t({ en: 'Open', bn: 'খোলা আছে' })}</span>}
                          <button type="button" className="rounded px-2 py-1 text-sm text-alert hover:bg-mist" onClick={() => void removeSaved(c)} aria-label={t({ en: `Delete ${c.title}`, bn: `${c.title} মুছুন` })}>✕</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!cvId && <button type="button" className="btn btn-primary !min-h-10" disabled={sync === 'saving'} onClick={() => void saveToAccount()}>{t({ en: 'Save this CV to my account', bn: 'এই সিভি অ্যাকাউন্টে সেভ করুন' })}</button>}
                    {cvId && <button type="button" className="btn btn-quiet bg-white !min-h-10" onClick={newCv}>+ {t({ en: 'New CV', bn: 'নতুন সিভি' })}</button>}
                  </div>
                  {(sync === 'limit' || (!pro && saved && saved.list.length >= saved.limit && !cvId)) && (
                    <p className="mt-3 rounded-lg bg-gold-soft px-3 py-2 text-sm">
                      {t({ en: 'Free accounts keep 1 CV online. Pro keeps up to 20.', bn: 'ফ্রি অ্যাকাউন্টে ১টি সিভি অনলাইনে থাকে। Pro-তে ২০টি পর্যন্ত।' })}{' '}
                      <Link href="/pro" className="font-semibold underline">{t({ en: 'Get Pro from ৳49', bn: '৳৪৯ থেকে Pro নিন' })}</Link>
                    </p>
                  )}
                </>
              )}
              {!pro && (
                <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
                  {t({ en: 'Free downloads carry a small “Made with HereWeGrow.pro” footer. Pro removes it and unlocks premium designs.', bn: 'ফ্রি ডাউনলোডে ছোট একটি “Made with HereWeGrow.pro” লেখা থাকে। Pro নিলে এটি থাকে না, প্রিমিয়াম ডিজাইনও খুলে যায়।' })}{' '}
                  <Link href="/pro" className="font-semibold text-leaf underline">{t({ en: 'See Pro', bn: 'Pro দেখুন' })}</Link>
                </p>
              )}
            </section>

            {/* Import */}
            <section className="rounded-2xl border-2 border-dashed border-leaf/40 bg-leaf-soft/50 p-5">
              <p className="font-display text-lg font-semibold">{t({ en: 'Already have a CV?', bn: 'আগের সিভি আছে?' })}</p>
              <p className="mt-1 text-muted">{t({ en: 'Upload it as PDF or Word (.docx) and we fill the form for you. The file is read on your device and never uploaded.', bn: 'PDF বা Word (.docx) আপলোড করুন, ফর্ম আমরাই পূরণ করে দেব। ফাইলটি আপনার ডিভাইসেই পড়া হয়, কোথাও আপলোড হয় না।' })}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className={`btn btn-primary cursor-pointer ${importing ? 'pointer-events-none opacity-60' : ''}`}>
                  {importing ? t({ en: 'Reading your CV…', bn: 'সিভি পড়া হচ্ছে…' }) : t({ en: 'Upload my CV', bn: 'আমার সিভি আপলোড করুন' })}
                  <input type="file" accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void onImport(f); }} />
                </label>
                {isEmpty && <button type="button" className="btn btn-quiet bg-white" onClick={() => set(sampleCv())}>{t({ en: 'Or see an example', bn: 'অথবা উদাহরণ দেখুন' })}</button>}
              </div>
              {importMsg && <p role="status" className={`mt-3 rounded-lg px-4 py-3 text-sm ${importMsg.ok ? 'bg-white text-ink' : 'bg-alert/10 text-alert'}`}>{importMsg.text}</p>}
            </section>

            <Section title={t({ en: 'Contact details', bn: 'যোগাযোগের তথ্য' })} open={open === 'contact'} onToggle={() => toggle('contact')}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t({ en: 'Full name', bn: 'পুরো নাম' })} value={d.name} onChange={(v) => set({ name: v })} placeholder="Md. Rakib Hasan" />
                <Field label={t({ en: 'Job title you want', bn: 'যে পদ চান' })} value={d.headline} onChange={(v) => set({ headline: v })} placeholder="Junior Officer" />
                <Field label={t({ en: 'Mobile', bn: 'মোবাইল' })} value={d.phone} onChange={(v) => set({ phone: v })} placeholder="+880 17XX-XXXXXX" type="tel" />
                <Field label={t({ en: 'Email', bn: 'ইমেইল' })} value={d.email} onChange={(v) => set({ email: v })} placeholder="name@email.com" type="email" />
                <Field label={t({ en: 'Area, city', bn: 'এলাকা, শহর' })} value={d.location} onChange={(v) => set({ location: v })} placeholder="Mirpur, Dhaka" />
                <Field label={t({ en: 'LinkedIn (optional)', bn: 'লিংকডইন (ঐচ্ছিক)' })} value={d.linkedin} onChange={(v) => set({ linkedin: v })} placeholder="linkedin.com/in/yourname" />
                <Field label={t({ en: 'Website or portfolio (optional)', bn: 'ওয়েবসাইট বা পোর্টফোলিও (ঐচ্ছিক)' })} value={d.website} onChange={(v) => set({ website: v })} placeholder="yourname.com" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {d.photo && <img src={d.photo} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-line" />}
                <label className="btn btn-quiet cursor-pointer bg-white">
                  {d.photo ? t({ en: 'Change photo', bn: 'ছবি বদলান' }) : t({ en: 'Add photo (optional)', bn: 'ছবি দিন (ঐচ্ছিক)' })}
                  <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set({ photo: await photoToDataUrl(f) }); }} />
                </label>
                {d.photo && <button type="button" className="text-sm text-alert underline" onClick={() => set({ photo: '' })}>{t({ en: 'Remove photo', bn: 'ছবি মুছুন' })}</button>}
              </div>
              <p className="text-sm text-muted">{t({ en: `The photo shows in ${DESIGNS.filter((x) => x.photo).map((x) => x.name.en).join(', ')}. Leave it out for online portals.`, bn: `ছবি দেখায় ${DESIGNS.filter((x) => x.photo).map((x) => x.name.bn).join(', ')} ডিজাইনে। অনলাইন পোর্টালের জন্য ছবি না দেওয়াই ভালো।` })}</p>
            </Section>

            <Section title={sectionName('summary')} open={open === 'summary'} onToggle={() => toggle('summary')}>
              <Area label={t({ en: 'Two or three lines about you', bn: 'আপনার সম্পর্কে দুই-তিন লাইন' })} value={d.summary} onChange={(v) => set({ summary: v })} rows={4}
                placeholder="Finance graduate with 2 years of customer service experience..."
                hint={t({ en: 'Say what you studied or do, one or two results, and the role you want. Skip “to work in a challenging environment”.', bn: 'কী পড়েছেন বা করেন, এক-দুটি অর্জন, আর কোন পদ চান লিখুন। “challenging environment” ধরনের মুখস্থ লাইন বাদ দিন।' })} />
            </Section>

            <Section title={sectionName('experience')} open={open === 'experience'} onToggle={() => toggle('experience')} count={d.experience.length}>
              {d.experience.map((e, i) => (
                <ItemBox key={e.id} t={t} title={e.role || e.org || t({ en: 'New job', bn: 'নতুন কাজ' })} onRemove={() => del('experience', e.id)}
                  onUp={i > 0 ? () => mv('experience', i, -1) : undefined} onDown={i < d.experience.length - 1 ? () => mv('experience', i, 1) : undefined}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t({ en: 'Job title', bn: 'পদবি' })} value={e.role} onChange={(v) => upd('experience', e.id, { role: v })} />
                    <Field label={t({ en: 'Organisation', bn: 'প্রতিষ্ঠান' })} value={e.org} onChange={(v) => upd('experience', e.id, { org: v })} />
                    <Field label={t({ en: 'From', bn: 'শুরু' })} value={e.start} onChange={(v) => upd('experience', e.id, { start: v })} placeholder="Jan 2024" />
                    {!e.current && <Field label={t({ en: 'To', bn: 'শেষ' })} value={e.end} onChange={(v) => upd('experience', e.id, { end: v })} placeholder="Dec 2025" />}
                    <Field label={t({ en: 'Location', bn: 'স্থান' })} value={e.location} onChange={(v) => upd('experience', e.id, { location: v })} placeholder="Dhaka" />
                  </div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={e.current} onChange={(x) => upd('experience', e.id, { current: x.target.checked })} />{t({ en: 'I work here now', bn: 'এখনও এখানে কাজ করছি' })}</label>
                  <Area label={t({ en: 'Responsibilities and achievements (one per line)', bn: 'দায়িত্ব ও অর্জন (প্রতি লাইনে একটি)' })} value={e.bullets} onChange={(v) => upd('experience', e.id, { bullets: v })} rows={5}
                    placeholder={'Served 60+ customers a day\nOpened 300+ accounts in a year'}
                    hint={t({ en: 'Start with an action word (Led, Opened, Reduced) and add a number where you can.', bn: 'কাজের শব্দ দিয়ে শুরু করুন (Led, Opened, Reduced) আর সম্ভব হলে সংখ্যা দিন।' })} />
                </ItemBox>
              ))}
              <AddButton onClick={() => set({ experience: [...d.experience, newExperience()] })}>{t({ en: 'Add a job or internship', bn: 'কাজ বা ইন্টার্নশিপ যোগ করুন' })}</AddButton>
            </Section>

            <Section title={sectionName('education')} open={open === 'education'} onToggle={() => toggle('education')} count={d.education.length}>
              {d.education.map((e, i) => (
                <ItemBox key={e.id} t={t} title={degreeLine(e.degree, e.major) || t({ en: 'New degree', bn: 'নতুন ডিগ্রি' })} onRemove={() => del('education', e.id)}
                  onUp={i > 0 ? () => mv('education', i, -1) : undefined} onDown={i < d.education.length - 1 ? () => mv('education', i, 1) : undefined}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t({ en: 'Degree or exam', bn: 'ডিগ্রি বা পরীক্ষা' })} value={e.degree} onChange={(v) => upd('education', e.id, { degree: v })} placeholder="BBA, HSC, SSC" />
                    <Field label={t({ en: 'Subject or group', bn: 'বিষয় বা বিভাগ' })} value={e.major} onChange={(v) => upd('education', e.id, { major: v })} placeholder="Finance, Science" />
                    <Field label={t({ en: 'Institution', bn: 'প্রতিষ্ঠান' })} value={e.institution} onChange={(v) => upd('education', e.id, { institution: v })} />
                    <Field label={t({ en: 'Result', bn: 'ফলাফল' })} value={e.result} onChange={(v) => upd('education', e.id, { result: v })} placeholder="CGPA 3.50/4.00" />
                    <Field label={t({ en: 'Year', bn: 'সাল' })} value={e.year} onChange={(v) => upd('education', e.id, { year: v })} placeholder="2023" />
                  </div>
                  <Area label={t({ en: 'Details (optional)', bn: 'বিস্তারিত (ঐচ্ছিক)' })} value={e.details} onChange={(v) => upd('education', e.id, { details: v })} rows={2}
                    placeholder="Thesis, awards, relevant courses" />
                </ItemBox>
              ))}
              <AddButton onClick={() => set({ education: [...d.education, newEducation()] })}>{t({ en: 'Add education', bn: 'শিক্ষা যোগ করুন' })}</AddButton>
            </Section>

            <Section title={sectionName('skills')} open={open === 'skills'} onToggle={() => toggle('skills')}>
              <Area label={t({ en: 'Skills, separated by commas or one per line', bn: 'দক্ষতা, কমা দিয়ে বা প্রতি লাইনে একটি' })} value={d.skills} onChange={(v) => set({ skills: v })} rows={3} placeholder="MS Excel, Customer service, Report writing"
                hint={t({ en: 'Use the words the job circular uses, if they are true for you.', bn: 'বিজ্ঞপ্তিতে যে শব্দগুলো আছে, আপনার জন্য সত্যি হলে সেগুলোই ব্যবহার করুন।' })} />
              <Field label={t({ en: 'Languages', bn: 'ভাষা' })} value={d.languages} onChange={(v) => set({ languages: v })} placeholder="Bangla (native), English (fluent)" />
            </Section>

            <Section title={sectionName('training')} open={open === 'training'} onToggle={() => toggle('training')} count={d.training.length}>
              {d.training.map((x, i) => (
                <ItemBox key={x.id} t={t} title={x.name || t({ en: 'New training', bn: 'নতুন প্রশিক্ষণ' })} onRemove={() => del('training', x.id)}
                  onUp={i > 0 ? () => mv('training', i, -1) : undefined} onDown={i < d.training.length - 1 ? () => mv('training', i, 1) : undefined}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t({ en: 'Training or certificate', bn: 'প্রশিক্ষণ বা সার্টিফিকেট' })} value={x.name} onChange={(v) => upd('training', x.id, { name: v })} />
                    <Field label={t({ en: 'Given by', bn: 'প্রতিষ্ঠান' })} value={x.org} onChange={(v) => upd('training', x.id, { org: v })} />
                    <Field label={t({ en: 'Duration', bn: 'মেয়াদ' })} value={x.duration} onChange={(v) => upd('training', x.id, { duration: v })} placeholder="3 months" />
                    <Field label={t({ en: 'Year', bn: 'সাল' })} value={x.year} onChange={(v) => upd('training', x.id, { year: v })} />
                  </div>
                  <Area label={t({ en: 'What you learned or did (optional)', bn: 'কী শিখেছেন বা করেছেন (ঐচ্ছিক)' })} value={x.details} onChange={(v) => upd('training', x.id, { details: v })} rows={2}
                    placeholder="Topics covered, project, grade" />
                </ItemBox>
              ))}
              <AddButton onClick={() => set({ training: [...d.training, newTraining()] })}>{t({ en: 'Add training', bn: 'প্রশিক্ষণ যোগ করুন' })}</AddButton>
            </Section>

            {d.custom.map((c) => (
              <Section key={c.id} title={c.title || sectionName(`custom:${c.id}`)} open={open === `custom:${c.id}`} onToggle={() => toggle(`custom:${c.id}`)} count={c.items.length}
                extra={<button type="button" className="text-sm text-alert underline" onClick={() => { if (window.confirm(t({ en: `Delete the “${c.title}” section?`, bn: `“${c.title}” অংশটি মুছবেন?` }))) removeSection(c.id); }}>{t({ en: 'Delete', bn: 'মুছুন' })}</button>}>
                <Field label={t({ en: 'Section title', bn: 'অংশের শিরোনাম' })} value={c.title} onChange={(v) => updSection(c.id, { title: v })} />
                {c.items.map((it, i) => (
                  <ItemBox key={it.id} t={t} title={it.title || t({ en: 'New entry', bn: 'নতুন এন্ট্রি' })} onRemove={() => updSection(c.id, { items: c.items.filter((x) => x.id !== it.id) })}
                    onUp={i > 0 ? () => updSection(c.id, { items: move(c.items, i, -1) }) : undefined} onDown={i < c.items.length - 1 ? () => updSection(c.id, { items: move(c.items, i, 1) }) : undefined}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={t({ en: 'Title', bn: 'শিরোনাম' })} value={it.title} onChange={(v) => updItem(c.id, it.id, { title: v })} />
                      <Field label={t({ en: 'Organisation or role (optional)', bn: 'প্রতিষ্ঠান বা ভূমিকা (ঐচ্ছিক)' })} value={it.subtitle} onChange={(v) => updItem(c.id, it.id, { subtitle: v })} />
                      <Field label={t({ en: 'Date (optional)', bn: 'তারিখ (ঐচ্ছিক)' })} value={it.date} onChange={(v) => updItem(c.id, it.id, { date: v })} placeholder="2024" />
                    </div>
                    <Area label={t({ en: 'Description (optional, one point per line)', bn: 'বিবরণ (ঐচ্ছিক, প্রতি লাইনে একটি পয়েন্ট)' })} value={it.details} onChange={(v) => updItem(c.id, it.id, { details: v })} rows={3} />
                  </ItemBox>
                ))}
                <AddButton onClick={() => updSection(c.id, { items: [...c.items, newCustomItem()] })}>{t({ en: 'Add an entry', bn: 'এন্ট্রি যোগ করুন' })}</AddButton>
              </Section>
            ))}

            {/* Add a section */}
            <section className="rounded-2xl bg-white p-5 ring-1 ring-line">
              <p className="font-display text-lg font-semibold">{t({ en: 'Add a section', bn: 'নতুন অংশ যোগ করুন' })}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SECTION_PRESETS.filter((p) => !d.custom.some((c) => c.title === p.en || c.title === p.bn)).map((p) => (
                  <button key={p.en} type="button" title={t(p.hint)} onClick={() => addSection(state.headings === 'bn' ? p.bn : p.en)}
                    className="rounded-full bg-mist px-3.5 py-1.5 text-sm font-semibold hover:bg-leaf-soft hover:text-leaf-dark">
                    + {t(p)}
                  </button>
                ))}
              </div>
              <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addSection(newSection); }}>
                <input className="field" value={newSection} onChange={(e) => setNewSection(e.target.value)} placeholder={t({ en: 'Or name your own, e.g. Research', bn: 'অথবা নিজের নাম দিন, যেমন Research' })} aria-label={t({ en: 'New section name', bn: 'নতুন অংশের নাম' })} />
                <button type="submit" className="btn btn-quiet shrink-0 bg-white" disabled={!newSection.trim()}>{t({ en: 'Add', bn: 'যোগ করুন' })}</button>
              </form>
            </section>

            <Section title={sectionName('personal')} open={open === 'personal'} onToggle={() => toggle('personal')}>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1.5" checked={d.showPersonal} onChange={(e) => set({ showPersonal: e.target.checked })} />
                <span>{t({ en: 'Show personal details on my CV. Many government and bank circulars ask for these; private and online applications usually do not.', bn: 'সিভিতে ব্যক্তিগত তথ্য দেখাও। অনেক সরকারি ও ব্যাংকের বিজ্ঞপ্তিতে এগুলো চাওয়া হয়; বেসরকারি ও অনলাইন আবেদনে সাধারণত লাগে না।' })}</span>
              </label>
              {d.showPersonal && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t({ en: "Father's name", bn: 'বাবার নাম' })} value={d.father} onChange={(v) => set({ father: v })} />
                  <Field label={t({ en: "Mother's name", bn: 'মায়ের নাম' })} value={d.mother} onChange={(v) => set({ mother: v })} />
                  <Field label={t({ en: 'Date of birth', bn: 'জন্মতারিখ' })} value={d.dob} onChange={(v) => set({ dob: v })} placeholder="12 March 1999" />
                  <Field label={t({ en: 'Gender (if asked)', bn: 'লিঙ্গ (চাইলে)' })} value={d.gender} onChange={(v) => set({ gender: v })} />
                  <Field label={t({ en: 'Marital status (if asked)', bn: 'বৈবাহিক অবস্থা (চাইলে)' })} value={d.marital} onChange={(v) => set({ marital: v })} />
                  <Field label={t({ en: 'Nationality', bn: 'জাতীয়তা' })} value={d.nationality} onChange={(v) => set({ nationality: v })} />
                  <Field label={t({ en: 'Religion (if asked)', bn: 'ধর্ম (চাইলে)' })} value={d.religion} onChange={(v) => set({ religion: v })} />
                  <Field label={t({ en: 'NID number (only if asked)', bn: 'এনআইডি নম্বর (শুধু চাইলে)' })} value={d.nid} onChange={(v) => set({ nid: v })} />
                  <Field label={t({ en: 'Present address', bn: 'বর্তমান ঠিকানা' })} value={d.presentAddress} onChange={(v) => set({ presentAddress: v })} />
                  <Field label={t({ en: 'Permanent address', bn: 'স্থায়ী ঠিকানা' })} value={d.permanentAddress} onChange={(v) => set({ permanentAddress: v })} />
                </div>
              )}
            </Section>

            <Section title={sectionName('references')} open={open === 'references'} onToggle={() => toggle('references')} count={d.references.length}>
              {d.references.map((r, i) => (
                <ItemBox key={r.id} t={t} title={r.name || t({ en: 'New reference', bn: 'নতুন রেফারেন্স' })} onRemove={() => del('references', r.id)}
                  onUp={i > 0 ? () => mv('references', i, -1) : undefined} onDown={i < d.references.length - 1 ? () => mv('references', i, 1) : undefined}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t({ en: 'Name', bn: 'নাম' })} value={r.name} onChange={(v) => upd('references', r.id, { name: v })} />
                    <Field label={t({ en: 'Designation', bn: 'পদবি' })} value={r.title} onChange={(v) => upd('references', r.id, { title: v })} />
                    <Field label={t({ en: 'Organisation', bn: 'প্রতিষ্ঠান' })} value={r.org} onChange={(v) => upd('references', r.id, { org: v })} />
                    <Field label={t({ en: 'Relation (optional)', bn: 'সম্পর্ক (ঐচ্ছিক)' })} value={r.relation} onChange={(v) => upd('references', r.id, { relation: v })} placeholder="Thesis supervisor" />
                    <Field label={t({ en: 'Mobile', bn: 'মোবাইল' })} value={r.phone} onChange={(v) => upd('references', r.id, { phone: v })} type="tel" />
                    <Field label={t({ en: 'Email', bn: 'ইমেইল' })} value={r.email} onChange={(v) => upd('references', r.id, { email: v })} type="email" />
                  </div>
                </ItemBox>
              ))}
              <AddButton onClick={() => set({ references: [...d.references, newReference()] })}>{t({ en: 'Add a reference', bn: 'রেফারেন্স যোগ করুন' })}</AddButton>
              <p className="text-sm text-muted">{t({ en: 'Ask each person before you list them.', bn: 'রেফারেন্স দেওয়ার আগে অবশ্যই তাঁর অনুমতি নিন।' })}</p>
            </Section>

            {/* Section order */}
            <Section title={t({ en: 'Section order and visibility', bn: 'অংশের ক্রম ও দেখানো/লুকানো' })} open={open === 'order'} onToggle={() => toggle('order')}>
              <p className="text-sm text-muted">{t({ en: 'Move sections up or down, or hide one without deleting it.', bn: 'অংশ উপরে-নিচে সরান, অথবা না মুছে লুকিয়ে রাখুন।' })}</p>
              <ol className="divide-y divide-line rounded-xl ring-1 ring-line">
                {d.order.map((k, i) => {
                  const hidden = d.hidden.includes(k);
                  return (
                    <li key={k} className={`flex items-center gap-2 px-3 py-2 ${hidden ? 'text-muted' : ''}`}>
                      <span className="flex-1 truncate">{sectionName(k)}</span>
                      <button type="button" disabled={i === 0} onClick={() => set({ order: move(d.order, i, -1) })} className="rounded px-2 py-1 hover:bg-mist disabled:opacity-30" aria-label={t({ en: 'Move up', bn: 'উপরে নিন' })}>↑</button>
                      <button type="button" disabled={i === d.order.length - 1} onClick={() => set({ order: move(d.order, i, 1) })} className="rounded px-2 py-1 hover:bg-mist disabled:opacity-30" aria-label={t({ en: 'Move down', bn: 'নিচে নিন' })}>↓</button>
                      <button type="button" aria-pressed={!hidden} onClick={() => set({ hidden: hidden ? d.hidden.filter((x) => x !== k) : [...d.hidden, k] })}
                        className={`w-20 rounded-full px-2 py-1 text-xs font-semibold ${hidden ? 'bg-mist' : 'bg-leaf-soft text-leaf-dark'}`}>
                        {hidden ? t({ en: 'Hidden', bn: 'লুকানো' }) : t({ en: 'Shown', bn: 'দেখানো' })}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </Section>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted">
              <span>{t({ en: 'Saved on this device as you type.', bn: 'লেখার সাথে সাথে এই ডিভাইসে সেভ হচ্ছে।' })}</span>
              <button type="button" className="text-alert underline underline-offset-4" onClick={() => { if (window.confirm(t({ en: 'Clear everything and start again?', bn: 'সব মুছে নতুন করে শুরু করবেন?' }))) set(emptyCv()); }}>
                {t({ en: 'Start again', bn: 'নতুন করে শুরু' })}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className={`min-w-0 ${view === 'edit' ? 'max-md:hidden' : ''}`}>
            <div className="md:sticky md:top-36">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="font-display text-lg font-semibold">{t({ en: 'Choose a design', bn: 'ডিজাইন বেছে নিন' })}</p>
                <p className="truncate text-sm text-muted">{t(DESIGNS.find((x) => x.id === state.design)?.note ?? DESIGNS[0].note)}</p>
              </div>
              <DesignGallery state={state} pro={pro} onPick={pickDesign} t={t} />
              {!isEmpty && (
                <div className="mb-4 flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-xl font-semibold ${score.score >= 80 ? 'bg-leaf-soft text-leaf-dark' : score.score >= 60 ? 'bg-gold-soft text-gold' : 'bg-alert/10 text-alert'}`}
                    aria-label={t({ en: `CV score ${score.score} out of 100`, bn: `সিভি স্কোর ১০০-এর মধ্যে ${num(String(score.score), 'bn')}` })}>
                    {num(String(score.score), lang)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{failing.length ? t({ en: 'To raise your score', bn: 'স্কোর বাড়াতে' }) : t({ en: 'Strong CV. Ready to send.', bn: 'শক্তিশালী সিভি। পাঠানোর জন্য প্রস্তুত।' })}</p>
                    <ul className="mt-1 space-y-1 text-sm text-muted">
                      {failing.map((c) => <li key={c.id}>{t(c.fix)}</li>)}
                    </ul>
                  </div>
                </div>
              )}
              {pages > 1 && (
                <p className="mb-2 text-sm text-muted">
                  {t({ en: `${pages} pages. Dashed lines show where each A4 page ends.`, bn: `${num(String(pages), 'bn')} পৃষ্ঠা। ড্যাশ লাইনে প্রতিটি A4 পৃষ্ঠার শেষ দেখানো হয়েছে।` })}
                </p>
              )}
              <div ref={previewBox} className="overflow-hidden rounded-xl bg-mist ring-1 ring-line">
                <div style={{ height: pages * A4_PX * scale }}>
                  <div style={{ width: 794, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative' }} className="shadow-lg">
                    <div ref={docBox}>
                      <CvDocument d={d} design={state.design} accent={state.accent} headings={state.headings} margins={state.margins} />
                    </div>
                    {Array.from({ length: pages - 1 }, (_, i) => (
                      <div key={i} aria-hidden="true" className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-red-400" style={{ top: (i + 1) * A4_PX }}>
                        <span className="absolute right-2 top-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{t({ en: `Page ${i + 2}`, bn: `পৃষ্ঠা ${num(String(i + 2), 'bn')}` })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-line">
                <p className="font-semibold">{t({ en: 'Want an expert to check it?', bn: 'বিশেষজ্ঞকে দিয়ে যাচাই করাতে চান?' })}</p>
                <p className="mt-1 text-sm text-muted">{t({ en: 'Download the PDF, then get written feedback on every section for ৳199.', bn: 'PDF ডাউনলোড করে ৳১৯৯-এ প্রতিটি অংশের লিখিত মতামত নিন।' })}</p>
                <Link href="/services" className="btn btn-quiet mt-3 bg-white !min-h-10">{t({ en: 'CV review ৳199', bn: 'সিভি রিভিউ ৳১৯৯' })}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {gate && (
        <ProGate designName={DESIGNS.find((x) => x.id === state.design)?.name ?? DESIGNS[0].name} onClose={() => setGate(false)}
          onUseFree={() => { setGate(false); pickDesign('classic'); setTimeout(printNow, 150); }} />
      )}

      {/* What gets printed: the CV alone, at full A4 size */}
      <div id="cv-print" aria-hidden="true">
        <CvDocument d={d} design={state.design} accent={state.accent} headings={state.headings} margins={state.margins} />
        {!pro && <div className="cv-watermark">Made with HereWeGrow.pro</div>}
      </div>
    </>
  );
}
