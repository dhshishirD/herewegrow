// The client's own page (/p/<code>): no login. They fill a simple form and the details land in their CV maker's folder.
import { useEffect, useRef, useState } from 'react';
import type { CvData } from '../builder/model';
import { useLang } from '../lib/lang';
import { intakeInfo, intakeSubmit } from '../lib/partner';
import { setPageMeta } from '../lib/seo';

type B = { en: string; bn: string };
const ERR: Record<string, B> = {
  invalid: { en: 'Please check your name and mobile number (01XXXXXXXXX).', bn: 'নাম ও মোবাইল নম্বর (01XXXXXXXXX) ঠিক আছে কিনা দেখুন।' },
  rate: { en: 'Too many tries. Please wait a while and try again.', bn: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।' },
  captcha: { en: 'Please complete the check below, then send.', bn: 'নিচের যাচাই সম্পন্ন করে আবার পাঠান।' },
  closed: { en: 'This link is not taking new details right now. Please message the person who sent it.', bn: 'এই লিংক এখন নতুন তথ্য নিচ্ছে না। যিনি লিংক পাঠিয়েছেন তাঁকে মেসেজ করুন।' },
  network: { en: 'No connection. Please try again.', bn: 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।' },
};

/** Shrinks a photo to a small JPEG (about 300 px) so it fits in the CV. Returns '' if it cannot be read. */
async function smallPhoto(file: File): Promise<string> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 300 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.8);
  } catch {
    return '';
  }
}

type Row = Record<string, string>;
const emptyEdu = (): Row => ({ degree: '', institution: '', year: '', result: '' });
const emptyJob = (): Row => ({ role: '', org: '', period: '', duties: '' });
const joinPeriod = (start: string, end: string, current: boolean) => [start, current ? 'Present' : end].filter(Boolean).join(' – ');

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void }) => void } }
}

export function PartnerIntake({ code }: { code: string }) {
  const { t } = useLang();
  const [partner, setPartner] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [bad, setBad] = useState(false);
  const [f, setF] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [edus, setEdus] = useState<Row[]>([emptyEdu()]);
  const [jobs, setJobs] = useState<Row[]>([emptyJob()]);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setPageMeta(t({ en: 'Send your details for your CV', bn: 'আপনার CV-র তথ্য পাঠান' }), '', `/p/${code}`), [t, code]);
  useEffect(() => {
    void intakeInfo(code).then((r) => {
      if (!r.ok) return setBad(true);
      setPartner(r.value.partner);
      setSiteKey(r.value.siteKey);
    });
  }, [code]);
  useEffect(() => {
    if (!siteKey || !box.current) return;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => box.current && window.turnstile?.render(box.current, { sitekey: siteKey, callback: setToken });
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, [siteKey]);

  const set = (k: string) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const field = (k: string, label: B, o: { type?: string; ph?: string; area?: boolean } = {}) => (
    <label className="block">
      <span className="label">{t(label)}</span>
      {o.area
        ? <textarea className="field min-h-24" value={f[k] ?? ''} maxLength={1200} onChange={set(k)} placeholder={o.ph} />
        : <input className="field" type={o.type ?? 'text'} inputMode={o.type === 'tel' ? 'tel' : undefined} value={f[k] ?? ''} maxLength={160} onChange={set(k)} placeholder={o.ph} />}
    </label>
  );

  const setRow = (set: typeof setEdus, i: number, k: string, v: string) => set((rows) => rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const rowInput = (set: typeof setEdus, rows: Row[], i: number, k: string, label: B, o: { ph?: string; area?: boolean } = {}) => (
    <label className="block">
      <span className="label">{t(label)}</span>
      {o.area
        ? <textarea className="field min-h-24" value={rows[i][k] ?? ''} maxLength={1200} onChange={(e) => setRow(set, i, k, e.target.value)} />
        : <input className="field" value={rows[i][k] ?? ''} maxLength={160} placeholder={o.ph} onChange={(e) => setRow(set, i, k, e.target.value)} />}
    </label>
  );

  // Reads an old CV on this device (nothing is uploaded) and fills the form; the client checks it before sending.
  const importOld = async (file: File) => {
    setImporting(true);
    setImportMsg('');
    try {
      const { readCvFile, parseCv } = await import('../builder/importCv');
      const d: CvData = parseCv(await readCvFile(file)).data;
      setF((x) => ({
        ...x,
        name: x.name || d.name || '',
        phone: x.phone || d.phone || '',
        email: d.email || x.email || '',
        target: x.target || d.headline || '',
        skills: d.skills || x.skills || '',
        summary: d.summary || x.summary || '',
      }));
      if (d.education.length) setEdus(d.education.slice(0, 8).map((e) => ({ degree: [e.degree, e.major].filter(Boolean).join(' - '), institution: e.institution, year: e.year, result: e.result })));
      if (d.experience.length) setJobs(d.experience.slice(0, 10).map((j) => ({ role: j.role, org: j.org, period: joinPeriod(j.start, j.end, j.current), duties: j.bullets })));
      setImportMsg(t({ en: 'Done. Please check every box below and fix anything that is wrong.', bn: 'হয়েছে। নিচের প্রতিটি ঘর দেখে ভুল থাকলে ঠিক করুন।' }));
    } catch {
      setImportMsg(t({ en: 'We could not read this file. Please use a PDF or Word (.docx) file, or fill the form by hand.', bn: 'ফাইলটি পড়া যায়নি। PDF বা Word (.docx) ব্যবহার করুন, অথবা নিজে ফর্ম পূরণ করুন।' }));
    }
    setImporting(false);
  };

  const submit = async () => {
    setError('');
    if ((f.name ?? '').trim().length < 2 || !(f.phone ?? '').trim()) return setError(t(ERR.invalid));
    setBusy(true);
    const r = await intakeSubmit(code, { ...f, edus, jobs, photo, turnstile: token });
    setBusy(false);
    if (r.ok) setDone(true);
    else setError(t(ERR[r.error] ?? ERR.network));
  };

  if (bad) return <section className="wrap max-w-xl py-16"><p>{t({ en: 'This link is not valid.', bn: 'এই লিংকটি সঠিক নয়।' })}</p></section>;
  if (partner === null) return <section className="wrap max-w-xl py-16 text-muted">…</section>;
  if (done) {
    return (
      <section className="wrap max-w-xl py-16">
        <h1 className="text-3xl font-bold text-leaf">{t({ en: 'Thank you!', bn: 'ধন্যবাদ!' })}</h1>
        <p className="mt-3 text-lg">{t({ en: `Your details were sent to ${partner}. They will prepare your CV and contact you.`, bn: `আপনার তথ্য ${partner}-এর কাছে পাঠানো হয়েছে। তিনি আপনার CV বানিয়ে যোগাযোগ করবেন।` })}</p>
      </section>
    );
  }
  return (
    <section className="wrap max-w-xl py-8">
      <h1 className="text-3xl font-bold">{t({ en: 'Send your details for your CV', bn: 'আপনার CV-র তথ্য পাঠান' })}</h1>
      <p className="mt-2 text-muted">{t({ en: `${partner} will prepare your CV from this. Only your name and mobile number are required; fill what you can.`, bn: `${partner} এই তথ্য থেকে আপনার CV বানাবেন। শুধু নাম ও মোবাইল নম্বর আবশ্যক; যতটুকু পারেন দিন।` })}</p>
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border-2 border-dashed border-leaf/40 bg-leaf-soft/50 p-4">
          <p className="font-semibold">{t({ en: 'Already have a CV?', bn: 'আগের CV আছে?' })}</p>
          <p className="mt-1 text-sm text-muted">{t({ en: 'Upload it (PDF or Word) and we fill the form for you. The file is read on your phone and is not uploaded.', bn: 'PDF বা Word আপলোড করলে ফর্ম নিজে থেকে পূরণ হবে। ফাইলটি আপনার ফোনেই পড়া হয়, আপলোড হয় না।' })}</p>
          <label className={`btn btn-primary mt-3 cursor-pointer ${importing ? 'pointer-events-none opacity-60' : ''}`}>
            {importing ? '…' : t({ en: 'Choose my old CV', bn: 'আগের CV বাছুন' })}
            <input type="file" accept=".pdf,.docx,.txt" className="sr-only" onChange={(e) => { const x = e.target.files?.[0]; if (x) void importOld(x); e.target.value = ''; }} />
          </label>
          {importMsg && <p role="status" className="mt-3 text-sm font-semibold">{importMsg}</p>}
        </div>
        {field('name', { en: 'Full name *', bn: 'পুরো নাম *' })}
        {field('phone', { en: 'Mobile number *', bn: 'মোবাইল নম্বর *' }, { type: 'tel', ph: '01XXXXXXXXX' })}
        {field('target', { en: 'Job you want', bn: 'যে চাকরি চান' }, { ph: 'e.g. Bank Officer' })}
        <p className="pt-2 font-semibold">{t({ en: 'Education', bn: 'শিক্ষা' })}</p>
        {edus.map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-mist p-4">
            {edus.length > 1 && <p className="flex justify-between text-sm font-semibold"><span>#{i + 1}</span><button type="button" className="text-red-700 underline" onClick={() => setEdus((r) => r.filter((_, j) => j !== i))}>{t({ en: 'Remove', bn: 'বাদ দিন' })}</button></p>}
            {rowInput(setEdus, edus, i, 'degree', { en: 'Degree / exam', bn: 'ডিগ্রি / পরীক্ষা' }, { ph: 'BBA, HSC…' })}
            {rowInput(setEdus, edus, i, 'institution', { en: 'School / college / university', bn: 'প্রতিষ্ঠান' })}
            <div className="grid grid-cols-2 gap-3">
              {rowInput(setEdus, edus, i, 'year', { en: 'Passing year', bn: 'পাসের সাল' })}
              {rowInput(setEdus, edus, i, 'result', { en: 'Result (CGPA/GPA)', bn: 'রেজাল্ট' })}
            </div>
          </div>
        ))}
        {edus.length < 8 && <button type="button" className="btn btn-quiet bg-white" onClick={() => setEdus((r) => [...r, emptyEdu()])}>+ {t({ en: 'Add another education', bn: 'আরেকটি শিক্ষা যোগ করুন' })}</button>}
        <p className="pt-2 font-semibold">{t({ en: 'Work experience (if any)', bn: 'কাজের অভিজ্ঞতা (থাকলে)' })}</p>
        {jobs.map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-mist p-4">
            {jobs.length > 1 && <p className="flex justify-between text-sm font-semibold"><span>#{i + 1}</span><button type="button" className="text-red-700 underline" onClick={() => setJobs((r) => r.filter((_, j) => j !== i))}>{t({ en: 'Remove', bn: 'বাদ দিন' })}</button></p>}
            {rowInput(setJobs, jobs, i, 'role', { en: 'Job title', bn: 'পদবি' })}
            {rowInput(setJobs, jobs, i, 'org', { en: 'Company', bn: 'প্রতিষ্ঠান' })}
            {rowInput(setJobs, jobs, i, 'period', { en: 'From – to', bn: 'কবে থেকে কবে পর্যন্ত' }, { ph: '2022 – 2024' })}
            {rowInput(setJobs, jobs, i, 'duties', { en: 'What you did', bn: 'কী কাজ করেছেন' }, { area: true })}
          </div>
        ))}
        {jobs.length < 10 && <button type="button" className="btn btn-quiet bg-white" onClick={() => setJobs((r) => [...r, emptyJob()])}>+ {t({ en: 'Add another job', bn: 'আরেকটি চাকরি যোগ করুন' })}</button>}
        {field('skills', { en: 'Skills', bn: 'দক্ষতা' }, { ph: 'Excel, English, Driving…' })}
        <label className="block">
          <span className="label">{t({ en: 'Photo (optional)', bn: 'ছবি (ঐচ্ছিক)' })}</span>
          <input type="file" accept="image/*" className="field" onChange={async (e) => setPhoto(e.target.files?.[0] ? await smallPhoto(e.target.files[0]) : '')} />
          {photo && <img src={photo} alt="" className="mt-2 h-24 w-20 rounded object-cover" />}
        </label>
        {field('message', { en: 'Anything else (training, certificates, other details)', bn: 'আর কিছু (ট্রেনিং, সার্টিফিকেট, অন্য তথ্য)' }, { area: true })}
        <p className="rounded-lg bg-mist px-3 py-2 text-sm text-muted">{t({ en: 'Do not write NID or passport numbers here.', bn: 'এখানে NID বা পাসপোর্ট নম্বর লিখবেন না।' })}</p>
        {siteKey && <div ref={box} />}
        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">{error}</p>}
        <button type="button" className="btn btn-primary w-full !min-h-12" disabled={busy} onClick={() => void submit()}>{busy ? '…' : t({ en: 'Send my details', bn: 'আমার তথ্য পাঠান' })}</button>
      </div>
    </section>
  );
}
