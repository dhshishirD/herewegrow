// Reads an existing biodata (PDF, Word .docx or text) in the browser and fills the maker's fields.
// Nothing is uploaded. Best effort: only values found next to a known label are used, nothing is guessed.
// The person checks every field after import.

import { emptyBiodata, type BiodataData } from './model';

type TextField = Exclude<keyof BiodataData, 'education' | 'photo'>;

const P = (s: string) => new RegExp(`^(?:${s})$`, 'i');
const LABELS: [TextField | 'address' | 'education', RegExp][] = [
  ['fatherOcc', P("(?:father'?s?|পিতার|বাবার)\\s*(?:occupation|profession|job|পেশা)")],
  ['motherOcc', P("(?:mother'?s?|মাতার|মায়ের)\\s*(?:occupation|profession|job|পেশা)")],
  ['father', P("father(?:'?s?\\s*name)?|পিতার\\s*নাম|পিতা|বাবার\\s*নাম")],
  ['mother', P("mother(?:'?s?\\s*name)?|মাতার\\s*নাম|মাতা|মায়ের\\s*নাম")],
  ['name', P("(?:full\\s*|candidate'?s?\\s*)?name|নাম")],
  ['dob', P('date\\s*of\\s*birth|d\\.?o\\.?b\\.?|birth\\s*date|born|জন্ম\\s*তারিখ|জন্মতারিখ')],
  ['age', P('age|বয়স')],
  ['height', P('height|উচ্চতা')],
  ['weight', P('weight|ওজন')],
  ['complexion', P('complexion|skin\\s*(?:tone|colou?r)?|গায়ের\\s*রং|গাত্রবর্ণ|বর্ণ')],
  ['bloodGroup', P('blood\\s*group|blood|রক্তের\\s*গ্রুপ|রক্ত')],
  ['religion', P('religion|ধর্ম')],
  ['maritalStatus', P('marital\\s*status|marital|বৈবাহিক\\s*অবস্থা')],
  ['occupation', P('occupation|profession|job|designation|পেশা')],
  ['employer', P('work\\s*place|workplace|company|employer|organi[sz]ation|institution\\s*of\\s*work|কর্মস্থল')],
  ['brothers', P('brothers?|no\\.?\\s*of\\s*brothers|ভাই')],
  ['sisters', P('sisters?|no\\.?\\s*of\\s*sisters|বোন')],
  ['familyType', P('family\\s*type|family\\s*status|পারিবারিক\\s*অবস্থা')],
  ['presentAddress', P('present\\s*address|current\\s*address|বর্তমান\\s*ঠিকানা')],
  ['permanentAddress', P('permanent\\s*address|village|home\\s*town|স্থায়ী\\s*ঠিকানা')],
  ['address', P('address|ঠিকানা')],
  ['guardianName', P('guardian(?:\'?s?\\s*name)?|contact\\s*person|অভিভাবক')],
  ['guardianRelation', P('relation(?:ship)?|সম্পর্ক')],
  ['phone', P('phone|mobile|cell|contact(?:\\s*no\\.?|\\s*number)?|whatsapp|মোবাইল|ফোন|যোগাযোগ')],
  ['email', P('e-?mail|ইমেইল')],
  ['about', P('about\\s*(?:me|myself)|summary|self\\s*description|নিজের\\s*সম্পর্কে')],
  ['expectations', P('partner\\s*expectations?|expectations?|looking\\s*for|preferred\\s*partner|প্রত্যাশা|পাত্র(?:ী)?র\\s*প্রত্যাশা')],
  ['education', P('education(?:al)?(?:\\s*qualifications?)?|qualifications?|শিক্ষাগত\\s*যোগ্যতা|শিক্ষা')],
];

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const YEAR = /\b(?:19|20)\d{2}\b/;
const SKIP_TITLE = /bio-?\s?data|marriage|matrimon|বায়োডাটা|বিয়ের|resume|curriculum/i;

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/^[\s:–—-]+|[\s:–—-]+$/g, '');

function labelOf(raw: string): TextField | 'address' | 'education' | null {
  const l = clean(raw.toLowerCase().replace(/[’`]/g, "'"));
  return LABELS.find(([, re]) => re.test(l))?.[0] ?? null;
}

/** Splits "Label: value", "Label<tab>value" or "Label   value" into its parts. */
function splitLine(line: string): [string, string] | null {
  const colon = line.search(/[:：]/);
  if (colon > 0) return [line.slice(0, colon), clean(line.slice(colon + 1))];
  const gap = line.search(/\t|\s{2,}/);
  if (gap > 0) return [line.slice(0, gap), clean(line.slice(gap))];
  return null;
}

function eduRow(line: string): { degree: string; institution: string; year: string } | null {
  const year = line.match(YEAR)?.[0] ?? '';
  const parts = line.replace(YEAR, ' ').split(/\s+[-–—]\s+|\s*,\s*|\s*\|\s*/).map(clean).filter((p) => p && !/^[()-]*$/.test(p));
  if (!parts.length) return null;
  return { degree: parts[0], institution: parts.slice(1).join(', '), year };
}

export interface ImportResult { data: BiodataData; filled: number }

export function parseBiodata(raw: string): ImportResult {
  const d = emptyBiodata();
  const edu: { degree: string; institution: string; year: string }[] = [];
  const lines = raw.split(/\r?\n/).map((l) => l.replace(/ /g, ' ').trim());
  let inEdu = false;
  const set = (f: TextField | 'address', v: string) => {
    const key: TextField = f === 'address' ? (d.presentAddress ? 'permanentAddress' : 'presentAddress') : f;
    if (v && !d[key]) (d as unknown as Record<string, string>)[key] = v;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) { inEdu = false; continue; }
    const pair = splitLine(line);
    const label = pair ? labelOf(pair[0]) : labelOf(line);
    if (label === 'education') {
      inEdu = true;
      const v = pair ? pair[1] : '';
      const r = v ? eduRow(v) : null;
      if (r) edu.push(r);
      continue;
    }
    if (label) {
      inEdu = false;
      let value = pair ? pair[1] : '';
      // A label on its own line: the value is the next line, unless that line is a label too
      if (!value) {
        const next = lines[i + 1] ?? '';
        const nextPair = splitLine(next);
        if (next && !labelOf(nextPair ? nextPair[0] : next)) { value = next; i++; }
      }
      set(label, value);
      continue;
    }
    if (inEdu) {
      const r = eduRow(line);
      if (r) edu.push(r);
    }
  }

  if (!d.email) d.email = raw.match(EMAIL)?.[0] ?? '';
  if (!d.name) {
    const first = lines.find((l) => l && !SKIP_TITLE.test(l) && !/[:：@\d]/.test(l) && l.split(/\s+/).length <= 4 && !labelOf(l) && !/details|information|তথ্য/i.test(l));
    if (first) d.name = clean(first);
  }
  if (edu.length) d.education = edu.map((e, i) => ({ id: `e${i + 1}`, ...e }));

  const text = (Object.keys(d) as (keyof BiodataData)[]).filter((k) => k !== 'education' && k !== 'photo' && d[k]).length;
  return { data: d, filled: text + edu.length };
}
