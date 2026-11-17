import type { Bilingual } from '../../shared/catalog';

export interface Layout {
  /** True when the text came from a PDF (so the PDF layout checks apply). */
  fromPdf: boolean;
  /** True when the text came from a Word file: the one-column check applies, "readable" does not. */
  fromDocx?: boolean;
  /** Share of text rows that are split into separate blocks side by side (0–1). */
  splitRowShare: number;
}

export interface Check {
  id: string;
  weight: number;
  pass: boolean;
  title: Bilingual;
  fix: Bilingual;
}

export interface Analysis {
  score: number;
  words: number;
  checks: Check[];
}

const has = (text: string, patterns: RegExp[]) => patterns.some((p) => p.test(text));

const ACTION_VERBS = [
  'achieved', 'built', 'created', 'delivered', 'designed', 'developed', 'improved', 'increased', 'reduced', 'led',
  'managed', 'organised', 'organized', 'launched', 'trained', 'negotiated', 'coordinated', 'implemented', 'analysed',
  'analyzed', 'prepared', 'supervised', 'resolved', 'streamlined', 'mentored', 'planned', 'completed', 'established',
  'generated', 'handled', 'conducted', 'produced', 'won', 'secured', 'taught', 'raised', 'saved',
];

const WEAK_PHRASES = [/responsible for/i, /duties (?:include|included)/i, /hard[- ]?working/i, /references? (?:are )?available (?:up)?on request/i, /team player/i];

const PERSONAL = [/religion/i, /father'?s name/i, /mother'?s name/i, /marital status/i, /blood group/i, /ধর্ম/, /পিতার নাম/, /মাতার নাম/];

export function analyzeCv(raw: string, layout: Layout): Analysis {
  const text = raw.replace(/ /g, ' ');
  const lower = text.toLowerCase();
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length;

  const verbCount = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(lower)).length;
  const numberHits = (text.match(/(\d+(?:\.\d+)?\s?%|৳\s?\d|tk\.?\s?\d|\b\d{2,}(?:,\d{3})*\+?\b(?!\s*(?:-|–)\s*\d{2,4}\b)|[০-৯]{2,})/gi) ?? []).length;
  const personalHits = PERSONAL.filter((p) => p.test(text)).length;

  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  if (layout.fromPdf) {
    add({
      id: 'readable',
      weight: 20,
      pass: words >= 80,
      title: { en: 'Text can be read by software', bn: 'সফটওয়্যার টেক্সট পড়তে পারে' },
      fix: {
        en: 'Very little text could be read from this PDF. It may be a scanned image or a picture saved as PDF, which ATS software cannot read. Save it again from Word or Google Docs as a PDF.',
        bn: 'এই PDF থেকে খুব কম টেক্সট পড়া গেছে। এটি হয়তো স্ক্যান করা ছবি, যা ATS সফটওয়্যার পড়তে পারে না। Word বা Google Docs থেকে আবার PDF হিসেবে সেভ করুন।',
      },
    });
  }
  if (layout.fromPdf || layout.fromDocx) {
    add({
      id: 'columns',
      weight: 10,
      pass: layout.splitRowShare < 0.3,
      title: { en: 'Simple one-column layout', bn: 'সহজ এক-কলাম লেআউট' },
      fix: {
        en: 'Your CV looks like it uses two columns or tables. ATS software often reads these out of order. Use a single column for online applications.',
        bn: 'আপনার সিভিতে দুই কলাম বা টেবিল আছে বলে মনে হচ্ছে। ATS সফটওয়্যার এগুলো প্রায়ই এলোমেলোভাবে পড়ে। অনলাইন আবেদনে এক কলামের সিভি ব্যবহার করুন।',
      },
    });
  }

  add({
    id: 'email',
    weight: 8,
    pass: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text),
    title: { en: 'Email address', bn: 'ইমেইল ঠিকানা' },
    fix: { en: 'Add a professional email address at the top, for example firstname.lastname@gmail.com.', bn: 'উপরে একটি পেশাদার ইমেইল দিন, যেমন firstname.lastname@gmail.com।' },
  });
  add({
    id: 'phone',
    weight: 7,
    pass: /(?:\+?88)?\s?0?1[3-9]\d{2}[\s-]?\d{6}|(?:\+?৮৮)?০১[৩-৯][০-৯]{8}/.test(text),
    title: { en: 'Mobile number', bn: 'মোবাইল নম্বর' },
    fix: { en: 'Add your mobile number at the top, written as 01XXX-XXXXXX.', bn: 'উপরে আপনার মোবাইল নম্বর দিন, যেমন ০১XXX-XXXXXX।' },
  });
  add({
    id: 'summary',
    weight: 6,
    pass: has(lower, [/summary/, /objective/, /profile/, /about me/, /ক্যারিয়ার উদ্দেশ্য/, /সারসংক্ষেপ/]),
    title: { en: 'Career summary', bn: 'ক্যারিয়ার সামারি' },
    fix: { en: 'Add 2–3 lines at the top saying who you are, your strongest skill and the job you want.', bn: 'উপরে ২–৩ লাইনে লিখুন আপনি কে, আপনার সবচেয়ে বড় দক্ষতা কী এবং কোন চাকরি চান।' },
  });
  add({
    id: 'experience',
    weight: 10,
    pass: has(lower, [/experience/, /employment/, /work history/, /internship/, /অভিজ্ঞতা/]),
    title: { en: 'Experience section', bn: 'অভিজ্ঞতার অংশ' },
    fix: { en: 'Add an “Experience” section. Freshers can list internships, tuition, volunteering or projects here.', bn: '“Experience” অংশ যোগ করুন। ফ্রেশাররা এখানে ইন্টার্নশিপ, টিউশন, স্বেচ্ছাসেবা বা প্রজেক্ট লিখতে পারেন।' },
  });
  add({
    id: 'education',
    weight: 8,
    pass: has(lower, [/education/, /academic/, /qualification/, /শিক্ষা/]),
    title: { en: 'Education section', bn: 'শিক্ষাগত যোগ্যতার অংশ' },
    fix: { en: 'Add an “Education” section with degree, institution, year and result.', bn: 'ডিগ্রি, প্রতিষ্ঠান, সাল ও ফলাফলসহ “Education” অংশ যোগ করুন।' },
  });
  add({
    id: 'skills',
    weight: 8,
    pass: has(lower, [/skills?/, /competenc/, /দক্ষতা/]),
    title: { en: 'Skills section', bn: 'দক্ষতার অংশ' },
    fix: { en: 'Add a “Skills” section using the same words the job circular uses, such as “MS Excel” or “customer service”.', bn: 'বিজ্ঞপ্তিতে যে শব্দ আছে সেগুলো দিয়ে “Skills” অংশ যোগ করুন, যেমন “MS Excel” বা “customer service”।' },
  });
  add({
    id: 'numbers',
    weight: 8,
    pass: numberHits >= 4,
    title: { en: 'Results shown with numbers', bn: 'সংখ্যা দিয়ে ফলাফল দেখানো' },
    fix: { en: 'Show results with numbers: “served 60 customers a day”, “raised deposits by 15%”, “taught 4 classes of 40 students”.', bn: 'ফলাফল সংখ্যায় দেখান: “দিনে ৬০ জন গ্রাহককে সেবা”, “ডিপোজিট ১৫% বাড়িয়েছি”, “৪০ জনের ৪টি ক্লাস নিয়েছি”।' },
  });
  add({
    id: 'verbs',
    weight: 7,
    pass: verbCount >= 5,
    title: { en: 'Strong action words', bn: 'শক্তিশালী কাজের শব্দ' },
    fix: { en: 'Start each point with an action word such as led, improved, organised, trained or reduced.', bn: 'প্রতিটি পয়েন্ট led, improved, organised, trained বা reduced-এর মতো কাজের শব্দ দিয়ে শুরু করুন।' },
  });
  add({
    id: 'weak',
    weight: 4,
    pass: !has(text, WEAK_PHRASES),
    title: { en: 'No filler phrases', bn: 'অপ্রয়োজনীয় শব্দ নেই' },
    fix: { en: 'Replace phrases like “responsible for”, “hard-working” or “references available on request” with what you actually did.', bn: '“responsible for”, “hard-working” বা “references available on request”-এর বদলে আপনি আসলে কী করেছেন তা লিখুন।' },
  });
  add({
    id: 'length',
    weight: 6,
    pass: words >= 200 && words <= 1100,
    title: { en: 'Right length', bn: 'সঠিক দৈর্ঘ্য' },
    fix: words < 200
      ? { en: 'Your CV is quite short. Add detail to your experience, projects and skills.', bn: 'সিভিটি বেশ ছোট। অভিজ্ঞতা, প্রজেক্ট ও দক্ষতায় আরও বিস্তারিত দিন।' }
      : { en: 'Your CV is long. Keep it to 1–2 pages; cut older or less relevant details.', bn: 'সিভিটি লম্বা। ১–২ পৃষ্ঠায় রাখুন; পুরনো বা কম প্রাসঙ্গিক তথ্য বাদ দিন।' },
  });
  add({
    id: 'personal',
    weight: 4,
    pass: personalHits <= 1,
    title: { en: 'Only the personal details needed', bn: 'শুধু প্রয়োজনীয় ব্যক্তিগত তথ্য' },
    fix: {
      en: 'Private and international employers rarely need religion, parents’ names or blood group. Keep them only when the circular asks, as many government forms do.',
      bn: 'বেসরকারি ও আন্তর্জাতিক প্রতিষ্ঠান সাধারণত ধর্ম, বাবা-মায়ের নাম বা রক্তের গ্রুপ চায় না। শুধু বিজ্ঞপ্তিতে চাইলে রাখুন, যেমন অনেক সরকারি ফর্মে চায়।',
    },
  });
  add({
    id: 'linkedin',
    weight: 4,
    pass: /linkedin\.com\//i.test(text),
    title: { en: 'LinkedIn profile link', bn: 'লিংকডইন প্রোফাইল লিংক' },
    fix: { en: 'Add your LinkedIn profile link next to your email.', bn: 'ইমেইলের পাশে আপনার লিংকডইন প্রোফাইলের লিংক দিন।' },
  });

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  // An unreadable PDF caps the score: nothing else matters if software can't read it.
  const unreadable = checks.find((c) => c.id === 'readable' && !c.pass);
  const score = unreadable ? Math.min(25, Math.round((got / total) * 100)) : Math.round((got / total) * 100);

  return { score, words, checks };
}
