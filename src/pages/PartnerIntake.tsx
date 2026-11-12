// The client's own page (/p/<code>): no login. They fill a simple form and the details land in their CV maker's folder.
import { useEffect, useRef, useState } from 'react';
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

  const submit = async () => {
    setError('');
    if ((f.name ?? '').trim().length < 2 || !(f.phone ?? '').trim()) return setError(t(ERR.invalid));
    setBusy(true);
    const r = await intakeSubmit(code, { ...f, photo, turnstile: token });
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
        {field('name', { en: 'Full name *', bn: 'পুরো নাম *' })}
        {field('phone', { en: 'Mobile number *', bn: 'মোবাইল নম্বর *' }, { type: 'tel', ph: '01XXXXXXXXX' })}
        {field('target', { en: 'Job you want', bn: 'যে চাকরি চান' }, { ph: 'e.g. Bank Officer' })}
        <p className="pt-2 font-semibold">{t({ en: 'Education (latest)', bn: 'শিক্ষা (সর্বশেষ)' })}</p>
        {field('degree', { en: 'Degree / exam', bn: 'ডিগ্রি / পরীক্ষা' }, { ph: 'BBA, HSC…' })}
        {field('institution', { en: 'School / college / university', bn: 'প্রতিষ্ঠান' })}
        <div className="grid grid-cols-2 gap-3">
          {field('year', { en: 'Passing year', bn: 'পাসের সাল' })}
          {field('result', { en: 'Result (CGPA/GPA)', bn: 'রেজাল্ট' })}
        </div>
        <p className="pt-2 font-semibold">{t({ en: 'Work experience (latest, if any)', bn: 'কাজের অভিজ্ঞতা (সর্বশেষ, থাকলে)' })}</p>
        {field('role', { en: 'Job title', bn: 'পদবি' })}
        {field('org', { en: 'Company', bn: 'প্রতিষ্ঠান' })}
        {field('period', { en: 'From – to', bn: 'কবে থেকে কবে পর্যন্ত' }, { ph: '2022 – 2024' })}
        {field('duties', { en: 'What you did', bn: 'কী কাজ করেছেন' }, { area: true })}
        {field('skills', { en: 'Skills', bn: 'দক্ষতা' }, { ph: 'Excel, English, Driving…' })}
        <label className="block">
          <span className="label">{t({ en: 'Photo (optional)', bn: 'ছবি (ঐচ্ছিক)' })}</span>
          <input type="file" accept="image/*" className="field" onChange={async (e) => setPhoto(e.target.files?.[0] ? await smallPhoto(e.target.files[0]) : '')} />
          {photo && <img src={photo} alt="" className="mt-2 h-24 w-20 rounded object-cover" />}
        </label>
        {field('message', { en: 'Anything else', bn: 'আর কিছু জানাতে চান?' }, { area: true })}
        <p className="rounded-lg bg-mist px-3 py-2 text-sm text-muted">{t({ en: 'Do not write NID or passport numbers here.', bn: 'এখানে NID বা পাসপোর্ট নম্বর লিখবেন না।' })}</p>
        {siteKey && <div ref={box} />}
        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">{error}</p>}
        <button type="button" className="btn btn-primary w-full !min-h-12" disabled={busy} onClick={() => void submit()}>{busy ? '…' : t({ en: 'Send my details', bn: 'আমার তথ্য পাঠান' })}</button>
      </div>
    </section>
  );
}
