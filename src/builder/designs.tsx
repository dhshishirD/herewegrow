import type { CSSProperties, ReactNode } from 'react';
import { LABELS, lines, list, type CvData, type DesignId, type HeadingLang } from './model';

// Three CV designs, each laid out on an A4 page (794 × 1123 px at 96 dpi).
// Sections follow the order the person chose. Text stays real text, so the PDF is readable by ATS software.

type Labels = Record<string, string>;

const PAGE: CSSProperties = {
  width: 794, minHeight: 1070, background: '#fff', color: '#1f2933',
  fontFamily: '"Inter Variable", "Hind Siliguri", Arial, sans-serif', fontSize: 12.5, lineHeight: 1.5,
};
const SERIF = '"Fraunces Variable", "Noto Serif Bengali Variable", Georgia, serif';
const GREY = '#52606d';

export const dates = (start: string, end: string, current: boolean, L: Labels) => [start, current ? L.present : end].filter(Boolean).join(' – ');

/** "MBA in Finance", "HSC (Business Studies)". */
export const degreeLine = (degree: string, major: string) => {
  if (!major) return degree;
  if (!degree) return major;
  return /^(s\.?\s?s\.?\s?c|h\.?\s?s\.?\s?c|dakhil|alim|o[\s-]?level|a[\s-]?level|diploma)/i.test(degree.trim()) ? `${degree} (${major})` : `${degree} in ${major}`;
};

function Details({ text }: { text: string }) {
  const items = lines(text);
  if (!items.length) return null;
  if (items.length === 1) return <p style={{ margin: '3px 0 0' }}>{items[0]}</p>;
  return (
    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyle: 'disc' }}>
      {items.map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
    </ul>
  );
}

export const contactLine = (d: CvData) => [d.phone, d.email, d.location, d.linkedin, d.website].filter(Boolean);

export function personalRows(d: CvData, L: Labels): [string, string][] {
  return ([
    [L.father, d.father], [L.mother, d.mother], [L.dob, d.dob], [L.gender, d.gender], [L.marital, d.marital],
    [L.nationality, d.nationality], [L.religion, d.religion], [L.nid, d.nid], [L.present_address, d.presentAddress], [L.permanent, d.permanentAddress],
  ] as [string, string][]).filter(([, v]) => v);
}

/* ── how each design draws a heading and an entry ─────────────── */

interface Theme {
  Title: (p: { children: ReactNode }) => ReactNode;
  /** One entry: title, a grey line under it, a date, and details. */
  Entry: (p: { title: ReactNode; sub?: string; date?: string; children?: ReactNode }) => ReactNode;
}

function Section({ k, d, L, T }: { k: string; d: CvData; L: Labels; T: Theme }) {
  if (d.hidden.includes(k)) return null;
  const { Title, Entry } = T;

  if (k === 'summary') return d.summary ? <section className="cv-section"><Title>{L.summary}</Title><p style={{ margin: 0 }}>{d.summary}</p></section> : null;

  if (k === 'experience' && d.experience.length)
    return (
      <section className="cv-section">
        <Title>{L.experience}</Title>
        {d.experience.map((e) => (
          <Entry key={e.id} title={e.role} sub={[e.org, e.location].filter(Boolean).join(', ')} date={dates(e.start, e.end, e.current, L)}>
            <Details text={e.bullets} />
          </Entry>
        ))}
      </section>
    );

  if (k === 'education' && d.education.length)
    return (
      <section className="cv-section">
        <Title>{L.education}</Title>
        {d.education.map((e) => (
          <Entry key={e.id} title={degreeLine(e.degree, e.major)} sub={[e.institution, e.result].filter(Boolean).join(', ')} date={e.year}>
            <Details text={e.details} />
          </Entry>
        ))}
      </section>
    );

  if (k === 'skills' && (d.skills || d.languages))
    return (
      <section className="cv-section">
        <Title>{L.skills}</Title>
        {d.skills && <p style={{ margin: 0 }}>{list(d.skills).join(', ')}</p>}
        {d.languages && <p style={{ margin: '4px 0 0' }}><strong>{L.languages}:</strong> {d.languages}</p>}
      </section>
    );

  if (k === 'training' && d.training.length)
    return (
      <section className="cv-section">
        <Title>{L.training}</Title>
        {d.training.map((t) => (
          <Entry key={t.id} title={t.name} sub={[t.org, t.duration].filter(Boolean).join(', ')} date={t.year}>
            <Details text={t.details} />
          </Entry>
        ))}
      </section>
    );

  if (k.startsWith('custom:')) {
    const c = d.custom.find((x) => `custom:${x.id}` === k);
    if (!c || !c.items.some((i) => i.title || i.details)) return null;
    return (
      <section className="cv-section">
        <Title>{c.title}</Title>
        {c.items.map((i) => (
          <Entry key={i.id} title={i.title} sub={i.subtitle} date={i.date}>
            <Details text={i.details} />
          </Entry>
        ))}
      </section>
    );
  }

  if (k === 'personal' && d.showPersonal) {
    const rows = personalRows(d, L);
    if (!rows.length) return null;
    return (
      <section className="cv-section">
        <Title>{L.personal}</Title>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(([a, b]) => (
              <tr key={a}>
                <td style={{ padding: '1px 18px 1px 0', color: GREY, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{a}</td>
                <td style={{ padding: '1px 0' }}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  if (k === 'references' && d.references.length)
    return (
      <section className="cv-section">
        <Title>{L.references}</Title>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {d.references.map((r) => (
            <div key={r.id} className="cv-ref">
              <strong>{r.name}</strong>
              {r.title && <div>{r.title}</div>}
              {r.org && <div>{r.org}</div>}
              {(r.phone || r.email) && <div style={{ color: GREY }}>{[r.phone, r.email].filter(Boolean).join(', ')}</div>}
              {r.relation && <div style={{ color: GREY, fontStyle: 'italic' }}>{r.relation}</div>}
            </div>
          ))}
        </div>
      </section>
    );

  return null;
}

/* ── Classic: one column, ATS-safe ───────────────────────────── */

function Classic({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, margin: '16px 0 8px' }}>{children}</h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <strong>{title}</strong>
          {date && <span style={{ color: GREY, whiteSpace: 'nowrap' }}>{date}</span>}
        </div>
        {sub && <div style={{ color: GREY }}>{sub}</div>}
        {children}
      </div>
    ),
  };
  return (
    <div className="cv-page" style={{ ...PAGE, padding: '46px 56px' }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 650, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '2px 0 0', fontSize: 14, color: accent, fontWeight: 600 }}>{d.headline}</p>}
        <p style={{ margin: '6px 0 0', color: GREY }}>{contactLine(d).join('  |  ')}</p>
      </header>
      {d.order.map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
    </div>
  );
}

/* ── Modern: coloured sidebar with photo ─────────────────────── */

function Modern({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const Side = ({ children }: { children: ReactNode }) => (
    <h2 style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '22px 0 8px', opacity: 0.9 }}>{children}</h2>
  );
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 650, color: accent, margin: '20px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 18, height: 3, background: accent, display: 'inline-block', borderRadius: 2 }} />{children}
      </h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 11 }}>
        <strong style={{ fontSize: 13.5 }}>{title}</strong>
        {(sub || date) && <div style={{ color: GREY }}>{[sub, date].filter(Boolean).join('  ·  ')}</div>}
        {children}
      </div>
    ),
  };
  const showSkills = !d.hidden.includes('skills');
  return (
    <div className="cv-page" style={{ ...PAGE, display: 'grid', gridTemplateColumns: '250px 1fr' }}>
      <aside style={{ background: accent, color: '#fff', padding: '40px 26px' }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 8px', border: '4px solid rgba(255,255,255,.35)' }} />}
        <Side>{L.contact}</Side>
        {contactLine(d).map((c) => <p key={c} style={{ margin: '0 0 5px', wordBreak: 'break-word' }}>{c}</p>)}
        {showSkills && d.skills && (<><Side>{L.skills}</Side><ul style={{ margin: 0, paddingLeft: 16, listStyle: 'disc' }}>{list(d.skills).map((s) => <li key={s} style={{ marginBottom: 3 }}>{s}</li>)}</ul></>)}
        {showSkills && d.languages && (<><Side>{L.languages}</Side><p style={{ margin: 0 }}>{d.languages}</p></>)}
      </aside>
      <main style={{ padding: '44px 40px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 31, fontWeight: 700, margin: 0, color: '#111827', lineHeight: 1.1 }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '6px 0 0', fontSize: 15, color: accent, fontWeight: 600 }}>{d.headline}</p>}
        {!d.hidden.includes('summary') && d.summary && <p style={{ margin: '14px 0 0', color: '#374151' }}>{d.summary}</p>}
        {d.order.filter((k) => k !== 'summary' && k !== 'skills').map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
      </main>
    </div>
  );
}

/* ── Executive: serif name, top band, dates in a left column ─── */

function Executive({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => <h2 className="cv-title" style={{ fontFamily: SERIF, fontSize: 16.5, fontWeight: 600, color: accent, margin: '18px 0 7px' }}>{children}</h2>,
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ display: 'grid', gridTemplateColumns: '128px 1fr', gap: 16, marginBottom: 9 }}>
        <div style={{ color: GREY }}>{date}</div>
        <div><strong>{title}</strong>{sub && <div style={{ color: GREY }}>{sub}</div>}{children}</div>
      </div>
    ),
  };
  return (
    <div className="cv-page" style={PAGE}>
      <header style={{ borderTop: `10px solid ${accent}`, padding: '34px 56px 18px', display: 'flex', gap: 24, alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 96, height: 112, objectFit: 'cover', borderRadius: 6 }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
          {d.headline && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151', letterSpacing: '0.02em' }}>{d.headline}</p>}
          <p style={{ margin: '8px 0 0', color: GREY }}>{contactLine(d).join('   ·   ')}</p>
        </div>
      </header>
      <div style={{ padding: '6px 56px 40px' }}>
        {d.order.map((k) => <Section key={k} k={k} d={d} L={{ ...L, summary: L.profile }} T={T} />)}
      </div>
    </div>
  );
}

export const DESIGNS: { id: DesignId; name: { en: string; bn: string }; note: { en: string; bn: string } }[] = [
  { id: 'classic', name: { en: 'Classic (ATS)', bn: 'ক্লাসিক (ATS)' }, note: { en: 'Best for online job portals', bn: 'অনলাইন জব পোর্টালের জন্য সেরা' } },
  { id: 'modern', name: { en: 'Modern', bn: 'মডার্ন' }, note: { en: 'Colour sidebar and photo', bn: 'রঙিন সাইডবার ও ছবি' } },
  { id: 'executive', name: { en: 'Executive', bn: 'এক্সিকিউটিভ' }, note: { en: 'For senior roles', bn: 'সিনিয়র পদের জন্য' } },
];

export function CvDocument({ d, design, accent, headings = 'en' }: { d: CvData; design: DesignId; accent: string; headings?: HeadingLang }) {
  const L = LABELS[headings];
  if (design === 'modern') return <Modern d={d} accent={accent} L={L} />;
  if (design === 'executive') return <Executive d={d} accent={accent} L={L} />;
  return <Classic d={d} accent={accent} L={L} />;
}
