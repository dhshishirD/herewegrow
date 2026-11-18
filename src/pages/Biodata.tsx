import { BIODATA_MAKER } from '../../shared/biodataStyles';
import { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PageHead } from '../components/PageHead';
import { printCvIsolated } from '../builder/printIsolated';
import { emptyBiodata, type BiodataData } from '../biodata/model';
import { BiodataDocument, COLOURS, FREE_COLOURS, FREE_MAX_PAGES, PRO_MAX_PAGES, STYLES, needsPro, printCss, type StyleId } from '../biodata/styles';
import { ProGate } from '../components/ProGate';
import { useAuth } from '../lib/auth';
import { BIODATA_PACK } from '../../shared/biodataPack';
import { goToPayment } from '../lib/paymentStart';
import { tracker } from '../lib/track';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

const KEY = 'hwg-biodata-v1';
const TITLE = BIODATA_MAKER.title;
const INTRO = BIODATA_MAKER.description;

interface Saved { d: BiodataData; style: StyleId; colour: string }

function load(): Saved {
  const q = new URLSearchParams(typeof location === 'undefined' ? '' : location.search);
  const fromUrl = STYLES.find((x) => x.id === q.get('style'))?.id;
  const base = loadSaved();
  return fromUrl ? { ...base, style: fromUrl } : base;
}

function loadSaved(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Saved | null;
    if (s?.d) return { d: { ...emptyBiodata(), ...s.d }, style: s.style ?? 'classic-serif', colour: s.colour ?? 'navy' };
  } catch { /* private mode or bad data */ }
  return { d: emptyBiodata(), style: 'classic-serif', colour: 'navy' };
}

type TextKey = Exclude<keyof BiodataData, 'education' | 'photo'>;
const GROUPS: { title: string; fields: [TextKey, string, boolean?][] }[] = [
  { title: 'Personal', fields: [['name', 'Full name'], ['dob', 'Date of birth'], ['age', 'Age'], ['height', 'Height'], ['weight', 'Weight'], ['complexion', 'Complexion'], ['bloodGroup', 'Blood group'], ['religion', 'Religion'], ['maritalStatus', 'Marital status']] },
  { title: 'Profession', fields: [['occupation', 'Occupation'], ['employer', 'Workplace']] },
  { title: 'Family', fields: [['father', "Father's name"], ['fatherOcc', "Father's occupation"], ['mother', "Mother's name"], ['motherOcc', "Mother's occupation"], ['brothers', 'Brothers'], ['sisters', 'Sisters'], ['familyType', 'Family type']] },
  { title: 'Address', fields: [['presentAddress', 'Present address'], ['permanentAddress', 'Permanent address']] },
  { title: 'About and expectations', fields: [['about', 'About me', true], ['expectations', 'Partner expectations', true]] },
  { title: 'Contact (guardian)', fields: [['guardianName', 'Guardian name'], ['guardianRelation', 'Relation'], ['phone', 'Phone'], ['email', 'Email']] },
];

const BIO_PERKS = [
  { en: 'All 10 biodata designs and all 10 colours', bn: 'সব ১০টি বায়োডাটা ডিজাইন ও ১০টি রং' },
  { en: 'Up to 3 pages, no HereWeGrow line', bn: '৩ পৃষ্ঠা পর্যন্ত, HereWeGrow লেখা ছাড়া' },
  { en: 'Word and PNG downloads', bn: 'Word ও PNG ডাউনলোড' },
  { en: 'Any Pro pass also unlocks everything here, plus every CV design', bn: 'যেকোনো প্রো পাসেও এসব আনলক, সঙ্গে সব সিভি ডিজাইন' },
];

export function BiodataPage() {
  const { user, openLogin } = useAuth();
  // Any Pro pass or the Clean pack unlocks everything
  const pro = !!user?.pro || !!user?.biodataPack;
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [s, setS] = useState<Saved>(load);
  const [gate, setGate] = useState(false);
  const { d } = s;
  const colour = COLOURS.find((c) => c.id === s.colour) ?? COLOURS[0];

  useEffect(() => setPageMeta(TITLE, INTRO, '/biodata'), []);
  useEffect(() => { track('biodata_open'); }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full */ } }, [s]);

  const set = (patch: Partial<BiodataData>) => setS((p) => ({ ...p, d: { ...p.d, ...patch } }));
  const maxPages = pro ? PRO_MAX_PAGES : FREE_MAX_PAGES;
  const doc = useMemo(() => <BiodataDocument d={d} style={s.style} colour={colour} maxPages={maxPages} footer={!pro} />, [d, s.style, colour, maxPages, pro]);

  const onPhoto = (f: File | undefined) => {
    if (!f || !f.type.startsWith('image/') || f.size > 3_000_000) return;
    const r = new FileReader();
    r.onload = () => set({ photo: String(r.result) });
    r.readAsDataURL(f);
  };

  const print = async (el: typeof doc) => {
    const html = `<style>${printCss}</style>` + renderToStaticMarkup(el);
    await printCvIsolated(html, `${(d.name || 'My').replace(/\s+/g, '_')}_Biodata`);
  };
  const download = async () => {
    if (!pro && needsPro(s.style, s.colour)) { track('paywall_view', { source: 'biodata', style: s.style, colour: s.colour }); setGate(true); return; }
    track('biodata_export', { format: 'pdf', style: s.style });
    await print(doc);
  };
  const buyPack = async () => {
    setBuyError('');
    if (!user) { setGate(false); openLogin(); return; }
    setBuying(true);
    track('checkout_click', { product: BIODATA_PACK.id });
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: BIODATA_PACK.id, lang: 'en', vid: tracker.vid() }) });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; paymentUrl?: string; error?: string };
      if (d.ok && d.paymentUrl) { goToPayment(d.paymentUrl, BIODATA_PACK.id); return; }
      if (d.error === 'login') { setGate(false); openLogin(); } else setBuyError('Could not start the payment. Please try again.');
    } catch { setBuyError('Could not start the payment. Please try again.'); }
    setBuying(false);
  };
  const fileBase = () => `${(d.name || 'My').replace(/\s+/g, '_')}_Biodata`;
  /** Word and PNG are part of the paid pack; free users see the same paywall as a paid style. */
  const downloadWord = async () => {
    if (!pro) { track('paywall_view', { source: 'biodata_word' }); setGate(true); return; }
    track('biodata_export', { format: 'docx', style: s.style });
    const { buildBiodataDocx } = await import('../biodata/word');
    const { saveBlob } = await import('../biodata/png');
    saveBlob(await buildBiodataDocx(d, colour, { footer: false }), `${fileBase()}.docx`);
  };
  const downloadPng = async () => {
    if (!pro) { track('paywall_view', { source: 'biodata_png' }); setGate(true); return; }
    track('biodata_export', { format: 'png', style: s.style });
    const { pageMarkups, pageToPng, saveBlob } = await import('../biodata/png');
    const pages = pageMarkups(renderToStaticMarkup(doc));
    for (let i = 0; i < pages.length; i++) saveBlob(await pageToPng(pages[i]), `${fileBase()}_page-${i + 1}.png`);
  };
  const useFree = async () => {
    setGate(false);
    setS((p) => ({ ...p, style: STYLES.find((x) => x.id === p.style)?.free ? p.style : 'classic-serif', colour: FREE_COLOURS.includes(p.colour) ? p.colour : 'navy' }));
    const st = STYLES.find((x) => x.id === s.style)?.free ? s.style : 'classic-serif';
    const co = COLOURS.find((c) => c.id === (FREE_COLOURS.includes(s.colour) ? s.colour : 'navy')) ?? COLOURS[0];
    track('biodata_export', { format: 'pdf', style: st });
    await print(<BiodataDocument d={d} style={st} colour={co} maxPages={FREE_MAX_PAGES} footer />);
  };

  return (
    <>
      <PageHead crumbs={[{ href: '/biodata', label: { en: 'Marriage biodata', bn: 'বিয়ের বায়োডাটা' } }]} title="Marriage Biodata Maker" intro={INTRO} />
      <div className="wrap grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="no-print space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {STYLES.map((x) => (
              <button key={x.id} type="button" aria-pressed={s.style === x.id} onClick={() => setS((p) => ({ ...p, style: x.id }))}
                className={`rounded-xl border-2 p-3 text-left ${s.style === x.id ? 'border-leaf' : 'border-line'}`}>
                <div className="font-semibold">{x.name} <span className="text-xs font-normal text-muted">{x.group}{x.free ? ' · Free' : ' · Clean pack'}</span></div><div className="text-sm text-muted">{x.note}</div>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Colour">
            {COLOURS.map((c) => (
              <button key={c.id} type="button" aria-pressed={s.colour === c.id} onClick={() => setS((p) => ({ ...p, colour: c.id }))}
                className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm ${s.colour === c.id ? 'border-leaf' : 'border-line'}`}>
                <span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${c.main} 50%, ${c.tint} 50%)` }} />{c.name}
              </button>
            ))}
          </div>
          <label className="block text-sm font-semibold">Photo (optional)
            <input type="file" accept="image/*" className="field mt-1" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {GROUPS.map((g) => (
            <fieldset key={g.title} className="space-y-3">
              <legend className="mb-1 text-lg font-semibold">{g.title}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {g.fields.map(([k, label, long]) => (
                  <label key={k} className={`block text-sm ${long ? 'sm:col-span-2' : ''}`}>{label}
                    {long
                      ? <textarea className="field mt-1 min-h-24" value={d[k]} onChange={(e) => set({ [k]: e.target.value })} />
                      : <input className="field mt-1" value={d[k]} onChange={(e) => set({ [k]: e.target.value })} />}
                  </label>
                ))}
              </div>
              {g.title === 'Personal' && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Education</div>
                  {d.education.map((e, i) => (
                    <div key={e.id} className="grid gap-2 sm:grid-cols-3">
                      {(['degree', 'institution', 'year'] as const).map((f) => (
                        <input key={f} className="field" placeholder={f[0].toUpperCase() + f.slice(1)} value={e[f]}
                          onChange={(ev) => set({ education: d.education.map((x, j) => (j === i ? { ...x, [f]: ev.target.value } : x)) })} />
                      ))}
                    </div>
                  ))}
                  <button type="button" className="btn btn-quiet" onClick={() => set({ education: [...d.education, { id: 'e' + Date.now(), degree: '', institution: '', year: '' }] })}>Add education</button>
                </div>
              )}
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={download}>Download PDF</button>
            <button type="button" className="btn btn-quiet" onClick={downloadWord}>Download Word{pro ? '' : ' (Clean pack)'}</button>
            <button type="button" className="btn btn-quiet" onClick={downloadPng}>Download PNG{pro ? '' : ' (Clean pack)'}</button>
          </div>
          {!pro && <p className="text-sm text-muted">Free download: PDF in Classic Serif or Minimal Clean, Navy, Emerald or Charcoal, up to 2 pages, with a small herewegrow.pro line. The Clean pack (৳49) or any Pro pass adds all 10 styles and colours, 3 pages, no line, plus Word and PNG.</p>}
        </div>
        <div className="no-print">
          <div className="sticky top-4 overflow-auto rounded-xl border border-line bg-mist p-3" aria-label="Preview">
            <div style={{ zoom: 0.55 }}>{doc}</div>
          </div>
        </div>
      </div>
      {gate && <ProGate secondary={{ label: { en: `Buy the Clean pack for ${BIODATA_PACK.price} taka`, bn: `ক্লিন প্যাক কিনুন ${BIODATA_PACK.price} টাকায়` }, onClick: buyPack, busy: buying, error: buyError }} perks={BIO_PERKS} useFreeLabel={{ en: 'Download free with a free design', bn: 'ফ্রি ডিজাইনে ফ্রি ডাউনলোড করুন' }} designName={{ en: STYLES.find((x) => x.id === s.style)?.name ?? '', bn: STYLES.find((x) => x.id === s.style)?.name ?? '' }} onClose={() => setGate(false)} onUseFree={useFree} />}
    </>
  );
}
