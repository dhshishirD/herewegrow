// Fonts the person can pick for their CV. "default" keeps each design's own pairing.
// Web fonts load from Google Fonts only when needed: the chosen one on the page, all of them when the picker opens.
// `word` is the font name written into the Word file (Word substitutes a close font if it is not installed).

export interface CvFont {
  id: string;
  name: string;
  /** Body text stack. */
  body: string;
  /** Name, headings. Same as body unless the font is a pairing. */
  head: string;
  /** Google Fonts css2 family spec, e.g. "Roboto:wght@300..700". Unset for bundled or system fonts. */
  google?: string[];
  word: string;
  kind: 'sans' | 'serif';
}

const BN = '"Hind Siliguri"';
const sans = (f: string) => `"${f}", ${BN}, Arial, sans-serif`;
const serif = (f: string) => `"${f}", ${BN}, Georgia, serif`;
const one = (id: string, name: string, kind: 'sans' | 'serif', google?: string, word = name): CvFont => {
  const stack = kind === 'sans' ? sans(name) : serif(name);
  return { id, name, body: stack, head: stack, google: google ? [google] : undefined, word, kind };
};

export const CV_FONTS: CvFont[] = [
  { id: 'default', name: 'Design default', body: '', head: '', word: 'Calibri', kind: 'sans' },
  { ...one('inter', 'Inter', 'sans'), body: sans('Inter Variable'), head: sans('Inter Variable') },
  one('roboto', 'Roboto', 'sans', 'Roboto:wght@300..700'),
  one('open-sans', 'Open Sans', 'sans', 'Open+Sans:wght@300..800'),
  one('lato', 'Lato', 'sans', 'Lato:wght@300;400;700'),
  one('montserrat', 'Montserrat', 'sans', 'Montserrat:wght@300..700'),
  one('poppins', 'Poppins', 'sans', 'Poppins:wght@300;400;500;600;700'),
  one('source-sans', 'Source Sans 3', 'sans', 'Source+Sans+3:wght@300..700'),
  one('raleway', 'Raleway', 'sans', 'Raleway:wght@300..700'),
  one('nunito-sans', 'Nunito Sans', 'sans', 'Nunito+Sans:wght@300..800'),
  one('work-sans', 'Work Sans', 'sans', 'Work+Sans:wght@300..700'),
  { ...one('calibri', 'Calibri', 'sans', 'Carlito:wght@400;700'), body: `Calibri, Carlito, ${BN}, Arial, sans-serif`, head: `Calibri, Carlito, ${BN}, Arial, sans-serif` },
  { ...one('arial', 'Arial', 'sans'), body: `Arial, Helvetica, ${BN}, sans-serif`, head: `Arial, Helvetica, ${BN}, sans-serif` },
  one('merriweather', 'Merriweather', 'serif', 'Merriweather:wght@300;400;700'),
  one('lora', 'Lora', 'serif', 'Lora:wght@400..700'),
  one('garamond', 'EB Garamond', 'serif', 'EB+Garamond:wght@400..700'),
  { ...one('georgia', 'Georgia', 'serif'), body: `Georgia, ${BN}, serif`, head: `Georgia, ${BN}, serif` },
  { ...one('times', 'Times New Roman', 'serif'), body: `"Times New Roman", Times, ${BN}, serif`, head: `"Times New Roman", Times, ${BN}, serif` },
  {
    id: 'playfair-lato', name: 'Playfair + Lato', body: sans('Lato'), head: serif('Playfair Display'),
    google: ['Playfair+Display:wght@400..700', 'Lato:wght@300;400;700'], word: 'Lato', kind: 'serif',
  },
  {
    id: 'montserrat-opensans', name: 'Montserrat + Open Sans', body: sans('Open Sans'), head: sans('Montserrat'),
    google: ['Montserrat:wght@300..700', 'Open+Sans:wght@300..800'], word: 'Open Sans', kind: 'sans',
  },
];

export const findFont = (id?: string) => CV_FONTS.find((f) => f.id === id) ?? CV_FONTS[0];

const loaded = new Set<string>();
function loadFamilies(specs: string[]) {
  const todo = specs.filter((s) => !loaded.has(s));
  if (!todo.length || typeof document === 'undefined') return;
  todo.forEach((s) => loaded.add(s));
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${todo.map((s) => `family=${s}`).join('&')}&display=swap`;
  document.head.appendChild(link);
}

/** Load one font's files (no-op for bundled and system fonts). */
export const ensureFont = (id?: string) => loadFamilies(findFont(id).google ?? []);
/** Load every font, so the picker can show each name in its own face. */
export const ensureAllFonts = () => loadFamilies(CV_FONTS.flatMap((f) => f.google ?? []));
