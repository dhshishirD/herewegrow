// Marriage biodata: the 10 layouts, their SEO copy and page text. Shared by the maker, the hub and
// style pages (src/) and the build-time prerender (scripts/seo.ts). No layout code here.

export type BiodataStyleId = 'classic-serif' | 'royal-frame' | 'sidebar' | 'top-banner' | 'minimal-clean' | 'split-card' | 'photo-first' | 'timeline' | 'premium-full-page' | 'two-tone-diagonal';

export interface PageSeo { title: string; description: string; h1: string }

export interface BiodataStyle {
  id: BiodataStyleId;
  /** URL slug: /templates/biodata-<slug>. Same as id. */
  slug: BiodataStyleId;
  name: string;
  group: 'Dignified' | 'Modern' | 'Personality' | 'Significant';
  note: string;
  free: boolean;
  seo: PageSeo;
  /** 80 to 110 words on the style page. Describes only what the layout really has. */
  blurb: string;
  bestFor: string;
}

export const BIODATA_UPDATED = '2026-11-18';
export const BIODATA_HUB_PATH = '/templates/category/marriage-biodata';
export const BIODATA_MAKER_PATH = '/biodata';
export const biodataStylePath = (slug: string) => `/templates/biodata-${slug}`;
export const biodataPreview = (slug: string) => `/biodata/${slug}-p1.webp`;

export const BIODATA_HUB: PageSeo = {
  title: 'Biodata Format for Marriage: Free Designs | HereWeGrow',
  description: 'বিয়ের বায়োডাটা ফরম্যাট: 10 modern designs to edit online. Pick a colour, add your details, download a PDF. No sign-up, works on your phone.',
  h1: 'Biodata Format for Marriage: 10 Designs You Can Edit',
};

export const BIODATA_MAKER: PageSeo = {
  title: 'Marriage Biodata Maker: Make PDF Online | HereWeGrow',
  description: 'Make a marriage biodata in 5 minutes on your phone. Choose a design and colour, fill in your details, download a PDF. Your details stay on your device.',
  h1: 'Marriage Biodata Maker',
};

const S = (id: BiodataStyleId, name: string, group: BiodataStyle['group'], note: string, free: boolean, seo: PageSeo, blurb: string, bestFor: string): BiodataStyle => ({ id, slug: id, name, group, note, free, seo, blurb, bestFor });

export const BIODATA_STYLES: BiodataStyle[] = [
  S('classic-serif', 'Classic Serif', 'Dignified', 'Traditional serif with a gold rule.', true,
    { title: 'Classic Marriage Biodata Format (Serif) | HereWeGrow', description: 'A dignified, traditional marriage biodata format in serif type with gold rules and a clear photo corner. Free to start. Edit online, download a PDF.', h1: 'Classic Serif Marriage Biodata Format' },
    'A traditional layout for families who prefer a formal first impression. The name sits in a serif headline above a gold double rule, with the photo in the corner. Each part, such as personal details, education and family, has its own heading with a thin gold line, so the page reads quickly from top to bottom.',
    'formal introductions, printing, and older relatives.'),
  S('royal-frame', 'Royal Frame', 'Dignified', 'Double border frame, centred and formal.', false,
    { title: 'Royal Frame Marriage Biodata Format | HereWeGrow', description: 'A formal marriage biodata with a centred name, arch-shaped photo and a double border frame. Choose from 10 colours, edit online, download a PDF.', h1: 'Royal Frame Marriage Biodata Format' },
    'A ceremonial layout. The whole page sits inside a double border, the photo is cut in an arch, and the name and section headings are centred. It feels rich without being crowded, and every section keeps the same calm spacing.',
    'families who like a rich, formal look.'),
  S('sidebar', 'Sidebar', 'Modern', 'Colour column with photo and contact.', false,
    { title: 'Sidebar Marriage Biodata Template | HereWeGrow', description: 'A modern marriage biodata template: coloured sidebar for photo, key facts and guardian contact, clean main column. Edit online, download a PDF.', h1: 'Sidebar Marriage Biodata Template' },
    'Key facts stay in a coloured column on the left: photo, name, personal details and the guardian contact. The main column holds education, profession, family, address and your own words. A reader can find height, age and contact at a glance.',
    'modern biodatas shared as a PDF or image.'),
  S('top-banner', 'Top Banner', 'Modern', 'Bold colour banner with name and photo.', false,
    { title: 'Top Banner Marriage Biodata Template | HereWeGrow', description: 'A modern marriage biodata template with a wide coloured banner for your name and photo. Easy to read on paper and on a phone. Edit online, download a PDF.', h1: 'Top Banner Marriage Biodata Template' },
    'A wide coloured band across the top holds the name and the photo. Below it, each section has a colour edge on its heading and plenty of space between lines, which keeps the page readable on a small phone screen.',
    'sharing on WhatsApp and reading on a phone.'),
  S('minimal-clean', 'Minimal Clean', 'Modern', 'Lots of white space, one accent line.', true,
    { title: 'Minimal Marriage Biodata Format, Clean | HereWeGrow', description: 'A clean, minimal marriage biodata format with a large name, one accent line and plenty of white space. Free to start. Edit online, download a PDF.', h1: 'Minimal Clean Marriage Biodata Format' },
    'A large name, one short accent line and small capital headings. There are no boxes and no decoration, only well-spaced rows of details. It is a quiet, confident page that also prints well in black and white.',
    'people who want a quiet, confident page, and for printing.'),
  S('split-card', 'Split Card', 'Modern', 'Soft cards in two columns.', false,
    { title: 'Card Style Marriage Biodata Template | HereWeGrow', description: 'A marriage biodata template with a colour name card and soft tinted cards for personal details, family, education and work. Edit online, download a PDF.', h1: 'Card Style Marriage Biodata Template' },
    'The name sits on a colour card, and each part of the biodata sits on its own soft tinted card, arranged in two columns. The page is easy to scan and easy for a parent to read aloud.',
    'busy readers who scan quickly.'),
  S('photo-first', 'Photo First', 'Personality', 'Large photo leads the page.', false,
    { title: 'Marriage Biodata Format with Big Photo | HereWeGrow', description: 'A marriage biodata format that opens with a large photo and a bold name, with clear sections below. Edit online, choose a colour and download a PDF.', h1: 'Marriage Biodata Format with a Big Photo' },
    'The photo opens the page, large and framed, with your name beside it in bold type. Clear sections follow below. If you have no photo, the name simply takes the space, though another style may suit you better.',
    'people with a good, clear portrait.'),
  S('timeline', 'Timeline', 'Personality', 'Sections along a vertical line.', false,
    { title: 'Marriage Biodata Format with Timeline | HereWeGrow', description: 'A marriage biodata format where each section hangs on a vertical timeline with a round photo. A warm, personal design. Edit online, download a PDF.', h1: 'Marriage Biodata Format with a Timeline' },
    'A round photo and name open the page, and every section hangs on a vertical line with a dot, like a short story told in order. It feels personal rather than like a form.',
    'people who want a warm, personal tone.'),
  S('premium-full-page', 'Premium Full Page', 'Significant', 'Full-colour header and section bars.', false,
    { title: 'Premium Full Page Marriage Biodata Template | HereWeGrow', description: 'A premium marriage biodata template with a deep colour header, gold edge and colour section bars. Choose from 10 colours. Edit online, download a PDF.', h1: 'Premium Full Page Marriage Biodata Template' },
    'A deep colour header with a gold edge, a colour strip down the page edge and full-width section bars in serif type. The strong colour makes even a short biodata look complete and polished.',
    'a polished, premium look.'),
  S('two-tone-diagonal', 'Two-Tone Diagonal', 'Significant', 'Diagonal colour cut behind the name.', false,
    { title: 'Modern Diagonal Marriage Biodata Template | HereWeGrow', description: 'A bold marriage biodata template with a diagonal colour header, gold edge and round photo on the right. Edit online, choose a colour, download a PDF.', h1: 'Modern Diagonal Marriage Biodata Template' },
    'A diagonal colour cut with a thin gold edge gives the top of the page energy, while the body stays plain and readable. The name sits on the colour and the round photo on the right.',
    'a younger, confident tone.'),
];

export const biodataStyleBySlug = (slug: string) => BIODATA_STYLES.find((s) => s.slug === slug);

/** SEO for the maker, the hub and a style page, or undefined for any other path. */
export function biodataSeo(path: string): PageSeo | undefined {
  if (path === BIODATA_MAKER_PATH) return BIODATA_MAKER;
  if (path === BIODATA_HUB_PATH) return BIODATA_HUB;
  const m = path.match(/^\/templates\/biodata-([a-z0-9-]+)$/);
  return m ? biodataStyleBySlug(m[1])?.seo : undefined;
}

export const BIODATA_FAQ: { q: string; a: string }[] = [
  { q: 'What should a marriage biodata include?', a: 'Your name, age, height, education, work, family, religion and a few lines about yourself. Add a guardian contact and, if you wish, what you look for in a partner. Keep it short: two pages is best.' },
  { q: 'Is the biodata maker free?', a: 'Yes. Two designs (Classic Serif and Minimal Clean) in three colours download free as a PDF, with a small herewegrow.pro line at the bottom. All 10 designs, all 10 colours and a third page come with Pro.' },
  { q: 'Can I download a Word file or a WhatsApp image?', a: 'The maker gives a PDF free. Pro also gives a Word file and a PNG image per page for WhatsApp. Ready-made Word marriage biodata templates start at ৳29.' },
  { q: 'Are my details saved on your server?', a: 'No. The form is filled in your browser and kept on your own device only. We do not send your biodata to a server.' },
  { q: 'How long should a biodata be?', a: 'One or two A4 pages. Add a third only if you really need it. Long text is easier to read when it is split into short sections.' },
  { q: 'Which design is best for printing and which for WhatsApp?', a: 'Minimal Clean and Classic Serif print well, even in black and white. Top Banner and Sidebar read well on a phone screen.' },
];

export const BIODATA_HUB_BN = ['বিয়ের বায়োডাটা ফরম্যাট বাছাই করুন, রং ঠিক করুন, আপনার তথ্য লিখে PDF নামান।', 'ফোনেই ৫ মিনিটে হয়ে যায়, সাইন-আপ লাগে না।'];
