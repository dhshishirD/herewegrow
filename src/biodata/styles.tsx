// Biodata layouts. Each page is a fixed A4 box (794x1123 px) with inline styles, so the same markup
// shows on screen and prints from the hidden frame. Phase 1: Classic Serif and Minimal Clean.
import type { CSSProperties } from 'react';
import { buildSections, paginate, type BiodataData, type Section } from './model';

export type StyleId = 'classic-serif' | 'minimal-clean';
export interface Colour { id: string; name: string; main: string; dark: string; tint: string }

export const COLOURS: Colour[] = [
  { id: 'navy', name: 'Navy & Gold', main: '#16284c', dark: '#0e1b36', tint: '#e2b865' },
  { id: 'emerald', name: 'Emerald & Gold', main: '#0e5a47', dark: '#093d30', tint: '#d9b45f' },
  { id: 'charcoal', name: 'Charcoal & Copper', main: '#2b2b2e', dark: '#1a1a1c', tint: '#e0a47a' },
];

export const STYLES: { id: StyleId; name: string; note: string }[] = [
  { id: 'classic-serif', name: 'Classic Serif', note: 'Traditional serif with a gold rule. Dignified.' },
  { id: 'minimal-clean', name: 'Minimal Clean', note: 'Plenty of white space, one accent line. Modern.' },
];

export const FREE_MAX_PAGES = 2;
export const PRO_MAX_PAGES = 3;

const page: CSSProperties = { width: 794, height: 1123, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', background: '#fff', pageBreakAfter: 'always', breakAfter: 'page' };

function Photo({ src, size, radius, border }: { src: string; size: number; radius: number | string; border: string }) {
  if (!src) return null;
  return <img src={src} alt="" style={{ width: size, height: size * 1.25, objectFit: 'cover', borderRadius: radius, border, display: 'block' }} />;
}

function SectionBlock({ s, st, c }: { s: Section; st: StyleId; c: Colour }) {
  const serif = st === 'classic-serif';
  const title: CSSProperties = serif
    ? { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 17, fontWeight: 700, color: c.main, borderBottom: `1.5px solid ${c.tint}`, paddingBottom: 4, margin: '0 0 8px', letterSpacing: 0.3 }
    : { fontFamily: 'Inter, Arial, sans-serif', fontSize: 11, fontWeight: 700, color: c.main, textTransform: 'uppercase', letterSpacing: 1.6, margin: '0 0 8px' };
  const body: CSSProperties = { fontFamily: serif ? 'Georgia, "Times New Roman", serif' : 'Inter, Arial, sans-serif', fontSize: 14, color: '#222', lineHeight: 1.55 };
  return (
    <section className="bio-keep" style={{ marginBottom: 20, breakInside: 'avoid' }}>
      <h2 style={title}>{s.title}</h2>
      {s.rows.map(([l, v]) => (
        <div key={l + v} style={{ ...body, display: 'flex', padding: '3px 0' }}>
          <span style={{ width: 150, flexShrink: 0, color: serif ? c.main : '#667', fontWeight: serif ? 700 : 500 }}>{l}</span>
          <span style={{ flex: 1 }}>{v}</span>
        </div>
      ))}
      {s.text ? <p style={{ ...body, margin: 0, whiteSpace: 'pre-wrap' }}>{s.text}</p> : null}
    </section>
  );
}

function Header({ d, st, c }: { d: BiodataData; st: StyleId; c: Colour }) {
  const serif = st === 'classic-serif';
  if (serif) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: `3px double ${c.tint}`, paddingBottom: 20, marginBottom: 22 }}>
        <div style={{ flex: 1, textAlign: d.photo ? 'left' : 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, letterSpacing: 4, color: c.tint, textTransform: 'uppercase', marginBottom: 6 }}>Marriage Biodata</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 34, fontWeight: 700, color: c.main, lineHeight: 1.15 }}>{d.name || 'Your Name'}</div>
        </div>
        <Photo src={d.photo} size={130} radius={4} border={`3px solid ${c.tint}`} />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 26 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: 11, letterSpacing: 2.4, color: '#889', textTransform: 'uppercase', marginBottom: 8 }}>Marriage Biodata</div>
        <div style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: 36, fontWeight: 700, color: c.main, lineHeight: 1.1 }}>{d.name || 'Your Name'}</div>
        <div style={{ width: 56, height: 4, background: c.tint, marginTop: 14 }} />
      </div>
      <Photo src={d.photo} size={120} radius="50%" border={`2px solid ${c.main}`} />
    </div>
  );
}

export function BiodataDocument({ d, style, colour, maxPages, footer }: { d: BiodataData; style: StyleId; colour: Colour; maxPages: number; footer: boolean }) {
  const { pages } = paginate(buildSections(d), maxPages);
  return (
    <>
      {pages.map((secs, i) => (
        <div key={i} className="bio-page" style={{ ...page, padding: 56 }}>
          {i === 0 ? <Header d={d} st={style} c={colour} /> : null}
          {secs.map((s) => <SectionBlock key={s.id} s={s} st={style} c={colour} />)}
          {footer ? <div style={{ position: 'absolute', bottom: 18, right: 28, font: '600 10px Inter, Arial, sans-serif', color: '#94a3b8' }}>Made with herewegrow.pro</div> : null}
        </div>
      ))}
    </>
  );
}

export const printCss = '@page{size:A4;margin:0}.bio-page{break-after:page}.bio-page:last-child{break-after:auto}';
