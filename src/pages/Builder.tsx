import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ACCENTS, emptyCv, loadState, sampleCv, saveState, uid, type BuilderState, type CvData, type Education, type Experience, type Reference, type Training } from '../builder/model';
import { CvDocument, DESIGNS } from '../builder/designs';
import { PageHead } from '../components/PageHead';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';

type T = (x: { en: string; bn: string }) => string;

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

function Section({ title, open, onToggle, children, count }: { title: string; open: boolean; onToggle: () => void; children: ReactNode; count?: number }) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-line">
      <h2>
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-display text-lg font-semibold">
          <span>{title}{count ? <span className="ml-2 rounded-full bg-mist px-2 py-0.5 font-body text-sm text-muted">{count}</span> : null}</span>
          <span aria-hidden="true" className={`grid h-7 w-7 place-items-center rounded-full bg-mist text-leaf transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
        </button>
      </h2>
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

/* ── page ─────────────────────────────────────────────────────── */

export function BuilderPage() {
  const { t } = useLang();
  const [state, setState] = useState<BuilderState>(() => loadState() ?? { data: emptyCv(), design: 'classic', accent: ACCENTS[0] });
  const [open, setOpen] = useState<string>('contact');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const previewBox = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  const title = t({ en: 'Free CV builder', bn: 'ফ্রি সিভি বিল্ডার' });
  const intro = t({
    en: 'Fill in your details, pick a design and download a print-ready PDF. Free, no sign-up, and your CV stays on your device.',
    bn: 'তথ্য দিন, ডিজাইন বেছে নিন, প্রিন্ট-রেডি PDF ডাউনলোড করুন। বিনামূল্যে, সাইন-আপ ছাড়া, আর আপনার সিভি আপনার ডিভাইসেই থাকে।',
  });
  useEffect(() => setPageMeta(title, intro, '/builder'), [title, intro]);
  useEffect(() => saveState(state), [state]);

  useEffect(() => {
    const el = previewBox.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / 794));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const d = state.data;
  const set = (patch: Partial<CvData>) => setState((s) => ({ ...s, data: { ...s.data, ...patch } }));
  const toggle = (id: string) => setOpen((cur) => (cur === id ? '' : id));
  const upd = <K extends 'experience' | 'education' | 'training' | 'references'>(key: K, id: string, patch: Partial<CvData[K][number]>) =>
    set({ [key]: (d[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) } as Partial<CvData>);
  const del = (key: 'experience' | 'education' | 'training' | 'references', id: string) =>
    set({ [key]: (d[key] as { id: string }[]).filter((x) => x.id !== id) } as Partial<CvData>);

  const [wordBusy, setWordBusy] = useState(false);
  const downloadWord = async () => {
    setWordBusy(true);
    try {
      const { buildDocx } = await import('../builder/word');
      const blob = await buildDocx(state);
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

  const download = () => {
    const prev = document.title;
    document.title = `${(d.name || 'My').replace(/\s+/g, '_')}_CV`;
    window.print();
    document.title = prev;
  };

  const isEmpty = !d.name && d.experience.length === 0 && d.education.length === 0;

  return (
    <>
      <div className="no-print">
        <PageHead crumbs={[{ href: '/tools', label: { en: 'Free tools', bn: 'ফ্রি টুলস' } }, { href: '/builder', label: { en: 'CV builder', bn: 'সিভি বিল্ডার' } }]} title={title} intro={intro} />

        {/* Toolbar */}
        <div className="sticky top-[4.25rem] z-20 border-b border-line bg-paper/95 backdrop-blur max-md:top-[7.6rem]">
          <div className="wrap flex flex-wrap items-center gap-3 py-3">
            <div role="radiogroup" aria-label={t({ en: 'Design', bn: 'ডিজাইন' })} className="flex flex-wrap gap-1.5">
              {DESIGNS.map((x) => (
                <button key={x.id} type="button" role="radio" aria-checked={state.design === x.id} title={t(x.note)}
                  onClick={() => setState((s) => ({ ...s, design: x.id }))}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${state.design === x.id ? 'bg-ink text-white' : 'bg-white ring-1 ring-line hover:ring-leaf'}`}>
                  {t(x.name)}
                </button>
              ))}
            </div>
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
              <button type="button" onClick={download} className="btn btn-primary !min-h-10">{t({ en: 'Download PDF', bn: 'PDF ডাউনলোড' })}</button>
            </div>
          </div>
        </div>

        <div className="wrap grid grid-cols-1 gap-8 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Form */}
          <div className={`space-y-3 ${view === 'preview' ? 'max-md:hidden' : ''}`}>
            {isEmpty && (
              <div className="rounded-2xl bg-gold-soft p-5">
                <p className="font-display text-lg">{t({ en: 'First time here?', bn: 'প্রথমবার?' })}</p>
                <p className="mt-1 text-muted">{t({ en: 'Load an example CV to see how a strong one reads, then replace it with your details.', bn: 'একটি উদাহরণ সিভি দেখে নিন শক্তিশালী সিভি কেমন হয়, তারপর নিজের তথ্য বসান।' })}</p>
                <button type="button" className="btn btn-primary mt-3" onClick={() => set(sampleCv())}>{t({ en: 'Load an example', bn: 'উদাহরণ দেখুন' })}</button>
              </div>
            )}

            <Section title={t({ en: 'Contact details', bn: 'যোগাযোগের তথ্য' })} open={open === 'contact'} onToggle={() => toggle('contact')}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t({ en: 'Full name', bn: 'পুরো নাম' })} value={d.name} onChange={(v) => set({ name: v })} placeholder="Md. Rakib Hasan" />
                <Field label={t({ en: 'Job title you want', bn: 'যে পদ চান' })} value={d.headline} onChange={(v) => set({ headline: v })} placeholder="Junior Officer" />
                <Field label={t({ en: 'Mobile', bn: 'মোবাইল' })} value={d.phone} onChange={(v) => set({ phone: v })} placeholder="+880 17XX-XXXXXX" type="tel" />
                <Field label={t({ en: 'Email', bn: 'ইমেইল' })} value={d.email} onChange={(v) => set({ email: v })} placeholder="name@email.com" type="email" />
                <Field label={t({ en: 'Area, city', bn: 'এলাকা, শহর' })} value={d.location} onChange={(v) => set({ location: v })} placeholder="Mirpur, Dhaka" />
                <Field label={t({ en: 'LinkedIn (optional)', bn: 'লিংকডইন (ঐচ্ছিক)' })} value={d.linkedin} onChange={(v) => set({ linkedin: v })} placeholder="linkedin.com/in/yourname" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {d.photo && <img src={d.photo} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-line" />}
                <label className="btn btn-quiet cursor-pointer bg-white">
                  {d.photo ? t({ en: 'Change photo', bn: 'ছবি বদলান' }) : t({ en: 'Add photo (optional)', bn: 'ছবি দিন (ঐচ্ছিক)' })}
                  <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set({ photo: await photoToDataUrl(f) }); }} />
                </label>
                {d.photo && <button type="button" className="text-sm text-alert underline" onClick={() => set({ photo: '' })}>{t({ en: 'Remove photo', bn: 'ছবি মুছুন' })}</button>}
              </div>
              <p className="text-sm text-muted">{t({ en: 'The photo shows in the Modern and Executive designs. Leave it out for online portals.', bn: 'ছবি মডার্ন ও এক্সিকিউটিভ ডিজাইনে দেখায়। অনলাইন পোর্টালের জন্য ছবি না দেওয়াই ভালো।' })}</p>
            </Section>

            <Section title={t({ en: 'Summary', bn: 'সামারি' })} open={open === 'summary'} onToggle={() => toggle('summary')}>
              <Area label={t({ en: 'Two or three lines about you', bn: 'আপনার সম্পর্কে দুই-তিন লাইন' })} value={d.summary} onChange={(v) => set({ summary: v })} rows={4}
                placeholder="Finance graduate with 2 years of customer service experience..."
                hint={t({ en: 'Say what you studied or do, one or two results, and the role you want. Skip “to work in a challenging environment”.', bn: 'কী পড়েছেন বা করেন, এক-দুটি অর্জন, আর কোন পদ চান লিখুন। “challenging environment” ধরনের মুখস্থ লাইন বাদ দিন।' })} />
            </Section>

            <Section title={t({ en: 'Work experience', bn: 'কাজের অভিজ্ঞতা' })} open={open === 'exp'} onToggle={() => toggle('exp')} count={d.experience.length}>
              {d.experience.map((e: Experience, i) => (
                <ItemBox key={e.id} t={t} title={e.role || t({ en: 'New job', bn: 'নতুন কাজ' })} onRemove={() => del('experience', e.id)}
                  onUp={i > 0 ? () => set({ experience: move(d.experience, i, -1) }) : undefined}
                  onDown={i < d.experience.length - 1 ? () => set({ experience: move(d.experience, i, 1) }) : undefined}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t({ en: 'Job title', bn: 'পদবি' })} value={e.role} onChange={(v) => upd('experience', e.id, { role: v })} />
                    <Field label={t({ en: 'Organisation', bn: 'প্রতিষ্ঠান' })} value={e.org} onChange={(v) => upd('experience', e.id, { org: v })} />
                    <Field label={t({ en: 'From', bn: 'শুরু' })} value={e.start} onChange={(v) => upd('experience', e.id, { start: v })} placeholder="Jan 2024" />
                    {!e.current && <Field label={t({ en: 'To', bn: 'শেষ' })} value={e.end} onChange={(v) => upd('experience', e.id, { end: v })} placeholder="Dec 2025" />}
                    <Field label={t({ en: 'Location', bn: 'স্থান' })} value={e.location} onChange={(v) => upd('experience', e.id, { location: v })} placeholder="Dhaka" />
                  </div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={e.current} onChange={(x) => upd('experience', e.id, { current: x.target.checked })} />{t({ en: 'I work here now', bn: 'এখনও এখানে কাজ করছি' })}</label>
                  <Area label={t({ en: 'What you achieved (one per line)', bn: 'কী অর্জন করেছেন (প্রতি লাইনে একটি)' })} value={e.bullets} onChange={(v) => upd('experience', e.id, { bullets: v })} rows={4}
                    placeholder={'Served 60+ customers a day\nOpened 300+ accounts in a year'}
                    hint={t({ en: 'Start with an action word (Led, Opened, Reduced) and add a number where you can.', bn: 'কাজের শব্দ দিয়ে শুরু করুন (Led, Opened, Reduced) আর সম্ভব হলে সংখ্যা দিন।' })} />
                </ItemBox>
              ))}
              <button type="button" className="btn btn-quiet w-full bg-white" onClick={() => set({ experience: [...d.experience, { id: uid(), role: '', org: '', location: '', start: '', end: '', current: false, bullets: '' }] })}>
                + {t({ en: 'Add a job or internship', bn: 'কাজ বা ইন্টার্নশিপ যোগ করুন' })}
              </button>
            </Section>

            <Section title={t({ en: 'Education', bn: 'শিক্ষাগত যোগ্যতা' })} open={open === 'edu'} onToggle={() => toggle('edu')} count={d.education.length}>
              {d.education.map((e: Education, i) => (
                <ItemBox key={e.id} t={t} title={e.degree || t({ en: 'New degree', bn: 'নতুন ডিগ্রি' })} onRemove={() => del('education', e.id)}
                  onUp={i > 0 ? () => set({ education: move(d.education, i, -1) }) : undefined}
                  onDown={i < d.education.length - 1 ? () => set({ education: move(d.education, i, 1) }) : undefined}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t({ en: 'Degree or exam', bn: 'ডিগ্রি বা পরীক্ষা' })} value={e.degree} onChange={(v) => upd('education', e.id, { degree: v })} placeholder="BBA in Finance" />
                    <Field label={t({ en: 'Institution', bn: 'প্রতিষ্ঠান' })} value={e.institution} onChange={(v) => upd('education', e.id, { institution: v })} />
                    <Field label={t({ en: 'Result', bn: 'ফলাফল' })} value={e.result} onChange={(v) => upd('education', e.id, { result: v })} placeholder="CGPA 3.50/4.00" />
                    <Field label={t({ en: 'Year', bn: 'সাল' })} value={e.year} onChange={(v) => upd('education', e.id, { year: v })} placeholder="2023" />
                  </div>
                </ItemBox>
              ))}
              <button type="button" className="btn btn-quiet w-full bg-white" onClick={() => set({ education: [...d.education, { id: uid(), degree: '', institution: '', result: '', year: '' }] })}>
                + {t({ en: 'Add education', bn: 'শিক্ষা যোগ করুন' })}
              </button>
            </Section>

            <Section title={t({ en: 'Skills and languages', bn: 'দক্ষতা ও ভাষা' })} open={open === 'skills'} onToggle={() => toggle('skills')}>
              <Area label={t({ en: 'Skills, separated by commas', bn: 'দক্ষতা, কমা দিয়ে আলাদা করুন' })} value={d.skills} onChange={(v) => set({ skills: v })} rows={3} placeholder="MS Excel, Customer service, Report writing" />
              <Field label={t({ en: 'Languages', bn: 'ভাষা' })} value={d.languages} onChange={(v) => set({ languages: v })} placeholder="Bangla (native), English (fluent)" />
            </Section>

            <Section title={t({ en: 'Training and certificates', bn: 'প্রশিক্ষণ ও সার্টিফিকেট' })} open={open === 'training'} onToggle={() => toggle('training')} count={d.training.length}>
              {d.training.map((x: Training) => (
                <ItemBox key={x.id} t={t} title={x.name || t({ en: 'New training', bn: 'নতুন প্রশিক্ষণ' })} onRemove={() => del('training', x.id)}>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label={t({ en: 'Name', bn: 'নাম' })} value={x.name} onChange={(v) => upd('training', x.id, { name: v })} />
                    <Field label={t({ en: 'Given by', bn: 'প্রতিষ্ঠান' })} value={x.org} onChange={(v) => upd('training', x.id, { org: v })} />
                    <Field label={t({ en: 'Year', bn: 'সাল' })} value={x.year} onChange={(v) => upd('training', x.id, { year: v })} />
                  </div>
                </ItemBox>
              ))}
              <button type="button" className="btn btn-quiet w-full bg-white" onClick={() => set({ training: [...d.training, { id: uid(), name: '', org: '', year: '' }] })}>
                + {t({ en: 'Add training', bn: 'প্রশিক্ষণ যোগ করুন' })}
              </button>
            </Section>

            <Section title={t({ en: 'Personal details (Bangladesh format)', bn: 'ব্যক্তিগত তথ্য (বাংলাদেশি ফরম্যাট)' })} open={open === 'personal'} onToggle={() => toggle('personal')}>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1.5" checked={d.showPersonal} onChange={(e) => set({ showPersonal: e.target.checked })} />
                <span>{t({ en: 'Show personal details on my CV. Many government and bank circulars ask for these; private and online applications usually do not.', bn: 'সিভিতে ব্যক্তিগত তথ্য দেখাও। অনেক সরকারি ও ব্যাংকের বিজ্ঞপ্তিতে এগুলো চাওয়া হয়; বেসরকারি ও অনলাইন আবেদনে সাধারণত লাগে না।' })}</span>
              </label>
              {d.showPersonal && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t({ en: "Father's name", bn: 'বাবার নাম' })} value={d.father} onChange={(v) => set({ father: v })} />
                  <Field label={t({ en: "Mother's name", bn: 'মায়ের নাম' })} value={d.mother} onChange={(v) => set({ mother: v })} />
                  <Field label={t({ en: 'Date of birth', bn: 'জন্মতারিখ' })} value={d.dob} onChange={(v) => set({ dob: v })} placeholder="12 March 1999" />
                  <Field label={t({ en: 'Nationality', bn: 'জাতীয়তা' })} value={d.nationality} onChange={(v) => set({ nationality: v })} />
                  <Field label={t({ en: 'Religion (if asked)', bn: 'ধর্ম (চাইলে)' })} value={d.religion} onChange={(v) => set({ religion: v })} />
                  <Field label={t({ en: 'Permanent address', bn: 'স্থায়ী ঠিকানা' })} value={d.permanentAddress} onChange={(v) => set({ permanentAddress: v })} />
                </div>
              )}
            </Section>

            <Section title={t({ en: 'References', bn: 'রেফারেন্স' })} open={open === 'refs'} onToggle={() => toggle('refs')} count={d.references.length}>
              {d.references.map((r: Reference) => (
                <ItemBox key={r.id} t={t} title={r.name || t({ en: 'New reference', bn: 'নতুন রেফারেন্স' })} onRemove={() => del('references', r.id)}>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label={t({ en: 'Name', bn: 'নাম' })} value={r.name} onChange={(v) => upd('references', r.id, { name: v })} />
                    <Field label={t({ en: 'Title, organisation', bn: 'পদবি, প্রতিষ্ঠান' })} value={r.title} onChange={(v) => upd('references', r.id, { title: v })} />
                    <Field label={t({ en: 'Phone or email', bn: 'ফোন বা ইমেইল' })} value={r.contact} onChange={(v) => upd('references', r.id, { contact: v })} />
                  </div>
                </ItemBox>
              ))}
              <button type="button" className="btn btn-quiet w-full bg-white" onClick={() => set({ references: [...d.references, { id: uid(), name: '', title: '', contact: '' }] })}>
                + {t({ en: 'Add a reference', bn: 'রেফারেন্স যোগ করুন' })}
              </button>
              <p className="text-sm text-muted">{t({ en: 'Ask each person before you list them.', bn: 'রেফারেন্স দেওয়ার আগে অবশ্যই তাঁর অনুমতি নিন।' })}</p>
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
              <div ref={previewBox} className="overflow-hidden rounded-xl bg-mist p-0 ring-1 ring-line">
                <div style={{ height: 1123 * scale }}>
                  <div style={{ width: 794, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="shadow-lg">
                    <CvDocument d={d} design={state.design} accent={state.accent} headings={state.headings} />
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-line">
                <p className="font-semibold">{t({ en: 'Want an expert to check it?', bn: 'বিশেষজ্ঞকে দিয়ে যাচাই করাতে চান?' })}</p>
                <p className="mt-1 text-sm text-muted">{t({ en: 'Download the PDF, then get written feedback on every section for ৳199, or run it through the free CV checker.', bn: 'PDF ডাউনলোড করে ৳১৯৯-এ প্রতিটি অংশের লিখিত মতামত নিন, অথবা ফ্রি সিভি চেকারে দিন।' })}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/services" className="btn btn-quiet bg-white !min-h-10">{t({ en: 'CV review ৳199', bn: 'সিভি রিভিউ ৳১৯৯' })}</Link>
                  <Link href="/tools/cv-checker" className="btn btn-quiet bg-white !min-h-10">{t({ en: 'Free CV checker', bn: 'ফ্রি সিভি চেকার' })}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What gets printed: the CV alone, at full A4 size */}
      <div id="cv-print" aria-hidden="true">
        <CvDocument d={d} design={state.design} accent={state.accent} headings={state.headings} />
      </div>
    </>
  );
}
