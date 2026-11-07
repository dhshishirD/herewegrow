import type { CSSProperties, ReactNode } from 'react';
import { DESIGN_LIST } from '../../shared/designList';
import { findFont } from './fonts';
import { DEFAULT_MARGINS, LABELS, clampMargin, lines, list, type CvData, type DesignId, type HeadingLang, type Margins } from './model';

// CV designs, each laid out on an A4 page (794 × 1123 px at 96 dpi).
// Sections follow the order the person chose. Text stays real text, so the PDF is readable by ATS software.
// Class names (cv-page, cv-pad, cv-entry, cv-title, cv-keep) are hooks for the print rules in index.css:
// padding repeats on every printed page, and entries and headings are never split across a page break.

type Labels = Record<string, string>;

const PAGE: CSSProperties = {
  width: 794, minHeight: 1123, background: '#fff', color: '#1f2933',
  fontFamily: 'var(--cv-font, "Inter Variable", "Hind Siliguri", Arial, sans-serif)', fontSize: 12.5, lineHeight: 1.5,
};
// Page margins: every side padding below is written as mx(px) or my(px), scaled by --cvx / --cvy set in CvDocument.
// 1 means the design's own spacing, so nothing changes until the person picks a margin.
const mx = (px: number) => `calc(${px}px * var(--cvx, 1))`;
const my = (px: number) => `calc(${px}px * var(--cvy, 1))`;
// The person's font choice (CvDocument sets --cv-font / --cv-head); unset keeps the design's own pairing
const SERIF = 'var(--cv-head, "Fraunces Variable", "Noto Serif Bengali Variable", Georgia, serif)';
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

  if (k === 'summary') return d.summary ? <section><Title>{L.summary}</Title><p style={{ margin: 0 }}>{d.summary}</p></section> : null;

  if (k === 'experience' && d.experience.length)
    return (
      <section>
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
      <section>
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
      <section>
        <Title>{L.skills}</Title>
        {d.skills && <p style={{ margin: 0 }}>{list(d.skills).join(', ')}</p>}
        {d.languages && <p style={{ margin: '4px 0 0' }}><strong>{L.languages}:</strong> {d.languages}</p>}
      </section>
    );

  if (k === 'training' && d.training.length)
    return (
      <section>
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
      <section>
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
      <section>
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
      <section>
        <Title>{L.references}</Title>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {d.references.map((r) => (
            <div key={r.id}>
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
    <div className="cv-page cv-pad" style={{ ...PAGE, padding: `${my(46)} ${mx(56)}` }}>
      <header className="cv-keep" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 650, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '2px 0 0', fontSize: 14, color: accent, fontWeight: 600 }}>{d.headline}</p>}
        <p style={{ margin: '6px 0 0', color: GREY }}>{contactLine(d).join('  |  ')}</p>
      </header>
      {d.order.map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
    </div>
  );
}

/* ── Modern: coloured sidebar with photo ─────────────────────── */

function Modern({ d, accent, L, side }: { d: CvData; accent: string; L: Labels; side?: string }) {
  const Side = ({ children }: { children: ReactNode }) => (
    <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '22px 0 8px', opacity: 0.9 }}>{children}</h2>
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
  const personal = d.showPersonal ? personalRows(d, L) : [];
  const showPersonal = !d.hidden.includes('personal') && personal.length > 0;
  const showRefs = !d.hidden.includes('references') && d.references.length > 0;
  return (
    <div className="cv-page" style={{ ...PAGE, display: 'grid', gridTemplateColumns: '250px 1fr' }}>
      {/* Print only: repeats on every page so the sidebar colour runs top to bottom on page 2 as well */}
      <div className="cv-sidebar-bg" style={{ background: side ?? accent, width: 250 }} />
      <aside className="cv-pad" style={{ background: side ?? accent, color: '#fff', padding: `${my(40)} 26px`, position: 'relative', zIndex: 1 }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 8px', border: '4px solid rgba(255,255,255,.35)' }} />}
        <Side>{L.contact}</Side>
        {contactLine(d).map((c) => <p key={c} style={{ margin: '0 0 5px', wordBreak: 'break-word' }}>{c}</p>)}
        {showSkills && d.skills && (<><Side>{L.skills}</Side><ul style={{ margin: 0, paddingLeft: 16, listStyle: 'disc' }}>{list(d.skills).map((s) => <li key={s} style={{ marginBottom: 3 }}>{s}</li>)}</ul></>)}
        {showSkills && d.languages && (<><Side>{L.languages}</Side><p style={{ margin: 0 }}>{d.languages}</p></>)}
        {/* Short sections go in the sidebar too, so the main column is shorter and the sidebar is not empty */}
        {showPersonal && (<><Side>{L.personal}</Side>{personal.map(([a, b]) => <p key={a} style={{ margin: '0 0 6px' }}><span style={{ opacity: 0.75, fontSize: 11 }}>{a}</span><br />{b}</p>)}</>)}
        {showRefs && (<><Side>{L.references}</Side>{d.references.map((r) => (
          <p key={r.id} style={{ margin: '0 0 10px', wordBreak: 'break-word' }}>
            <strong>{r.name}</strong>{[r.title, r.org].filter(Boolean).map((x) => <span key={x}><br />{x}</span>)}
            {(r.phone || r.email) && <span style={{ opacity: 0.85 }}><br />{[r.phone, r.email].filter(Boolean).join(', ')}</span>}
          </p>
        ))}</>)}
      </aside>
      <main className="cv-pad" style={{ padding: `${my(44)} ${mx(40)}` }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 31, fontWeight: 700, margin: 0, color: '#111827', lineHeight: 1.1 }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '6px 0 0', fontSize: 15, color: accent, fontWeight: 600 }}>{d.headline}</p>}
        {!d.hidden.includes('summary') && d.summary && <p style={{ margin: '14px 0 0', color: '#374151' }}>{d.summary}</p>}
        {d.order.filter((k) => !['summary', 'skills', 'personal', 'references'].includes(k)).map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
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
      <header className="cv-keep" style={{ borderTop: `10px solid ${accent}`, padding: `${my(34)} ${mx(56)} 18px`, display: 'flex', gap: 24, alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 96, height: 112, objectFit: 'cover', borderRadius: 6 }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
          {d.headline && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151', letterSpacing: '0.02em' }}>{d.headline}</p>}
          <p style={{ margin: '8px 0 0', color: GREY }}>{contactLine(d).join('   ·   ')}</p>
        </div>
      </header>
      {/* 40px top padding repeats on later pages; the -34px margin keeps the first page's gap at 6px */}
      <div className="cv-pad" style={{ padding: `${my(40)} ${mx(56)}`, marginTop: `calc(6px - ${my(40)})` }}>
        {d.order.map((k) => <Section key={k} k={k} d={d} L={{ ...L, summary: L.profile }} T={T} />)}
      </div>
    </div>
  );
}

/* ── Elegant (Pro): colour header band, spaced headings, dates in a pill ── */

function Elegant({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, margin: '20px 0 9px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {children}<span style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${accent}33` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <strong style={{ fontSize: 13.5 }}>{title}</strong>
          {date && <span style={{ color: accent, background: `${accent}14`, borderRadius: 999, padding: '0 9px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{date}</span>}
        </div>
        {sub && <div style={{ color: GREY }}>{sub}</div>}
        {children}
      </div>
    ),
  };
  return (
    <div className="cv-page" style={PAGE}>
      <header className="cv-keep" style={{ background: accent, color: '#fff', padding: `${my(38)} ${mx(56)} 30px`, display: 'flex', gap: 26, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, margin: 0, lineHeight: 1.1, letterSpacing: '0.01em' }}>{d.name || 'Your Name'}</h1>
          {d.headline && <p style={{ margin: '6px 0 0', fontSize: 14.5, opacity: 0.92, letterSpacing: '0.04em' }}>{d.headline}</p>}
          <p style={{ margin: '12px 0 0', fontSize: 12, opacity: 0.88 }}>{contactLine(d).join('   ·   ')}</p>
        </div>
        {d.photo && <img src={d.photo} alt="" style={{ width: 112, height: 112, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,.4)' }} />}
      </header>
      <div className="cv-pad" style={{ padding: `14px ${mx(56)} ${my(40)}` }}>
        {d.order.map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
      </div>
    </div>
  );
}

/* ── Minimal (Pro): labels in a narrow left column, lots of white space ── */

function Minimal({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, margin: 0, paddingTop: 2 }}>{children}</h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <strong style={{ fontSize: 13.5, color: '#111827' }}>{title}</strong>
          {date && <span style={{ color: GREY, fontSize: 11.5, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{date}</span>}
        </div>
        {sub && <div style={{ color: GREY }}>{sub}</div>}
        {children}
      </div>
    ),
  };
  // Each section becomes a two-column row: label on the left, content on the right,
  // so the section draws no heading of its own.
  const { Title } = T;
  const RowTheme: Theme = { ...T, Title: () => null };
  return (
    <div className="cv-page cv-pad" style={{ ...PAGE, padding: `${my(56)} ${mx(60)} ${my(44)}` }}>
      <header className="cv-keep" style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: 'inherit', fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: 0, color: '#111827', lineHeight: 1.05 }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '8px 0 0', fontSize: 14, color: accent, fontWeight: 600, letterSpacing: '0.02em' }}>{d.headline}</p>}
        <p style={{ margin: '12px 0 0', color: GREY, fontSize: 12 }}>{contactLine(d).join('   /   ')}</p>
      </header>
      {d.order.map((k) => {
        if (d.hidden.includes(k)) return null;
        const label = k.startsWith('custom:') ? d.custom.find((x) => `custom:${x.id}` === k)?.title : k === 'summary' ? L.profile : L[k];
        return (
          <MinimalRow key={k} label={<Title>{label}</Title>}>
            <Section k={k} d={d} L={L} T={RowTheme} />
          </MinimalRow>
        );
      })}
    </div>
  );
}

/** A row with an empty body is hidden by CSS (.cv-minimal-row:has(...:empty)). */
function MinimalRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="cv-minimal-row" style={{ display: 'grid', gridTemplateColumns: '132px 1fr', gap: 24, borderTop: '1px solid #e5e7eb', padding: '14px 0 4px' }}>
      <div>{label}</div>
      <div className="cv-minimal-body">{children}</div>
    </div>
  );
}

/* ── Timeline (Pro): entries hang off a vertical line with dots ─────────── */

function Timeline({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 650, color: '#111827', margin: '22px 0 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: accent, display: 'inline-block' }} />{children}
      </h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ position: 'relative', margin: '0 0 0 10px', padding: '0 0 12px 22px', borderLeft: `2px solid ${accent}30` }}>
        <span style={{ position: 'absolute', left: -7, top: 3, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: `3px solid ${accent}` }} />
        {date && <div style={{ color: accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{date}</div>}
        <strong style={{ fontSize: 13.5 }}>{title}</strong>
        {sub && <div style={{ color: GREY }}>{sub}</div>}
        {children}
      </div>
    ),
  };
  return (
    <div className="cv-page cv-pad" style={{ ...PAGE, padding: `${my(44)} ${mx(54)}` }}>
      <header className="cv-keep" style={{ display: 'flex', gap: 22, alignItems: 'center', paddingBottom: 18, borderBottom: `3px solid ${accent}` }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 96, height: 96, borderRadius: 18, objectFit: 'cover' }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 650, margin: 0, color: '#111827', lineHeight: 1.1 }}>{d.name || 'Your Name'}</h1>
          {d.headline && <p style={{ margin: '5px 0 0', fontSize: 14.5, color: accent, fontWeight: 600 }}>{d.headline}</p>}
          <p style={{ margin: '8px 0 0', color: GREY }}>{contactLine(d).join('   ·   ')}</p>
        </div>
      </header>
      {d.order.map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
    </div>
  );
}

/* ── Corporate (Pro): soft tinted sidebar, dark text, square photo ──────── */

function Corporate({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const tint = `${accent}12`;
  const Side = ({ children }: { children: ReactNode }) => (
    <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, margin: '20px 0 8px', paddingBottom: 4, borderBottom: `1px solid ${accent}40` }}>{children}</h2>
  );
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#111827', margin: '20px 0 9px', paddingLeft: 10, borderLeft: `4px solid ${accent}` }}>{children}</h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <strong style={{ fontSize: 13.5 }}>{title}</strong>
          {date && <span style={{ color: GREY, fontSize: 11.5, whiteSpace: 'nowrap' }}>{date}</span>}
        </div>
        {sub && <div style={{ color: accent, fontWeight: 600, fontSize: 12 }}>{sub}</div>}
        {children}
      </div>
    ),
  };
  const showSkills = !d.hidden.includes('skills');
  const personal = d.showPersonal ? personalRows(d, L) : [];
  const showPersonal = !d.hidden.includes('personal') && personal.length > 0;
  return (
    <div className="cv-page" style={{ ...PAGE, display: 'grid', gridTemplateColumns: '1fr 236px' }}>
      <div className="cv-sidebar-bg cv-sidebar-right" style={{ background: tint, width: 236 }} />
      <main className="cv-pad" style={{ padding: `${my(46)} ${mx(34)} ${my(40)} ${mx(52)}` }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 31, fontWeight: 650, margin: 0, color: '#111827', lineHeight: 1.1 }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '6px 0 0', fontSize: 14.5, color: accent, fontWeight: 600 }}>{d.headline}</p>}
        {!d.hidden.includes('summary') && d.summary && <p style={{ margin: '14px 0 0', color: '#374151' }}>{d.summary}</p>}
        {d.order.filter((k) => !['summary', 'skills', 'personal'].includes(k)).map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
      </main>
      <aside className="cv-pad" style={{ background: tint, padding: `${my(46)} 24px ${my(40)}`, position: 'relative', zIndex: 1 }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 120, height: 136, borderRadius: 8, objectFit: 'cover', display: 'block', margin: '0 auto 6px' }} />}
        <Side>{L.contact}</Side>
        {contactLine(d).map((c) => <p key={c} style={{ margin: '0 0 5px', wordBreak: 'break-word' }}>{c}</p>)}
        {showSkills && d.skills && (<><Side>{L.skills}</Side>{list(d.skills).map((s) => <p key={s} style={{ margin: '0 0 4px' }}>{s}</p>)}</>)}
        {showSkills && d.languages && (<><Side>{L.languages}</Side><p style={{ margin: 0 }}>{d.languages}</p></>)}
        {showPersonal && (<><Side>{L.personal}</Side>{personal.map(([a, b]) => <p key={a} style={{ margin: '0 0 6px' }}><span style={{ color: GREY, fontSize: 11 }}>{a}</span><br />{b}</p>)}</>)}
      </aside>
    </div>
  );
}


/* ── Pills: skills as rounded tags ─────────────────────────────── */

const Pills = ({ items, accent, solid }: { items: string[]; accent: string; solid?: boolean }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
    {items.map((x) => (
      <span key={x} style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: solid ? accent : `${accent}14`, color: solid ? '#fff' : accent, border: solid ? 'none' : `1px solid ${accent}33` }}>{x}</span>
    ))}
  </div>
);

/* ── Pulse (Pro): two columns, tinted right panel with skill tags ── */

function Pulse({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#111827', margin: '20px 0 9px', paddingBottom: 5, borderBottom: `2px solid ${accent}` }}>{children}</h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 10 }}>
        <strong style={{ fontSize: 13.5 }}>{title}</strong>
        {sub && <div style={{ color: accent, fontWeight: 600 }}>{sub}</div>}
        {date && <div style={{ color: GREY, fontSize: 11.5 }}>{date}</div>}
        {children}
      </div>
    ),
  };
  const Side = ({ children }: { children: ReactNode }) => (
    <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, margin: '20px 0 8px' }}>{children}</h2>
  );
  const showSkills = !d.hidden.includes('skills');
  const personal = d.showPersonal ? personalRows(d, L) : [];
  const showPersonal = !d.hidden.includes('personal') && personal.length > 0;
  const showRefs = !d.hidden.includes('references') && d.references.length > 0;
  return (
    <div className="cv-page" style={{ ...PAGE, display: 'grid', gridTemplateColumns: '1fr 236px' }}>
      <main className="cv-pad" style={{ padding: `${my(40)} 30px ${my(40)} ${mx(44)}` }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 750, margin: 0, color: '#111827', lineHeight: 1.05 }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '6px 0 0', fontSize: 15, color: accent, fontWeight: 650 }}>{d.headline}</p>}
        {!d.hidden.includes('summary') && d.summary && <p style={{ margin: '14px 0 0', color: '#374151' }}>{d.summary}</p>}
        {d.order.filter((k) => !['summary', 'skills', 'personal', 'references'].includes(k)).map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
      </main>
      <aside className="cv-pad" style={{ background: `${accent}10`, borderLeft: `3px solid ${accent}`, padding: `${my(40)} 22px` }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 120, height: 120, borderRadius: 14, objectFit: 'cover', display: 'block', margin: '0 0 6px' }} />}
        <Side>{L.contact}</Side>
        {contactLine(d).map((c) => <p key={c} style={{ margin: '0 0 5px', wordBreak: 'break-word', fontSize: 11.5 }}>{c}</p>)}
        {showSkills && d.skills && (<><Side>{L.skills}</Side><Pills items={list(d.skills)} accent={accent} /></>)}
        {showSkills && d.languages && (<><Side>{L.languages}</Side><p style={{ margin: 0 }}>{d.languages}</p></>)}
        {showPersonal && (<><Side>{L.personal}</Side>{personal.map(([a, b]) => <p key={a} style={{ margin: '0 0 6px', fontSize: 11.5 }}><span style={{ color: GREY, fontSize: 10.5 }}>{a}</span><br />{b}</p>)}</>)}
        {showRefs && (<><Side>{L.references}</Side>{d.references.map((r) => (
          <p key={r.id} style={{ margin: '0 0 9px', wordBreak: 'break-word', fontSize: 11.5 }}>
            <strong>{r.name}</strong>{[r.title, r.org].filter(Boolean).map((x) => <span key={x}><br />{x}</span>)}
            {(r.phone || r.email) && <span style={{ color: GREY }}><br />{[r.phone, r.email].filter(Boolean).join(', ')}</span>}
          </p>
        ))}</>)}
      </aside>
    </div>
  );
}

/* ── Bold (Pro): accent edge, uppercase name, filled section labels ── */

function Bold({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ margin: '20px 0 9px' }}>
        <span style={{ fontFamily: 'inherit', display: 'inline-block', background: accent, color: '#fff', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: 3 }}>{children}</span>
      </h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <strong style={{ fontSize: 13.5 }}>{title}</strong>
          {date && <span style={{ color: accent, fontWeight: 700, fontSize: 11.5, whiteSpace: 'nowrap' }}>{date}</span>}
        </div>
        {sub && <div style={{ color: GREY }}>{sub}</div>}
        {children}
      </div>
    ),
  };
  return (
    <div className="cv-page" style={{ ...PAGE, boxShadow: `inset 14px 0 0 ${accent}` }}>
      <header className="cv-keep" style={{ padding: `${my(40)} ${mx(48)} 6px ${mx(58)}`, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, margin: 0, color: '#111827', lineHeight: 1.05, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{d.name || 'Your Name'}</h1>
          {d.headline && <p style={{ margin: '7px 0 0', fontSize: 15, color: accent, fontWeight: 700 }}>{d.headline}</p>}
          <p style={{ margin: '10px 0 0', color: GREY, fontSize: 12 }}>{contactLine(d).join('   |   ')}</p>
        </div>
        {d.photo && <img src={d.photo} alt="" style={{ width: 104, height: 104, borderRadius: 8, objectFit: 'cover' }} />}
      </header>
      <div className="cv-pad" style={{ padding: `4px ${mx(48)} ${my(40)} ${mx(58)}` }}>
        {d.order.map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
      </div>
    </div>
  );
}

/* ── Fresher (Pro): skills up top as tags, compact, for first jobs ── */

function Fresher({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, margin: '17px 0 7px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, background: accent, borderRadius: 2, display: 'inline-block' }} />{children}
      </h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 9, paddingLeft: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <strong style={{ fontSize: 13.5 }}>{title}</strong>
          {date && <span style={{ color: GREY, fontSize: 11.5, whiteSpace: 'nowrap' }}>{date}</span>}
        </div>
        {sub && <div style={{ color: GREY }}>{sub}</div>}
        {children}
      </div>
    ),
  };
  const showSkills = !d.hidden.includes('skills') && !!d.skills;
  return (
    <div className="cv-page" style={PAGE}>
      <header className="cv-keep" style={{ padding: `${my(36)} ${mx(50)} 0`, textAlign: 'center' }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', display: 'block' }} />}
        <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '4px 0 0', fontSize: 14.5, color: accent, fontWeight: 650 }}>{d.headline}</p>}
        <p style={{ margin: '8px 0 0', color: GREY, fontSize: 12 }}>{contactLine(d).join('   ·   ')}</p>
        {showSkills && <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}><Pills items={list(d.skills).slice(0, 10)} accent={accent} solid /></div>}
      </header>
      <div className="cv-pad" style={{ padding: `2px ${mx(50)} ${my(40)}` }}>
        {d.order.map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
      </div>
    </div>
  );
}

/* ── Banner (Pro): colour band with the name, photo over its edge, light side column ── */

function Banner({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const Rule = () => <span style={{ display: 'block', width: 52, height: 3, background: accent, marginTop: 4 }} />;
  const Side = ({ children }: { children: ReactNode }) => (
    <h2 className="cv-title" style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: '#374151', margin: '22px 0 8px' }}>{children}<Rule /></h2>
  );
  const T: Theme = {
    Title: ({ children }) => <h2 className="cv-title" style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: '#374151', margin: '22px 0 9px' }}>{children}<Rule /></h2>,
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 11 }}>
        <strong style={{ fontSize: 13.5 }}>{title}</strong>
        {sub && <div style={{ color: GREY }}>{sub}</div>}
        {date && <div style={{ color: GREY, fontStyle: 'italic', fontSize: 12 }}>{date}</div>}
        {children}
      </div>
    ),
  };
  const showSkills = !d.hidden.includes('skills');
  const personal = d.showPersonal ? personalRows(d, L) : [];
  const showPersonal = !d.hidden.includes('personal') && personal.length > 0;
  const showRefs = !d.hidden.includes('references') && d.references.length > 0;
  return (
    <div className="cv-page" style={PAGE}>
      <header className="cv-keep" style={{ background: accent, color: '#fff', padding: `${my(40)} ${mx(40)} 34px 290px`, minHeight: 150, boxSizing: 'border-box' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, margin: 0, lineHeight: 1.1 }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '8px 0 0', fontSize: 15, opacity: 0.92, letterSpacing: '0.03em' }}>{d.headline}</p>}
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr' }}>
        <aside className="cv-pad" style={{ padding: `${my(26)} 22px 0 ${mx(28)}`, position: 'relative', zIndex: 1 }}>
          {d.photo && <img src={d.photo} alt="" style={{ width: 176, height: 196, objectFit: 'cover', display: 'block', marginTop: -92, marginBottom: 6, border: `3px solid ${accent}`, background: '#fff' }} />}
          <Side>{L.contact}</Side>
          {contactLine(d).map((c) => <p key={c} style={{ margin: '0 0 6px', wordBreak: 'break-word' }}>{c}</p>)}
          {showSkills && d.skills && (<><Side>{L.skills}</Side><ul style={{ margin: 0, paddingLeft: 16, listStyle: 'disc' }}>{list(d.skills).map((s) => <li key={s} style={{ marginBottom: 3 }}>{s}</li>)}</ul></>)}
          {showSkills && d.languages && (<><Side>{L.languages}</Side><p style={{ margin: 0 }}>{d.languages}</p></>)}
          {showPersonal && (<><Side>{L.personal}</Side>{personal.map(([a, b]) => <p key={a} style={{ margin: '0 0 6px' }}><span style={{ color: GREY, fontSize: 11 }}>{a}</span><br />{b}</p>)}</>)}
          {showRefs && (<><Side>{L.references}</Side>{d.references.map((r) => (
            <p key={r.id} style={{ margin: '0 0 10px', wordBreak: 'break-word' }}>
              <strong>{r.name}</strong>{[r.title, r.org].filter(Boolean).map((x) => <span key={x}><br />{x}</span>)}
              {(r.phone || r.email) && <span style={{ color: GREY }}><br />{[r.phone, r.email].filter(Boolean).join(', ')}</span>}
            </p>
          ))}</>)}
        </aside>
        <main className="cv-pad" style={{ padding: `${my(14)} ${mx(40)} 0 ${mx(20)}` }}>
          {d.order.filter((k) => !['skills', 'personal', 'references'].includes(k)).map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
        </main>
      </div>
    </div>
  );
}

/* ── Bars (Pro): one column, full-width section bars, dates on a tinted line ── */

function Bars({ d, accent, L }: { d: CvData; accent: string; L: Labels }) {
  const T: Theme = {
    Title: ({ children }) => (
      <h2 className="cv-title" style={{ fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, textAlign: 'center', color: '#fff', background: accent, padding: '3px 10px', margin: '14px 0 8px' }}>{children}</h2>
    ),
    Entry: ({ title, sub, date, children }) => (
      <div className="cv-entry" style={{ marginBottom: 10 }}>
        <div style={{ background: `${accent}1f`, padding: '2px 8px' }}>
          {date && <div style={{ fontWeight: 600, fontSize: 12 }}>{date}</div>}
          <strong>{title}</strong>
          {sub && <div>{sub}</div>}
        </div>
        {children && <div style={{ padding: '2px 8px 0' }}>{children}</div>}
      </div>
    ),
  };
  return (
    <div className="cv-page" style={PAGE}>
      <header className="cv-keep" style={{ padding: `${my(34)} ${mx(46)} 0` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, paddingBottom: 12, borderBottom: '3px solid #111827' }}>
          {d.photo && <img src={d.photo} alt="" style={{ width: 104, height: 104, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}` }} />}
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'inherit', fontSize: 24, fontWeight: 700, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>{contactLine(d).join('   |   ')}</p>
          </div>
        </div>
        {d.headline && <p style={{ margin: '12px 0 0', background: `${accent}1f`, textAlign: 'center', fontWeight: 700, fontSize: 16, padding: '5px 10px' }}>{d.headline}</p>}
      </header>
      <div className="cv-pad" style={{ padding: `0 ${mx(46)} ${my(40)}` }}>
        {d.order.map((k) => <Section key={k} k={k} d={d} L={L} T={T} />)}
      </div>
    </div>
  );
}

export const DESIGNS = DESIGN_LIST;

export const isProDesign = (id: DesignId) => !!DESIGNS.find((x) => x.id === id)?.pro;

export function CvDocument({ d, design, accent, headings = 'en', margins, font }: { d: CvData; design: DesignId; accent: string; headings?: HeadingLang; margins?: Margins; font?: string }) {
  const L = LABELS[headings];
  const f = findFont(font);
  // No wrapper box (display: contents), only the two scale variables for the paddings
  const vars = {
    ...(margins ? { '--cvx': clampMargin(margins.x) / DEFAULT_MARGINS.x, '--cvy': clampMargin(margins.y) / DEFAULT_MARGINS.y } : {}),
    ...(f.body ? { '--cv-font': f.body, '--cv-head': f.head } : {}),
  } as CSSProperties;
  return <div style={{ display: 'contents', ...vars }}><Layout d={d} design={design} accent={accent} L={L} /></div>;
}

function Layout({ d, design, accent, L }: { d: CvData; design: DesignId; accent: string; L: Labels }) {
  if (design === 'banner') return <Banner d={d} accent={accent} L={L} />;
  if (design === 'bars') return <Bars d={d} accent={accent} L={L} />;
  if (design === 'pulse') return <Pulse d={d} accent={accent} L={L} />;
  if (design === 'bold') return <Bold d={d} accent={accent} L={L} />;
  if (design === 'fresher') return <Fresher d={d} accent={accent} L={L} />;
  if (design === 'graphite') return <Modern d={d} accent={accent} L={L} side="#1f2933" />;
  if (design === 'modern') return <Modern d={d} accent={accent} L={L} />;
  if (design === 'executive') return <Executive d={d} accent={accent} L={L} />;
  if (design === 'elegant') return <Elegant d={d} accent={accent} L={L} />;
  if (design === 'minimal') return <Minimal d={d} accent={accent} L={L} />;
  if (design === 'timeline') return <Timeline d={d} accent={accent} L={L} />;
  if (design === 'corporate') return <Corporate d={d} accent={accent} L={L} />;
  return <Classic d={d} accent={accent} L={L} />;
}
