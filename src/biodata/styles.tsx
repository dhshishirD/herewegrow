// Biodata layouts. Each page is a fixed A4 box (794x1123 px) with inline styles, so the same markup
// shows on screen and prints from the hidden frame. Ten unique layouts; colour is a separate choice.
import type { CSSProperties, ReactNode } from 'react';
import { buildSections, paginate, type BiodataData, type Section } from './model';

import { BIODATA_STYLES, type BiodataStyleId } from '../../shared/biodataStyles';

export type StyleId = BiodataStyleId;
export interface Colour { id: string; name: string; main: string; dark: string; tint: string }

const mk = (id: string, name: string, main: string, tint: string, dark: string): Colour => ({ id, name, main, dark, tint });
export const COLOURS: Colour[] = [
  mk('navy', 'Navy & Gold', '#16284c', '#e2b865', '#0e1b36'),
  mk('emerald', 'Emerald & Gold', '#0e5a47', '#d9b45f', '#093d30'),
  mk('charcoal', 'Charcoal & Copper', '#2b2b2e', '#e0a47a', '#1a1a1c'),
  mk('burgundy', 'Burgundy & Rose', '#5b1a2b', '#f0c3b3', '#3d101c'),
  mk('plum', 'Plum & Gold', '#3d1f4a', '#e6c27a', '#27132f'),
  mk('royal', 'Royal Blue & Silver', '#1d3a8a', '#cdd6e8', '#122559'),
  mk('teal', 'Teal & Gold', '#0b4f5c', '#e2b865', '#07343d'),
  mk('terracotta', 'Terracotta & Cream', '#8a3a26', '#f1d3b0', '#5e2718'),
  mk('mocha', 'Mocha & Champagne', '#4a3426', '#e4c9a0', '#30221a'),
  mk('olive', 'Olive & Gold', '#4f5a2e', '#dcc77c', '#343c1e'),
];

export const STYLES = BIODATA_STYLES.map((x) => ({ id: x.id, name: x.name, group: x.group, note: x.note, free: x.free }));

export const FREE_COLOURS = ['navy', 'emerald', 'charcoal'];
export const FREE_MAX_PAGES = 2;
export const PRO_MAX_PAGES = 3;

/** True when this style or colour is part of the paid pack (download needs Pro). */
export function needsPro(style: StyleId, colour: string): boolean {
  return !STYLES.find((s) => s.id === style)?.free || !FREE_COLOURS.includes(colour);
}

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'Inter, Arial, sans-serif';
const soft = (c: Colour) => c.tint + '33';

const pageBox: CSSProperties = { width: 794, height: 1123, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', background: '#fff', breakAfter: 'page' };

function Photo({ src, w, radius, border }: { src: string; w: number; radius: number | string; border?: string }) {
  if (!src) return null;
  return <img src={src} alt="" style={{ width: w, height: Math.round(w * 1.25), objectFit: 'cover', borderRadius: radius, border, display: 'block', flexShrink: 0 }} />;
}

interface Look { font: string; title: (c: Colour) => CSSProperties; label: (c: Colour) => CSSProperties; card?: boolean; bar?: boolean; timeline?: boolean }

const LOOKS: Record<StyleId, Look> = {
  'classic-serif': { font: SERIF, title: (c) => ({ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: c.main, borderBottom: `1.5px solid ${c.tint}`, paddingBottom: 4 }), label: (c) => ({ color: c.main, fontWeight: 700 }) },
  'royal-frame': { font: SERIF, title: (c) => ({ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: c.main, textAlign: 'center', borderTop: `1px solid ${c.tint}`, borderBottom: `1px solid ${c.tint}`, padding: '4px 0', letterSpacing: 1 }), label: (c) => ({ color: c.main, fontWeight: 700 }) },
  sidebar: { font: SANS, title: (c) => ({ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: c.main, textTransform: 'uppercase', letterSpacing: 1.4, borderBottom: `2px solid ${c.tint}`, paddingBottom: 4 }), label: () => ({ color: '#667' }) },
  'top-banner': { font: SANS, title: (c) => ({ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: c.main, borderLeft: `4px solid ${c.tint}`, paddingLeft: 10 }), label: () => ({ color: '#667' }) },
  'minimal-clean': { font: SANS, title: (c) => ({ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: c.main, textTransform: 'uppercase', letterSpacing: 1.6 }), label: () => ({ color: '#667', fontWeight: 500 }) },
  'split-card': { font: SANS, card: true, title: (c) => ({ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: c.main, textTransform: 'uppercase', letterSpacing: 1.2 }), label: () => ({ color: '#667' }) },
  'photo-first': { font: SANS, title: (c) => ({ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: c.main, borderBottom: `1px solid ${c.tint}`, paddingBottom: 4 }), label: () => ({ color: '#667' }) },
  timeline: { font: SANS, timeline: true, title: (c) => ({ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: c.main }), label: () => ({ color: '#667' }) },
  'premium-full-page': { font: SERIF, bar: true, title: (c) => ({ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: '#fff', background: c.main, padding: '5px 12px', letterSpacing: 0.8 }), label: (c) => ({ color: c.main, fontWeight: 700 }) },
  'two-tone-diagonal': { font: SANS, title: (c) => ({ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: c.main, borderBottom: `2px solid ${c.main}`, paddingBottom: 3 }), label: () => ({ color: '#667' }) },
};

function Block({ s, st, c, labelW = 150 }: { s: Section; st: StyleId; c: Colour; labelW?: number }) {
  const L = LOOKS[st];
  const body: CSSProperties = { fontFamily: L.font, fontSize: 14, color: '#222', lineHeight: 1.55 };
  const inner: ReactNode = (
    <>
      <h2 style={{ ...L.title(c), margin: '0 0 8px' }}>{s.title}</h2>
      {s.rows.map(([l, v]) => (
        <div key={l + v} style={{ ...body, display: 'flex', padding: '3px 0' }}>
          <span style={{ width: labelW, flexShrink: 0, ...L.label(c) }}>{l}</span>
          <span style={{ flex: 1, minWidth: 0 }}>{v}</span>
        </div>
      ))}
      {s.text ? <p style={{ ...body, margin: 0, whiteSpace: 'pre-wrap' }}>{s.text}</p> : null}
    </>
  );
  if (L.card) return <section style={{ marginBottom: 16, background: soft(c), borderRadius: 10, padding: '14px 16px', breakInside: 'avoid' }}>{inner}</section>;
  if (L.timeline) {
    return (
      <section style={{ marginBottom: 18, paddingLeft: 26, position: 'relative', borderLeft: `2px solid ${c.tint}`, marginLeft: 6, breakInside: 'avoid' }}>
        <span style={{ position: 'absolute', left: -8, top: 3, width: 14, height: 14, borderRadius: '50%', background: c.main, border: `3px solid ${c.tint}` }} />
        {inner}
      </section>
    );
  }
  return <section style={{ marginBottom: 20, breakInside: 'avoid' }}>{inner}</section>;
}

const label = (t: string, c: Colour): CSSProperties => ({ fontFamily: SANS, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.tint });
const nameOf = (d: BiodataData) => d.name || 'Your Name';

interface Frame { headerH: number; cpl: number; header: (d: BiodataData, c: Colour) => ReactNode; pad?: number; cols?: boolean; wrap?: (p: ReactNode, c: Colour, i: number) => ReactNode }

function headerClassic(d: BiodataData, c: Colour) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: `3px double ${c.tint}`, paddingBottom: 20, marginBottom: 22 }}>
      <div style={{ flex: 1, textAlign: d.photo ? 'left' : 'center' }}>
        <div style={{ ...label('', c), fontFamily: SERIF, marginBottom: 6 }}>Marriage Biodata</div>
        <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 700, color: c.main, lineHeight: 1.15 }}>{nameOf(d)}</div>
      </div>
      <Photo src={d.photo} w={104} radius={4} border={`3px solid ${c.tint}`} />
    </div>
  );
}

const FRAMES: Partial<Record<StyleId, Frame>> = {
  'classic-serif': { headerH: 200, cpl: 85, header: headerClassic },
  'royal-frame': {
    headerH: 230, cpl: 78, pad: 76,
    header: (d, c) => (
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ ...label('', c), fontFamily: SERIF, marginBottom: 8 }}>✦ Marriage Biodata ✦</div>
        {d.photo ? <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Photo src={d.photo} w={104} radius="50% / 40%" border={`3px solid ${c.tint}`} /></div> : null}
        <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: c.main }}>{nameOf(d)}</div>
      </div>
    ),
    wrap: (p, c) => <div style={{ position: 'absolute', inset: 22, border: `3px double ${c.main}`, pointerEvents: 'none' }}>{p}</div>,
  },
  'top-banner': {
    headerH: 250, cpl: 85, pad: 0,
    header: (d, c) => (
      <div style={{ background: c.main, color: '#fff', padding: '44px 56px', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 30 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...label('', c), marginBottom: 8 }}>Marriage Biodata</div>
          <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{nameOf(d)}</div>
          <div style={{ width: 56, height: 4, background: c.tint, marginTop: 14 }} />
        </div>
        <Photo src={d.photo} w={112} radius={8} border={`3px solid ${c.tint}`} />
      </div>
    ),
  },
  'minimal-clean': {
    headerH: 200, cpl: 85,
    header: (d, c) => (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 26 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2.4, color: '#889', textTransform: 'uppercase', marginBottom: 8 }}>Marriage Biodata</div>
          <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: c.main, lineHeight: 1.1 }}>{nameOf(d)}</div>
          <div style={{ width: 56, height: 4, background: c.tint, marginTop: 14 }} />
        </div>
        <Photo src={d.photo} w={96} radius="50%" border={`2px solid ${c.main}`} />
      </div>
    ),
  },
  'split-card': {
    headerH: 190, cpl: 85,
    header: (d, c) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: c.main, borderRadius: 14, padding: '22px 26px', marginBottom: 22, color: '#fff' }}>
        <Photo src={d.photo} w={88} radius={10} border={`2px solid ${c.tint}`} />
        <div>
          <div style={{ ...label('', c), marginBottom: 6 }}>Marriage Biodata</div>
          <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 700 }}>{nameOf(d)}</div>
        </div>
      </div>
    ),
  },
  'photo-first': {
    headerH: 340, cpl: 85,
    header: (d, c) => (
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', marginBottom: 26 }}>
        {d.photo ? <Photo src={d.photo} w={200} radius={12} border={`4px solid ${c.tint}`} /> : null}
        <div style={{ flex: 1, paddingTop: d.photo ? 40 : 0 }}>
          <div style={{ fontFamily: SANS, fontSize: 12, letterSpacing: 3, color: c.tint, textTransform: 'uppercase', marginBottom: 8 }}>Marriage Biodata</div>
          <div style={{ fontFamily: SANS, fontSize: 38, fontWeight: 800, color: c.main, lineHeight: 1.1 }}>{nameOf(d)}</div>
        </div>
      </div>
    ),
  },
  timeline: {
    headerH: 190, cpl: 80,
    header: (d, c) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 26 }}>
        <Photo src={d.photo} w={92} radius="50%" border={`4px solid ${c.tint}`} />
        <div>
          <div style={{ fontFamily: SANS, fontSize: 12, letterSpacing: 3, color: '#889', textTransform: 'uppercase', marginBottom: 6 }}>Marriage Biodata</div>
          <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 700, color: c.main }}>{nameOf(d)}</div>
        </div>
      </div>
    ),
  },
  'premium-full-page': {
    headerH: 250, cpl: 85, pad: 0,
    header: (d, c) => (
      <div style={{ background: c.dark, padding: '46px 56px 34px', display: 'flex', alignItems: 'center', gap: 26, borderBottom: `6px solid ${c.tint}`, marginBottom: 30 }}>
        <Photo src={d.photo} w={112} radius={4} border={`3px solid ${c.tint}`} />
        <div style={{ flex: 1, textAlign: d.photo ? 'left' : 'center', color: '#fff' }}>
          <div style={{ ...label('', c), fontFamily: SERIF, marginBottom: 8 }}>Marriage Biodata</div>
          <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 700 }}>{nameOf(d)}</div>
        </div>
      </div>
    ),
  },
  'two-tone-diagonal': {
    headerH: 270, cpl: 85, pad: 0,
    header: (d, c) => (
      <div style={{ position: 'relative', height: 220, marginBottom: 26 }}>
        <div style={{ position: 'absolute', inset: 0, background: c.main, clipPath: 'polygon(0 0, 100% 0, 100% 62%, 0 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 220, background: c.tint, clipPath: 'polygon(0 92%, 100% 56%, 100% 62%, 0 100%)' }} />
        <div style={{ position: 'absolute', left: 56, top: 44, color: '#fff' }}>
          <div style={{ ...label('', c), marginBottom: 8 }}>Marriage Biodata</div>
          <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700 }}>{nameOf(d)}</div>
        </div>
        {d.photo ? <div style={{ position: 'absolute', right: 56, top: 40 }}><Photo src={d.photo} w={100} radius="50%" border="4px solid #fff" /></div> : null}
      </div>
    ),
  },
};

function SidebarDoc({ d, c, maxPages, footer }: { d: BiodataData; c: Colour; maxPages: number; footer: boolean }) {
  const all = buildSections(d);
  const side = all.filter((s) => s.id === 'personal' || s.id === 'contact');
  const main = all.filter((s) => s.id !== 'personal' && s.id !== 'contact');
  const { pages, overflow } = paginate(main, maxPages, { headerH: 0, charsPerLine: 62 });
  const sideCss: CSSProperties = { position: 'absolute', left: 0, top: 0, bottom: 0, width: 250, background: c.main, color: '#fff' };
  return (
    <Pages overflow={overflow}>
      {pages.map((secs, i) => (
        <div key={i} className="bio-page" style={pageBox}>
          <div style={sideCss}>
            {i === 0 ? (
              <div style={{ padding: '44px 24px' }}>
                <Photo src={d.photo} w={150} radius={8} border={`3px solid ${c.tint}`} />
                <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, margin: '18px 0 4px', lineHeight: 1.2 }}>{nameOf(d)}</div>
                <div style={{ ...label('', c), marginBottom: 22 }}>Marriage Biodata</div>
                {side.map((s) => (
                  <div key={s.id} style={{ marginBottom: 18 }}>
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: c.tint, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{s.title}</div>
                    {s.rows.map(([l, v]) => <div key={l + v} style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, marginBottom: 4 }}><span style={{ opacity: 0.7 }}>{l}</span><br />{v}</div>)}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div style={{ marginLeft: 250, padding: 44 }}>{secs.map((s) => <Block key={s.id} s={s} st="sidebar" c={c} labelW={110} />)}</div>
          {footer ? <Footer /> : null}
        </div>
      ))}
    </Pages>
  );
}

const Footer = () => <div style={{ position: 'absolute', bottom: 18, right: 28, font: `600 10px ${SANS}`, color: '#94a3b8' }}>Made with herewegrow.pro</div>;

/** The pages plus a notice (screen only) when content did not fit the page limit. */
function Pages({ children, overflow }: { children: ReactNode; overflow: boolean }) {
  return (
    <>
      {overflow ? <div className="bio-notice no-print" style={{ background: '#fff7e0', border: '1px solid #e2b865', padding: 10, fontFamily: SANS, fontSize: 13, color: '#6b4e00' }}>Some sections do not fit in the page limit and are left out. Shorten the text, or use Pro for 3 pages.</div> : null}
      {children}
    </>
  );
}

export function BiodataDocument({ d, style, colour, maxPages, footer }: { d: BiodataData; style: StyleId; colour: Colour; maxPages: number; footer: boolean }) {
  if (style === 'sidebar') return <SidebarDoc d={d} c={colour} maxPages={maxPages} footer={footer} />;
  const f = FRAMES[style]!;
  const { pages, overflow } = paginate(buildSections(d), maxPages, { headerH: f.headerH, charsPerLine: f.cpl });
  const pad = f.pad ?? 56;
  const twoCol = style === 'split-card';
  return (
    <Pages overflow={overflow}>
      {pages.map((secs, i) => {
        const body = (
          <div style={{ padding: pad === 0 ? 0 : pad, paddingTop: pad === 0 && i > 0 ? 56 : pad === 0 ? 0 : pad }}>
            {i === 0 ? f.header(d, colour) : null}
            <div style={{ padding: pad === 0 ? '0 56px' : 0, ...(twoCol ? { columnCount: 2, columnGap: 16 } : {}) }}>
              {secs.map((s) => <Block key={s.id} s={s} st={style} c={colour} labelW={twoCol ? 104 : 150} />)}
            </div>
          </div>
        );
        return (
          <div key={i} className="bio-page" style={pageBox}>
            {f.wrap ? f.wrap(null, colour, i) : null}
            {style === 'premium-full-page' ? <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: colour.main }} /> : null}
            {body}
            {footer ? <Footer /> : null}
          </div>
        );
      })}
    </Pages>
  );
}

export const printCss = '@page{size:A4;margin:0}html,body{margin:0}.bio-page{break-after:page}.bio-page:last-of-type{break-after:auto}.bio-notice{display:none}';
