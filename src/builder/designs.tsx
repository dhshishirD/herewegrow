import type { CSSProperties, ReactNode } from 'react';
import { lines, list, type CvData, type DesignId } from './model';

// Three CV designs, each laid out on an A4 page (794 × 1123 px at 96 dpi).
// Text stays real text, so the PDF is readable by ATS software.

const PAGE: CSSProperties = { width: 794, minHeight: 1123, background: '#fff', color: '#1f2933', fontFamily: '"Inter Variable", Arial, sans-serif', fontSize: 12.5, lineHeight: 1.5 };

const dates = (start: string, end: string, current: boolean) => [start, current ? 'Present' : end].filter(Boolean).join(' – ');

function Bullets({ text }: { text: string }) {
  const items = lines(text);
  if (!items.length) return null;
  return (
    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyle: 'disc' }}>
      {items.map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
    </ul>
  );
}

function contactLine(d: CvData) {
  return [d.phone, d.email, d.location, d.linkedin].filter(Boolean);
}

function Personal({ d }: { d: CvData }) {
  if (!d.showPersonal) return null;
  const rows: [string, string][] = [
    ["Father's name", d.father],
    ["Mother's name", d.mother],
    ['Date of birth', d.dob],
    ['Nationality', d.nationality],
    ['Religion', d.religion],
    ['Permanent address', d.permanentAddress],
  ].filter(([, v]) => v) as [string, string][];
  if (!rows.length) return null;
  return (
    <table style={{ borderCollapse: 'collapse', marginTop: 4 }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td style={{ padding: '1px 16px 1px 0', color: '#52606d', whiteSpace: 'nowrap' }}>{k}</td>
            <td style={{ padding: '1px 0' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Classic: one column, ATS-safe ───────────────────────────── */

function ClassicSection({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent, borderBottom: `1.5px solid ${accent}`, paddingBottom: 3, margin: '0 0 8px' }}>{title}</h2>
      {children}
    </section>
  );
}

function Classic({ d, accent }: { d: CvData; accent: string }) {
  return (
    <div style={{ ...PAGE, padding: '48px 56px' }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '2px 0 0', fontSize: 14, color: accent, fontWeight: 600 }}>{d.headline}</p>}
        <p style={{ margin: '6px 0 0', color: '#52606d' }}>{contactLine(d).join('  |  ')}</p>
      </header>
      {d.summary && <ClassicSection title="Professional Summary" accent={accent}><p style={{ margin: 0 }}>{d.summary}</p></ClassicSection>}
      {d.experience.length > 0 && (
        <ClassicSection title="Work Experience" accent={accent}>
          {d.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <strong>{e.role}</strong>
                <span style={{ color: '#52606d', whiteSpace: 'nowrap' }}>{dates(e.start, e.end, e.current)}</span>
              </div>
              <div style={{ color: '#52606d' }}>{[e.org, e.location].filter(Boolean).join(', ')}</div>
              <Bullets text={e.bullets} />
            </div>
          ))}
        </ClassicSection>
      )}
      {d.education.length > 0 && (
        <ClassicSection title="Education" accent={accent}>
          {d.education.map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
              <div><strong>{e.degree}</strong>{e.institution && <span>, {e.institution}</span>}{e.result && <span style={{ color: '#52606d' }}> ({e.result})</span>}</div>
              <span style={{ color: '#52606d' }}>{e.year}</span>
            </div>
          ))}
        </ClassicSection>
      )}
      {(d.skills || d.languages) && (
        <ClassicSection title="Skills" accent={accent}>
          {d.skills && <p style={{ margin: 0 }}>{list(d.skills).join(', ')}</p>}
          {d.languages && <p style={{ margin: '4px 0 0' }}><strong>Languages:</strong> {d.languages}</p>}
        </ClassicSection>
      )}
      {d.training.length > 0 && (
        <ClassicSection title="Training and Certifications" accent={accent}>
          {d.training.map((t) => <p key={t.id} style={{ margin: '0 0 3px' }}><strong>{t.name}</strong>{t.org && `, ${t.org}`}{t.year && ` (${t.year})`}</p>)}
        </ClassicSection>
      )}
      {d.showPersonal && <ClassicSection title="Personal Details" accent={accent}><Personal d={d} /></ClassicSection>}
      {d.references.length > 0 && (
        <ClassicSection title="References" accent={accent}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {d.references.map((r) => <div key={r.id}><strong>{r.name}</strong><div>{r.title}</div><div style={{ color: '#52606d' }}>{r.contact}</div></div>)}
          </div>
        </ClassicSection>
      )}
    </div>
  );
}

/* ── Modern: coloured sidebar with photo ─────────────────────── */

function SideTitle({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '22px 0 8px', opacity: 0.9 }}>{children}</h2>;
}

function MainTitle({ children, accent }: { children: ReactNode; accent: string }) {
  return <h2 style={{ fontSize: 15, fontWeight: 700, color: accent, margin: '20px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 18, height: 3, background: accent, display: 'inline-block', borderRadius: 2 }} />{children}
  </h2>;
}

function Modern({ d, accent }: { d: CvData; accent: string }) {
  return (
    <div style={{ ...PAGE, display: 'grid', gridTemplateColumns: '250px 1fr' }}>
      <aside style={{ background: accent, color: '#fff', padding: '40px 26px' }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 8px', border: '4px solid rgba(255,255,255,.35)' }} />}
        <SideTitle>Contact</SideTitle>
        {contactLine(d).map((c) => <p key={c} style={{ margin: '0 0 5px', wordBreak: 'break-word' }}>{c}</p>)}
        {d.skills && (<><SideTitle>Skills</SideTitle><ul style={{ margin: 0, paddingLeft: 16, listStyle: 'disc' }}>{list(d.skills).map((s) => <li key={s} style={{ marginBottom: 3 }}>{s}</li>)}</ul></>)}
        {d.languages && (<><SideTitle>Languages</SideTitle><p style={{ margin: 0 }}>{d.languages}</p></>)}
        {d.training.length > 0 && (<><SideTitle>Training</SideTitle>{d.training.map((t) => <p key={t.id} style={{ margin: '0 0 6px' }}><strong>{t.name}</strong><br />{[t.org, t.year].filter(Boolean).join(', ')}</p>)}</>)}
      </aside>
      <main style={{ padding: '44px 40px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: '#111827', lineHeight: 1.1 }}>{d.name || 'Your Name'}</h1>
        {d.headline && <p style={{ margin: '6px 0 0', fontSize: 15, color: accent, fontWeight: 600 }}>{d.headline}</p>}
        {d.summary && <p style={{ margin: '14px 0 0', color: '#374151' }}>{d.summary}</p>}
        {d.experience.length > 0 && (<><MainTitle accent={accent}>Experience</MainTitle>{d.experience.map((e) => (
          <div key={e.id} style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: 13.5 }}>{e.role}</strong>
            <div style={{ color: '#52606d' }}>{[e.org, e.location].filter(Boolean).join(', ')}{(e.start || e.end || e.current) && `  ·  ${dates(e.start, e.end, e.current)}`}</div>
            <Bullets text={e.bullets} />
          </div>))}</>)}
        {d.education.length > 0 && (<><MainTitle accent={accent}>Education</MainTitle>{d.education.map((e) => (
          <div key={e.id} style={{ marginBottom: 7 }}>
            <strong>{e.degree}</strong>
            <div style={{ color: '#52606d' }}>{[e.institution, e.result, e.year].filter(Boolean).join('  ·  ')}</div>
          </div>))}</>)}
        {d.showPersonal && (<><MainTitle accent={accent}>Personal Details</MainTitle><Personal d={d} /></>)}
        {d.references.length > 0 && (<><MainTitle accent={accent}>References</MainTitle>{d.references.map((r) => <p key={r.id} style={{ margin: '0 0 6px' }}><strong>{r.name}</strong>, {r.title}<br /><span style={{ color: '#52606d' }}>{r.contact}</span></p>)}</>)}
      </main>
    </div>
  );
}

/* ── Executive: serif name, top band, two-column details ─────── */

function Executive({ d, accent }: { d: CvData; accent: string }) {
  const Title = ({ children }: { children: ReactNode }) => (
    <h2 style={{ fontFamily: '"Fraunces Variable", Georgia, serif', fontSize: 16, fontWeight: 600, color: accent, margin: '18px 0 6px' }}>{children}</h2>
  );
  return (
    <div style={PAGE}>
      <header style={{ borderTop: `10px solid ${accent}`, padding: '34px 56px 18px', display: 'flex', gap: 24, alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        {d.photo && <img src={d.photo} alt="" style={{ width: 96, height: 112, objectFit: 'cover', borderRadius: 6 }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: '"Fraunces Variable", Georgia, serif', fontSize: 32, fontWeight: 600, margin: 0, color: '#111827' }}>{d.name || 'Your Name'}</h1>
          {d.headline && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151', letterSpacing: '0.02em' }}>{d.headline}</p>}
          <p style={{ margin: '8px 0 0', color: '#52606d' }}>{contactLine(d).join('   ·   ')}</p>
        </div>
      </header>
      <div style={{ padding: '6px 56px 40px' }}>
        {d.summary && (<><Title>Profile</Title><p style={{ margin: 0 }}>{d.summary}</p></>)}
        {d.experience.length > 0 && (<><Title>Career History</Title>{d.experience.map((e) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 16, marginBottom: 10 }}>
            <div style={{ color: '#52606d' }}>{dates(e.start, e.end, e.current)}</div>
            <div><strong>{e.role}</strong><div style={{ color: '#52606d' }}>{[e.org, e.location].filter(Boolean).join(', ')}</div><Bullets text={e.bullets} /></div>
          </div>))}</>)}
        {d.education.length > 0 && (<><Title>Education</Title>{d.education.map((e) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 16, marginBottom: 5 }}>
            <div style={{ color: '#52606d' }}>{e.year}</div>
            <div><strong>{e.degree}</strong>{e.institution && `, ${e.institution}`}{e.result && <span style={{ color: '#52606d' }}> ({e.result})</span>}</div>
          </div>))}</>)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {d.skills && <div><Title>Core Skills</Title><p style={{ margin: 0 }}>{list(d.skills).join('  ·  ')}</p></div>}
          {(d.languages || d.training.length > 0) && <div>
            {d.languages && (<><Title>Languages</Title><p style={{ margin: 0 }}>{d.languages}</p></>)}
            {d.training.length > 0 && (<><Title>Training</Title>{d.training.map((t) => <p key={t.id} style={{ margin: '0 0 3px' }}>{t.name}{t.year && ` (${t.year})`}</p>)}</>)}
          </div>}
        </div>
        {d.showPersonal && (<><Title>Personal Details</Title><Personal d={d} /></>)}
        {d.references.length > 0 && (<><Title>References</Title><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{d.references.map((r) => <div key={r.id}><strong>{r.name}</strong><div>{r.title}</div><div style={{ color: '#52606d' }}>{r.contact}</div></div>)}</div></>)}
      </div>
    </div>
  );
}

export const DESIGNS: { id: DesignId; name: { en: string; bn: string }; note: { en: string; bn: string } }[] = [
  { id: 'classic', name: { en: 'Classic (ATS)', bn: 'ক্লাসিক (ATS)' }, note: { en: 'Best for online job portals', bn: 'অনলাইন জব পোর্টালের জন্য সেরা' } },
  { id: 'modern', name: { en: 'Modern', bn: 'মডার্ন' }, note: { en: 'Colour sidebar and photo', bn: 'রঙিন সাইডবার ও ছবি' } },
  { id: 'executive', name: { en: 'Executive', bn: 'এক্সিকিউটিভ' }, note: { en: 'For senior roles', bn: 'সিনিয়র পদের জন্য' } },
];

export function CvDocument({ d, design, accent }: { d: CvData; design: DesignId; accent: string }) {
  if (design === 'modern') return <Modern d={d} accent={accent} />;
  if (design === 'executive') return <Executive d={d} accent={accent} />;
  return <Classic d={d} accent={accent} />;
}
