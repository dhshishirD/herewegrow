// Reads an existing CV (PDF, Word .docx or plain text) in the browser and fills the builder's fields.
// Nothing is uploaded. Parsing is best-effort: CVs vary a lot, so the person checks each section after import.

import { readPdf } from '../lib/pdfText';
import {
  BUILT_IN,
  emptyCv,
  newCustomItem,
  newEducation,
  newExperience,
  newReference,
  newTraining,
  uid,
  type CvData,
  type CustomSection,
} from './model';

export class ImportError extends Error {
  code: 'doc' | 'type' | 'empty' | 'read';
  constructor(code: 'doc' | 'type' | 'empty' | 'read') {
    super(code);
    this.code = code;
  }
}

export async function readCvFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith('.pdf') || file.type === 'application/pdf') return (await readPdf(file)).text;
    if (name.endsWith('.docx')) {
      const mammoth = await import('mammoth/mammoth.browser.min.js');
      const res = await (mammoth as unknown as { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }).extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return res.value;
    }
    if (name.endsWith('.txt')) return await file.text();
  } catch (err) {
    console.error(err);
    throw new ImportError('read');
  }
  if (name.endsWith('.doc')) throw new ImportError('doc');
  throw new ImportError('type');
}

/* ── patterns ─────────────────────────────────────────────────── */

const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const POINT = `(?:${MONTH}\\s*[,'’\`]?\\s*(?:\\d{4}|\\d{2})|\\d{1,2}[/.-]\\d{4}|\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}|\\d{4})`;
const SINCE = new RegExp(`^(?:since|from)\\s+(${POINT})\\s*$`, 'i');
const TRAIL_DATE = /(?:\t|\s{2,})((?:19|20)\d{2}|\d+\+?\s*(?:years?|months?|yrs?))\s*$/i;
const RANGE = new RegExp(`(${POINT})\\s*(?:-|–|—|to|till)\\s*(${POINT}|present|current|till\\s*date|to\\s*date|continuing|running|now|চলমান|বর্তমান)`, 'i');
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /(?:\+?88\s*)?0?\s*1[3-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}/;
const ANY_PHONE = /(?:mobile|phone|cell|contact\s*no\.?|tel)\s*[:\-]?\s*(\+?[\d][\d\s-]{7,16}\d)/i;
const LINKEDIN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i;
const BULLET = /^\s*(?:[•●▪◦○■□➢➤►▸✓✔\-–*]|o\s|\d{1,2}[.)]\s)\s*/;
const DEGREE = /\b(s\.?\s?s\.?\s?c|h\.?\s?s\.?\s?c|ssc|hsc|dakhil|alim|fazil|kamil|o[\s-]?level|a[\s-]?level|diploma|bachelor|master|masters|b\.?\s?sc|m\.?\s?sc|bba|mba|emba|b\.?\s?a\b|m\.?\s?a\b|bss|mss|b\.?\s?com|m\.?\s?com|llb|llm|mbbs|bds|ph\.?\s?d|honours|hons|b\.?\s?ed|m\.?\s?ed|beng|b\.?\s?tech|m\.?\s?phil)\b/i;
const RESULT = /\b(?:c?gpa|cgpa)\s*[:\-]?\s*\d(?:\.\d+)?(?:\s*(?:\/|out of)\s*\d(?:\.\d+)?)?|\b(?:first|second|third)\s+(?:class|division)\b|\b[1-3](?:st|nd|rd)\s+(?:class|division)\b/i;
const YEAR = /\b(19[6-9]\d|20[0-4]\d)\b/g;
const HAS_YEAR = /\b(19[6-9]\d|20[0-4]\d)\b/;
const INSTITUTION = /(university|college|school|institute|madrasa|madrasah|academy|board|polytechnic|বিশ্ববিদ্যালয়|কলেজ|স্কুল|মাদ্রাসা)/i;
const NAME_LIKE = /^(?:(?:dr|md|mr|mrs|ms|prof|engr|professor|mohammad|muhammad)\.?\s+)?[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,4}$/;

type Key = (typeof BUILT_IN)[number] | 'languages' | 'custom' | 'drop';

// Checked in order; the first match wins. Headings are short lines, so "contains" matching is safe enough.
const HEADINGS: [RegExp, Key, string?][] = [
  [/^declaration$|^contacts?(\s+(details|info(rmation)?))?$|^signature/i, 'drop'],
  [/personal\s+(details|information|info|data|particulars)|^personal$|ব্যক্তিগত/i, 'personal'],
  [/language|ভাষা/i, 'languages'],
  [/reference|রেফারেন্স/i, 'references'],
  [/^(trainings?|certifications?|courses?|workshops?|professional\s+(development|training|certifications?)|trainings?\s*(&|and)\s*(certifications?|workshops?|courses?)|certifications?\s*(&|and)\s*trainings?|licen[cs]es?\s*(&|and)\s*certifications?)$|প্রশিক্ষণ/i, 'training'],
  [/education|academic|qualification|credential|শিক্ষা/i, 'education'],
  [/experience|employment|work\s+history|career\s+history|internship|অভিজ্ঞতা/i, 'experience'],
  [/fellowship|scholarship|exchange\s+program|international\s+(programs?|exposure|experience)/i, 'custom', 'Fellowships and International Programs'],
  [/policy\s+(analysis|papers?|briefs?|writing)|selected\s+(writing|analysis)|articles?$|op[\s-]?eds?$|blog/i, 'custom', 'Policy Analysis and Writing'],
  [/leadership|membership|affiliation|committee/i, 'custom', 'Leadership and Memberships'],
  [/project|research/i, 'custom', 'Projects'],
  [/achievement|award|honou?r|accomplishment/i, 'custom', 'Achievements and Awards'],
  [/volunteer|social\s+work/i, 'custom', 'Volunteering'],
  [/extra[\s-]?curricular|co[\s-]?curricular|^activities$/i, 'custom', 'Extracurricular Activities'],
  [/publication/i, 'custom', 'Publications'],
  [/interest|hobb/i, 'custom', 'Interests'],
  [/skill|competenc|expertise|strengths|traits|proficienc|দক্ষতা/i, 'skills'],
  [/summary|objective|profile|about\s+me|career\s+goal|personal\s+statement|সারসংক্ষেপ/i, 'summary'],
];

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|[\s/&-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase()).replace(/\b(And|Of|The|For|In|On|To)\b(?!$)/g, (w, _x, off: number) => (off === 0 ? w : w.toLowerCase()));

/** An ALL-CAPS short line is almost always a section heading, even one we have no name for. */
function unknownHeading(line: string): string | null {
  const clean = line.replace(/[:\-–_|•]+\s*$/, '').replace(/^[^\p{L}]+/u, '').trim();
  const words = clean.split(/\s+/);
  if (clean.length < 4 || clean.length > 48 || words.length > 6 || /[\d.,;:()@]/.test(clean)) return null;
  if (clean !== clean.toUpperCase() || clean === clean.toLowerCase()) return null; // must have letters, all upper case
  if (/^(curriculum vitae|resume|cv|page)\b/i.test(clean)) return null;
  return titleCase(clean);
}

function headingOf(line: string): { key: Key; title?: string } | null {
  // "Selected Policy Analysis (non-peer-reviewed, 2026)": a known heading followed by a note in brackets
  const base = line.replace(/\s*\(.*$/, '');
  if (base !== line && base.trim().split(/\s+/).length <= 5 && !/[.,;:]$/.test(line.trim()) && /\)\s*$/.test(line)) {
    const known = HEADINGS.find(([re]) => re.test(base));
    if (known && known[1] === 'custom') return { key: known[1], title: known[2] };
  }
  const clean = line.replace(/[:\-–_|•]+\s*$/, '').replace(/^[^\p{L}]+/u, '').trim();
  if (!clean || clean.length > 42 || /\d/.test(clean) || /[.,;]$/.test(clean) || clean.split(/\s+/).length > 5) return null;
  if (/:\s*\S/.test(clean) || /[()]|\s[—–-]\s/.test(clean)) return null;
  for (const [re, key, title] of HEADINGS) if (re.test(clean)) return { key, title };
  return null;
}

const stripBullet = (s: string) => s.replace(BULLET, '').trim();
const isBullet = (s: string) => BULLET.test(s);

/* ── parser ───────────────────────────────────────────────────── */

export interface ImportResult {
  data: CvData;
  /** Which parts were filled, for the confirmation message. */
  found: string[];
}

export function parseCv(raw: string): ImportResult {
  // Keep tabs (and wide gaps, which become tabs): they separate columns like "Job title<tab>2024".
  const text = raw.replace(/\r/g, '').replace(/\u00a0/g, ' ').replace(/ *\t[\t ]*/g, '\t').replace(/ {3,}/g, '\t').replace(/ {2}/g, ' ');
  const allLines = text.split('\n').map((l) => l.replace(/^\t+|\t+$/g, '').trim()).filter(Boolean);
  const d = emptyCv();
  const found: string[] = [];

  // Split into sections by heading lines.
  const blocks: { key: Key | 'header'; title?: string; lines: string[] }[] = [{ key: 'header', lines: [] }];
  for (const line of allLines) {
    let h = headingOf(line);
    // After the first real heading, an unrecognised ALL-CAPS line starts its own section instead of joining the one above
    if (!h && blocks.length > 1) {
      const title = unknownHeading(line);
      if (title) h = { key: 'custom', title };
    }
    if (h) blocks.push({ key: h.key, title: h.title, lines: [] });
    else blocks[blocks.length - 1].lines.push(line);
  }

  // Contact details can sit anywhere.
  d.email = text.match(EMAIL)?.[0] ?? '';
  d.phone = text.match(PHONE)?.[0]?.trim() ?? text.match(ANY_PHONE)?.[1]?.trim() ?? '';
  d.linkedin = text.match(LINKEDIN)?.[0]?.replace(/^https?:\/\/(www\.)?/i, '') ?? '';

  // Name and headline: first plain lines of the header.
  const header = blocks[0].lines;
  const plainHeader = header.filter((l) => !EMAIL.test(l) && !PHONE.test(l) && !ANY_PHONE.test(l) && !LINKEDIN.test(l) && !/curriculum vitae|^resume$|^cv$|^(contact|profile|address)$/i.test(l));
  const nameLine = plainHeader.filter((l) => !/linkedin|\bid\b/i.test(l)).find((l) => l.split(' ').length <= 6 && /\p{L}/u.test(l) && !/\d/.test(l));
  if (nameLine) {
    d.name = nameLine.replace(/\s+/g, ' ');
    const after = plainHeader.slice(plainHeader.indexOf(nameLine) + 1).find((l) => l.length < 70 && !/address|linkedin|\bid\b|:/i.test(l));
    if (after && !/(road|house|village|thana|upazila|district|dhaka-\d)/i.test(after)) d.headline = after;
  }
  const addr = header.find((l) => !/nationality|religion|birth/i.test(l) && /address|dhaka|chattogram|chittagong|sylhet|khulna|rajshahi|barishal|rangpur|mymensingh|bangladesh/i.test(l) && !EMAIL.test(l) && l !== d.name && l !== d.headline);
  if (!addr) {
    // "phone | email | City" contact lines
    const seg = header.flatMap((l) => l.split(/\s*[|\t•]\s*/)).find((x) => x && !EMAIL.test(x) && !PHONE.test(x) && !LINKEDIN.test(x) && x !== d.name && x !== d.headline && /^[A-Z][\w.' -]+,\s*[A-Z][\w' -]+$/.test(x));
    if (seg) d.location = seg;
  }
  if (addr) d.location = addr.replace(/^.*address\s*[:\-]\s*/i, '').replace(PHONE, '').replace(EMAIL, '').replace(/[|,\s]+$/, '').trim();
  if (d.name || d.email || d.phone) found.push('contact');

  // Personal key-value lines can sit anywhere (often in a table).
  const kv = (re: RegExp) => {
    const m = text.match(re);
    return m ? m[1].replace(/\s+/g, ' ').trim().replace(/[,.;]$/, '') : '';
  };
  d.father = kv(/father'?s?\s*name\s*[:\-]?\s*([^\n]+)/i);
  d.mother = kv(/mother'?s?\s*name\s*[:\-]?\s*([^\n]+)/i);
  d.dob = kv(/date\s*of\s*birth\s*[:\-]?\s*([^\n]+)/i);
  d.gender = kv(/\b(?:gender|sex)\s*[:\-]\s*([^\n]+)/i);
  d.marital = kv(/marital\s*status\s*[:\-]?\s*([^\n]+)/i);
  d.nationality = kv(/nationality\s*[:\-]?\s*([^\n]+)/i) || 'Bangladeshi';
  d.religion = kv(/religion\s*[:\-]?\s*([^\n]+)/i);
  d.presentAddress = kv(/(?:present|current|mailing)\s*address\s*[:\-]?\s*([^\n]+)/i);
  d.permanentAddress = kv(/permanent\s*address\s*[:\-]?\s*([^\n]+)/i);
  if (d.father || d.mother || d.dob) {
    d.showPersonal = true;
    found.push('personal');
  }

  const order: string[] = [];
  const pushOrder = (k: string) => { if (!order.includes(k)) order.push(k); };

  for (const b of blocks.slice(1)) {
    const L = b.lines.filter((l) => !/^(page \d+|\d+\s*\/\s*\d+)$/i.test(l));
    if (!L.length) continue;

    if (b.key === 'summary') {
      d.summary = L.map(stripBullet).join(' ').replace(/\s+/g, ' ');
      pushOrder('summary');
      found.push('summary');
    } else if (b.key === 'experience') {
      d.experience.push(...parseExperience(L));
      if (d.experience.length) { pushOrder('experience'); found.push(`experience:${d.experience.length}`); }
    } else if (b.key === 'education') {
      d.education.push(...parseEducation(L));
      if (d.education.length) { pushOrder('education'); found.push(`education:${d.education.length}`); }
    } else if (b.key === 'skills') {
      // Split "Excel, Word, PowerPoint" into items, but keep sentence-like lines whole.
      const items = L.flatMap((l) => {
        const line = stripBullet(l).replace(/^[^:]{2,30}:\s*/, '');
        const parts = line.split(/\s*[,;|•\t]\s*/).map((x) => x.replace(/^(and|&)\s+/i, '').trim()).filter(Boolean);
        return parts.every((x) => x.split(/\s+/).length <= 4) ? parts : [line.replace(/[.;]$/, '')];
      }).filter((x) => x.length > 1 && x.length < 120);
      d.skills = [...new Set([...(d.skills ? d.skills.split('\n') : []), ...items])].join('\n');
      pushOrder('skills');
      found.push('skills');
    } else if (b.key === 'languages') {
      d.languages = L.map(stripBullet).join(', ').replace(/\s*,\s*,/g, ',');
      pushOrder('skills');
    } else if (b.key === 'training') {
      d.training.push(...parseTraining(L));
      if (d.training.length) { pushOrder('training'); found.push(`training:${d.training.length}`); }
    } else if (b.key === 'references') {
      d.references.push(...parseReferences(L));
      if (d.references.length) { pushOrder('references'); found.push(`references:${d.references.length}`); }
    } else if (b.key === 'custom' && b.title && b.title !== '__drop') {
      const section: CustomSection = { id: uid(), title: b.title, items: parseCustom(L) };
      if (section.items.length) {
        d.custom.push(section);
        pushOrder(`custom:${section.id}`);
        found.push(`custom:${b.title}`);
      }
    } else if (b.key === 'personal') {
      pushOrder('personal');
    }
  }

  if (!d.languages) {
    const m = text.match(/languages?(?:\s+known)?\s*[:\-]\s*([^\n]+)/i);
    if (m) d.languages = m[1].trim();
  }

  for (const k of BUILT_IN) pushOrder(k);
  for (const c of d.custom) pushOrder(`custom:${c.id}`);
  d.order = order;
  return { data: d, found };
}

/** Splits lines into entries: a new entry starts at a non-bullet line that follows bullets, or at a line with a date range when the current entry already has one. */
function chunk(lines: string[], isStart: (line: string, current: string[]) => boolean): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  for (const l of lines) {
    if (cur.length && isStart(l, cur)) {
      out.push(cur);
      cur = [];
    }
    cur.push(l);
  }
  if (cur.length) out.push(cur);
  return out;
}

const isHeaderish = (l: string) => !isBullet(l) && l.length < 85 && !/[.;]$/.test(l);
const hasDate = (l: string) => RANGE.test(l) || SINCE.test(l) || TRAIL_DATE.test(l);

function parseExperience(lines: string[]) {
  const groups = chunk(lines, (l, cur) => {
    const body = cur.some((x) => !isHeaderish(x));
    if (body && isHeaderish(l) && (hasDate(l) || !isHeaderish(cur[cur.length - 1]))) return true;
    if (hasDate(l) && cur.some(hasDate) && cur.length > 1) return true;
    return false;
  });

  return groups.map((g) => {
    const e = newExperience();
    const rest: string[] = [];
    const head: string[] = [];
    for (let l of g) {
      const range = l.match(RANGE);
      const since = l.match(SINCE);
      const trail = l.match(TRAIL_DATE);
      if (!e.start && (range || since || (trail && isHeaderish(l)))) {
        if (range) {
          e.start = range[1].trim();
          const end = range[2].trim();
          if (/present|current|till|to\s*date|continuing|running|now|চলমান|বর্তমান/i.test(end)) e.current = true;
          else e.end = end;
          l = l.replace(RANGE, '');
        } else if (since) {
          e.start = since[1].trim();
          e.current = true;
          l = '';
        } else if (trail) {
          e.start = trail[1].trim();
          l = l.replace(TRAIL_DATE, '');
        }
        l = l.replace(/^(since|from|duration|period|time)\s*[:\-]?\s*/i, '').replace(/[|,()\s–—-]+$/, '').trim();
        if (!l) continue;
      }
      const labelled = l.match(/^(designation|position|job title|role|company|organi[sz]ation|employer|location|department)\s*[:\-]\s*(.+)$/i);
      if (labelled) {
        const k = labelled[1].toLowerCase();
        if (/designation|position|title|role/.test(k)) e.role = labelled[2];
        else if (/company|organi|employer/.test(k)) e.org = labelled[2];
        else if (k === 'location') e.location = labelled[2];
        else rest.push(l);
        continue;
      }
      // "Company, City as Role | Team size: …"
      const asRole = l.match(/^(.{3,80}?)\s+as\s+(?:an?\s+)?([^|]{3,60})(?:\s*\|.*)?$/i);
      if (asRole && !e.role && isHeaderish(l)) {
        e.org = asRole[1].trim();
        e.role = asRole[2].trim();
        continue;
      }
      if (/^(job\s+)?responsibilit(y|ies)|^key\s+(duties|responsibilities|result areas)|^duties|^achievements?|^please confirm/i.test(l)) continue;
      if (isBullet(l) || !isHeaderish(l) || head.length >= 2) rest.push(stripBullet(l));
      else head.push(l.replace(/\t+/g, ' ').trim());
    }
    // "Organisation | Role" on one line
    const piped = !e.role && head[0]?.match(/^(.{3,90}?)\s+\|\s+(.{3,60})$/);
    if (piped && !RANGE.test(head[0])) {
      head.shift();
      e.org = e.org || piped[1].trim();
      e.role = piped[2].trim();
    }
    if (!e.role && head[0]) e.role = head.shift()!;
    if (!e.org && head[0]) e.org = head.shift()!;
    if (e.org && !e.location) {
      const parts = e.org.split(/,\s*/);
      if (parts.length > 1 && parts[parts.length - 1].length < 25) {
        e.location = parts.pop()!;
        e.org = parts.join(', ');
      }
    }
    rest.push(...head);
    const merged: string[] = [];
    for (const r of rest) {
      if (merged.length && /^[a-z(]/.test(r)) merged[merged.length - 1] += ` ${r}`;
      else merged.push(r);
    }
    e.bullets = merged.join('\n');
    return e;
  }).filter((e) => e.role || e.org || e.bullets);
}

const TABLE_HEAD = /^(exam(ination)?|degree|name of (exam|degree)|institut|board|year|result|cgpa|gpa|passing|group|subject|major|division|class)\b/i;

function parseEducation(lines: string[]) {
  const rows = lines.filter((l) => {
    const cells = l.split('\t');
    return !(cells.length >= 3 && cells.filter((c) => TABLE_HEAD.test(c.trim())).length >= 2);
  });
  const groups = chunk(rows, (l, cur) => (DEGREE.test(l) || l.includes('\t')) && cur.some((x) => DEGREE.test(x)));
  return groups.map((g) => {
    const e = newEducation();
    const joined = g.join(' \t ');
    e.result = joined.match(RESULT)?.[0]?.replace(/\s+/g, ' ') ?? '';
    const years = joined.match(YEAR);
    e.year = years ? years[years.length - 1] : '';

    // Table row: cells separated by tabs.
    const cells = g.flatMap((l) => l.split('\t')).map((c) => c.trim()).filter(Boolean);
    let deg = cells.find((c) => DEGREE.test(c)) ?? cells[0] ?? '';
    let inst = cells.find((c) => c !== deg && INSTITUTION.test(c) && !/^(national university|.*\bboard)$/i.test(c)) ?? cells.find((c) => c !== deg && INSTITUTION.test(c)) ?? '';

    // "BA (Bachelor of Arts) from M.C. College, Sylhet" or "2012: BA … from …"
    deg = deg.replace(/^(19|20)\d{2}\s*[:\-–]\s*/, '');
    const from = deg.match(/^(.+?)\s+(?:from|at)\s+(.+)$/i);
    if (from) {
      deg = from[1];
      if (!inst) inst = from[2];
    } else if (!inst && INSTITUTION.test(deg) && /,/.test(deg)) {
      const [first, ...more] = deg.split(/\s*,\s*/);
      deg = first;
      inst = more.join(', ');
    }
    deg = stripBullet(deg.replace(RESULT, '').replace(YEAR, '')).replace(/[|,:\s–-]+$/, '').replace(/^[|,:\s–-]+/, '').trim();
    const major = deg.match(/\(([^)]+)\)/) ?? deg.match(/\b(?:in|on)\s+(.+)$/i);
    if (major && !/bachelor|master/i.test(major[1])) {
      e.major = major[1].replace(new RegExp(`\\|.*$|\\b${MONTH}\\b.*$`, 'i'), '').trim();
      e.degree = deg.replace(major[0], '').trim();
    } else e.degree = deg.replace(/\s*\((?:bachelor|master)[^)]*\)/i, '').trim();
    const group = joined.match(/\b(?:group|major|subject|department)\s*[:\-]\s*([A-Za-z &]+)/i);
    if (group && !e.major) e.major = group[1].trim();
    e.institution = inst.replace(/^(institute|institution|university|board)\s*[:\-]\s*/i, '').replace(RESULT, '').replace(YEAR, '').replace(/[|,:()\s–-]+$/, '').trim();
    const used = new Set([deg, inst, e.result, e.year]);
    e.details = g.filter((l) => !l.includes('\t') && !DEGREE.test(l) && !INSTITUTION.test(l) && !RESULT.test(l) && !/^(\d{4}|year|result|passing|group|major|board|subject)/i.test(l) && !used.has(l)).map(stripBullet).join('\n');
    return e;
  }).filter((e) => e.degree || e.institution);
}

function parseTraining(lines: string[]) {
  const groups = chunk(lines, (l, cur) => isBullet(l) || (!/^(organi[sz]ed|conducted|by|duration|year|venue|institute|topic)\b/i.test(l) && /^[A-Z]/.test(l) && cur.length >= 1 && (HAS_YEAR.test(cur.join(' ')) || cur.length >= 3)));
  return groups.map((g) => {
    const t = newTraining();
    const joined = g.join(' ');
    const years = joined.match(YEAR);
    t.year = years ? years[years.length - 1] : '';
    t.duration = joined.match(/\b\d+\s*(?:days?|weeks?|months?|hours?|hrs?)\b/i)?.[0] ?? '';
    const [first, ...rest] = g.map(stripBullet);
    const parts = first.split(/\s*[,|–-]\s*/);
    t.name = (first.match(/^(?:training|course|title)\s*[:\-]\s*(.+)/i)?.[1] ?? parts[0]).replace(YEAR, '').trim();
    const orgLine = rest.find((l) => /organi[sz]ed|conducted|institute|academy|center|centre|university|bibm|bim|bitac|by\s/i.test(l)) ?? parts.slice(1).find((p) => !HAS_YEAR.test(p) && p.length > 3);
    if (orgLine) t.org = orgLine.replace(/^(organi[sz]ed|conducted)\s*by\s*[:\-]?\s*|^(institute|organi[sz]ation)\s*[:\-]\s*/i, '').replace(YEAR, '').replace(/[|,()\s–-]+$/, '').trim();
    t.details = rest.filter((l) => l !== orgLine && !/^(duration|year)\s*[:\-]/i.test(l)).join('\n');
    return t;
  }).filter((t) => t.name);
}

function parseReferences(lines: string[]) {
  const groups = chunk(lines.filter((l) => !/available\s+(up)?on\s+request/i.test(l)), (l, cur) => NAME_LIKE.test(stripBullet(l)) && !/@/.test(l) && cur.some((x) => EMAIL.test(x) || PHONE.test(x) || x.length > 3) && cur.length >= 2);
  return groups.map((g) => {
    const r = newReference();
    for (const raw of g.map(stripBullet)) {
      const l = raw.replace(/^(name|designation|organi[sz]ation|mobile|phone|cell|email|e-mail|relation)\s*[:\-]\s*/i, '');
      if (EMAIL.test(raw) || PHONE.test(raw)) {
        r.email = r.email || raw.match(EMAIL)?.[0] || '';
        r.phone = r.phone || raw.match(PHONE)?.[0]?.trim() || '';
      } else if (/^relation/i.test(raw)) r.relation = l;
      else if (!r.name) r.name = l;
      else if (!r.title) r.title = l;
      else if (!r.org) r.org = l;
    }
    return r;
  }).filter((r) => r.name);
}

function parseCustom(lines: string[]) {
  const clean = lines.map(stripBullet).filter(Boolean);
  if (clean.every((l) => l.length < 100)) {
    return clean.map((l) => {
      const years = l.match(YEAR);
      return newCustomItem({ title: l.replace(/\s*[(,–-]?\s*(19|20)\d{2}\s*\)?\s*$/, '').trim(), date: years && /(19|20)\d{2}\s*\)?\s*$/.test(l) ? years[years.length - 1] : '' });
    });
  }
  return [newCustomItem({ details: clean.join('\n') })];
}
