// CV vs job ad matcher: pulls the keywords out of a job ad and checks which ones the CV already has.
// Runs in the browser. Light stemming only, so treat the result as a guide, not a verdict.

export interface Keyword {
  term: string; // as written in the ad
  weight: number;
  inCv: boolean;
}

export interface MatchResult {
  score: number; // 0-100, weighted share of ad keywords found in the CV
  keywords: Keyword[];
  missing: Keyword[];
  found: Keyword[];
}

const STOP = new Set(`a an the and or of to in on at for with by from as is are be will can must should may we you your our their this that these those it its
job jobs apply applicants applicant candidate candidates company vacancy position post posts required requirement requirements responsibilities responsibility
looking seeking join team work working years year experience experienced preferred plus including include etc also such well good strong ability able
before after until within january february march april may june july august september october november december proficiency proficient senior junior executive officer
deadline salary benefits benefit age bangladesh bangladeshi dhaka location department
এবং ও বা এর এই সেই যে যা জন্য থেকে করে করা হবে হয় হয়েছে একটি একজন সকল সব আছে থাকতে থাকবে পদ পদের পদে আবেদন আবেদনের প্রার্থী প্রার্থীর
চাকরি নিয়োগ বিজ্ঞপ্তি প্রতিষ্ঠান প্রতিষ্ঠানের বেতন সুযোগ সুবিধা বছর বছরের অভিজ্ঞতা যোগ্যতা দক্ষতা কাজ কাজের ন্যূনতম সর্বোচ্চ অন্তত`.split(/\s+/));

const HINT = /(require|skill|qualif|must|proficien|knowledge|degree|যোগ্যতা|দক্ষতা|জ্ঞান|ডিগ্রি|প্রয়োজন)/i;

const BN_SUFFIX = ['গুলোর', 'গুলো', 'দের', 'ের', 'কে', 'রা', 'তে', 'টি', 'টা', 'ে'];

export function stem(w: string): string {
  const s = w.toLowerCase();
  if (/[ঀ-৿]/.test(s)) {
    for (const suf of BN_SUFFIX) if (s.length > suf.length + 2 && s.endsWith(suf)) return s.slice(0, -suf.length);
    return s;
  }
  return s.replace(/(ing|ed|es|s)$/, (m) => (s.length - m.length >= 4 ? '' : m));
}

const tokens = (text: string): string[] =>
  text.match(/[A-Za-z][A-Za-z+#.\-/]*[A-Za-z+#]|[A-Za-z]|[ঀ-৿]+/g)?.map((x) => x.replace(/^[-./]+|[-./]+$/g, '')).filter(Boolean) ?? [];

export function matchCv(cv: string, ad: string, limit = 24): MatchResult {
  const weights = new Map<string, { term: string; weight: number }>();
  for (const line of ad.split(/\n+/)) {
    const bonus = HINT.test(line) ? 1 : 0;
    for (const raw of tokens(line)) {
      const lower = raw.toLowerCase();
      const shortCaps = raw.length === 2 && raw === raw.toUpperCase(); // BI, HR, QA, UI
      if ((raw.length < 3 && !shortCaps) || STOP.has(lower)) continue;
      const key = stem(raw);
      const cur = weights.get(key);
      const add = 1 + bonus;
      if (cur) cur.weight += add;
      else weights.set(key, { term: raw, weight: add });
    }
  }
  const top = [...weights.entries()].sort((a, b) => b[1].weight - a[1].weight).slice(0, limit);
  const cvStems = new Set(tokens(cv).map(stem));
  const keywords: Keyword[] = top.map(([k, v]) => ({ term: v.term, weight: v.weight, inCv: cvStems.has(k) }));
  const total = keywords.reduce((s, k) => s + k.weight, 0);
  const got = keywords.filter((k) => k.inCv).reduce((s, k) => s + k.weight, 0);
  return {
    score: total ? Math.round((got / total) * 100) : 0,
    keywords,
    found: keywords.filter((k) => k.inCv),
    missing: keywords.filter((k) => !k.inCv),
  };
}
