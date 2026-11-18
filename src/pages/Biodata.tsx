import { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PageHead } from '../components/PageHead';
import { printCvIsolated } from '../builder/printIsolated';
import { emptyBiodata, type BiodataData } from '../biodata/model';
import { BiodataDocument, COLOURS, FREE_MAX_PAGES, PRO_MAX_PAGES, STYLES, printCss, type StyleId } from '../biodata/styles';
import { useAuth } from '../lib/auth';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

const KEY = 'hwg-biodata-v1';
const TITLE = 'Marriage Biodata Maker: Free Biodata for Marriage (PDF)';
const INTRO = 'Fill in the form, pick a style and colour, download a clean A4 PDF. Your details stay on your device.';

interface Saved { d: BiodataData; style: StyleId; colour: string }

function load(): Saved {
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

export function BiodataPage() {
  const { user } = useAuth();
  const pro = !!user?.pro;
  const [s, setS] = useState<Saved>(load);
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

  const download = async () => {
    track('biodata_export', { format: 'pdf', style: s.style });
    const html = `<style>${printCss}</style>` + renderToStaticMarkup(doc);
    await printCvIsolated(html, `${(d.name || 'My').replace(/\s+/g, '_')}_Biodata`);
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
                <div className="font-semibold">{x.name}</div><div className="text-sm text-muted">{x.note}</div>
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
          <button type="button" className="btn btn-primary" onClick={download}>Download PDF</button>
          {!pro && <p className="text-sm text-muted">Free: 2 styles, 3 colours, up to 2 pages, small herewegrow.pro line at the bottom.</p>}
        </div>
        <div className="no-print">
          <div className="sticky top-4 overflow-auto rounded-xl border border-line bg-mist p-3" aria-label="Preview">
            <div style={{ zoom: 0.55 }}>{doc}</div>
          </div>
        </div>
      </div>
    </>
  );
}
