// Scam Shield: rule-based job-offer red-flag checker (no AI, no network).
// Pure function: analyze(text) -> { level, flags[] }. Safe to run in the browser or a Worker.

export type Severity = "high" | "medium";
export type Level = "high" | "caution" | "none";

export interface Bi {
  en: string;
  bn: string;
}

export interface Flag {
  id: string;
  severity: Severity;
  title: Bi;
  why: Bi;
  evidence: string; // short snippet from the user's text
}

export interface Result {
  level: Level;
  flags: Flag[];
}

export const NOTE: Bi = {
  en: "This tool only warns; it cannot guarantee anything. Scams have happened even with BMET clearance and proper-looking papers. Always verify on the official website.",
  bn: "এই টুল শুধু সতর্কতা দেয়, নিশ্চয়তা নয়। BMET ছাড়পত্র বা বৈধ কাগজ থাকলেও প্রতারণার ঘটনা ঘটেছে। সবসময় অফিসিয়াল সাইটে যাচাই করুন।",
};

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Lower-cases, reads Bangla digits as 0-9, drops zero-width marks and collapses spaces.
 *  `map[i]` is the index in the original text of normalized character i, so evidence can quote the user's own words. */
function normalize(raw: string): { t: string; map: number[] } {
  let t = "";
  const map: number[] = [];
  let prevSpace = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "\u200c" || ch === "\u200d") continue;
    if (/\s/.test(ch)) {
      if (prevSpace) continue;
      prevSpace = true;
      t += " ";
      map.push(i);
      continue;
    }
    prevSpace = false;
    const d = BN_DIGITS.indexOf(ch);
    t += d >= 0 ? String(d) : ch.toLowerCase();
    map.push(i);
  }
  return { t, map };
}

// "Word" boundaries that work for Bangla (JS \b does not).
const B = "(?:^|[^\\p{L}\\p{M}\\p{N}])";
const E = "(?![\\p{L}\\p{M}\\p{N}])";
const re = (src: string) => new RegExp(src, "iu");
const w = (src: string) => re(`${B}(?:${src})${E}`);
// Bangla words take suffixes (কম্বোডিয়ায়, ইনবক্সে), so for them only the start is anchored (see SE_ASIA, ABROAD).

interface Src {
  raw: string;
  map: number[];
}
/** First match of `rx` in the normalized text, returned as a short quote from the original text. */
function snip(src: Src, t: string, index: number, length: number): string {
  let a = Math.max(0, index - 25);
  let b = Math.min(t.length, index + length + 25);
  // Start and end on whole words (never inside the match itself).
  while (a > 0 && a < index && t[a - 1] !== " ") a++;
  while (b < t.length && b > index + length && t[b] !== " ") b--;
  const from = src.map[a] ?? 0;
  const to = (src.map[Math.min(b, src.map.length) - 1] ?? src.raw.length - 1) + 1;
  const body = src.raw.slice(from, to).replace(/\s+/g, " ").trim();
  return `${a > 0 ? "… " : ""}${body}${b < t.length ? " …" : ""}`;
}

const PHONE = re("(?:\\+?88)?01[3-9]\\d{8}");
const MOBILE_PAY = w("bkash|বিকাশ|nagad|নগদ|rocket|রকেট|upay|উপায়");
const FEE_WORDS = w(
  "ফি|রেজিস্ট্রেশন ফি|প্রসেসিং ফি|মেডিকেল ফি|ভিসা ফি|জামানত|সিকিউরিটি মানি|অগ্রিম|এডভান্স|অ্যাডভান্স|" +
    "(?:registration|processing|application|medical|visa|security|training|joining|document|verification) (?:fee|fees|charge|charges|money|deposit)|" +
    "deposit|advance payment|send money|pay (?:first|now|in advance)|টাকা (?:জমা|পাঠান|পাঠাতে|দিতে|দিন)|টাকা পাঠাতে|পেমেন্ট করুন"
);
const OFFICIAL_PORTAL = re("teletalk|টেলিটক|[a-z0-9-]+\\.gov\\.bd|bpsc\\.gov|\\.teletalk\\.com\\.bd");
const FREE_MAIL = re("[a-z0-9._%+-]+@(?:gmail|yahoo|hotmail|outlook|ymail)\\.com");
const ANY_EMAIL = re("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}");
const MESSAGING = re(`${B}(?:whatsapp|telegram|inbox|messenger|imo)${E}|${B}(?:হোয়াটসঅ্যাপ|হোয়াটসএপ|টেলিগ্রাম|ইনবক্স|মেসেঞ্জার|ইমো)`);

const NO_INTERVIEW = re(
  "ইন্টারভিউ ছাড়া|সাক্ষাৎকার ছাড়া|ইন্টারভিউ ছাড়াই|no interview|without (?:an )?interview|সরাসরি নিয়োগ|" +
    "চাকরি নিশ্চিত|নিশ্চিত চাকরি|চাকরির নিশ্চয়তা|job guarantee|guaranteed job|100% job|১০০% চাকরি"
);
const SIMPLE_JOB = w(
  "computer operator|কম্পিউটার অপারেটর|typist|টাইপিস্ট|data entry|ডাটা এন্ট্রি|ডেটা এন্ট্রি|ডাটা এন্ট্রি|call cent(?:er|re)|কল সেন্টার|customer service|কাস্টমার সার্ভিস|online job|অনলাইন জব|অনলাইন কাজ|office assistant|অফিস সহকারী"
);
const SE_ASIA = re(`${B}(?:cambodia|laos|myanmar|vietnam|thailand)${E}|${B}(?:কম্বোডিয়া|কাম্বোডিয়া|লাওস|মিয়ানমার|মায়ানমার|ভিয়েতনাম|থাইল্যান্ড)`);
const ABROAD = re(
  `${B}(?:overseas|abroad|visa|saudi|dubai|qatar|kuwait|oman|malaysia|europe|romania|singapore|bahrain|italy|japan|korea)${E}|` +
    `${B}(?:বিদেশ|ভিসা|সৌদি|দুবাই|কাতার|কুয়েত|ওমান|মালয়েশিয়া|ইউরোপ|রোমানিয়া|সিঙ্গাপুর|বাহরাইন|ইতালি|জাপান|কোরিয়া)`
);
const VISA_PROMISE = re("ফ্রি ভিসা|free visa|ভিসা নিশ্চিত|visa guarantee|visa guaranteed|ওয়ার্ক পারমিট|work permit|ভিসা রেডি|visa ready");
const RL = re("(?:rl|আরএল)[\\s.:-]*\\d{2,5}|recruiting licen[cs]e");
const GOV_BRAND = re(
  `${B}(?:ministry|government|biman|nbr|bangladesh bank|police|army|bgb|railway|undp|brac|grameenphone)${E}|` +
    `${B}(?:মন্ত্রণালয়|সচিবালয়|অধিদপ্তর|সরকারি|বিমান বাংলাদেশ|এনবিআর|বাংলাদেশ ব্যাংক|পুলিশ|সেনাবাহিনী|বিজিবি|রেলওয়ে|ইউএনডিপি|ব্র্যাক|গ্রামীণফোন)`
);
const SECRET_REQUEST = w("otp|ওটিপি|pin|পিন|cvv|কার্ড নম্বর|card number|পাসওয়ার্ড|password");
const DOC_REQUEST = re("(?:পাসপোর্ট|passport|nid|এনআইডি|জাতীয় পরিচয়(?:পত্র)?|national id)[^.।]{0,15}(?:কপি|ছবি|copy|photo|scan|স্ক্যান|নম্বর|নাম্বার|number)|ব্যাংক (?:একাউন্ট|অ্যাকাউন্ট|হিসাব) (?:নম্বর|নাম্বার|তথ্য)|bank (?:account|details)");
const SEND_VERB = re("পাঠান|পাঠাতে|পাঠিয়ে|দিন|দিতে|শেয়ার|send|share|upload|আপলোড");
const URGENCY = re(
  "শেষ সুযোগ|last chance|today only|আজ রাতের মধ্যে|আজই (?:টাকা|জমা|পাঠান|যোগাযোগ|পেমেন্ট)|মাত্র \\d+ ?(?:টি|জন)? ?(?:পদ|সিট|আসন|জন)|(?:সিট|আসন) সীমিত|seats? (?:are )?limited|only \\d+ (?:seats|posts|vacanc)|hurry"
);

function salaryHigh(t: string): { index: number; length: number } | null {
  // Taka amounts >= 60,000 or dollar amounts >= 500 in a salary context.
  const rx = /(?:বেতন|salary|মাসিক|monthly|income|আয়|\$|usd|ডলার|৳|tk\.?|taka|টাকা)[^0-9]{0,15}([0-9][0-9,]{2,8})|([0-9][0-9,]{2,8})\s*(?:\$|usd|ডলার|দিরহাম|aed|রিয়াল|sar|টাকা|tk|৳)/giu;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(t))) {
    const n = parseInt((m[1] || m[2]).replace(/,/g, ""), 10);
    const ctx = t.slice(Math.max(0, m.index - 5), m.index + m[0].length + 5);
    const isDollar = /\$|usd|ডলার/i.test(ctx);
    const hit = { index: m.index, length: m[0].length };
    if (isDollar && n >= 500 && n < 20000) return hit;
    if (!isDollar && n >= 60000 && n < 1000000 && /বেতন|salary|মাসিক|monthly|income|আয়/i.test(t)) return hit;
  }
  return null;
}

const MSG: Record<string, { title: Bi; why: Bi }> = {
  R1: {
    title: { en: "Asks you to pay money first", bn: "চাকরির জন্য আগে টাকা চাওয়া হয়েছে" },
    why: {
      en: "Asking for a fee, deposit or processing charge before a job is the most common scam sign. A genuine employer does not charge applicants.",
      bn: "চাকরির জন্য আগে ফি, জামানত বা প্রসেসিং চার্জ চাওয়া প্রতারণার সবচেয়ে সাধারণ লক্ষণ। বৈধ নিয়োগে আবেদনকারীকে টাকা দিতে হয় না।",
    },
  },
  R1_OFFICIAL: {
    title: { en: "An application fee is mentioned", bn: "আবেদন ফি উল্লেখ আছে" },
    why: {
      en: "Some government and bank exams do have an application fee through an official portal. Pay only on the official site named in the circular, never to a personal number, and open that site yourself to confirm.",
      bn: "কিছু সরকারি/ব্যাংক পরীক্ষায় অফিসিয়াল পোর্টালের মাধ্যমে আবেদন ফি থাকে। ফি শুধু সার্কুলারে দেওয়া অফিসিয়াল সাইটে দিন, ব্যক্তিগত নম্বরে নয়, এবং সাইটটি নিজে খুলে মিলিয়ে নিন।",
    },
  },
  R2: {
    title: { en: "Asks for mobile-money payment", bn: "মোবাইল ব্যাংকিংয়ে টাকা চাওয়া হয়েছে" },
    why: {
      en: "Sending money to a personal bKash or Nagad number is not a genuine hiring process.",
      bn: "ব্যক্তিগত বিকাশ/নগদ নম্বরে টাকা পাঠানো বৈধ নিয়োগ প্রক্রিয়া নয়।",
    },
  },
  R3: {
    title: { en: "Only Gmail, WhatsApp or inbox contact", bn: "শুধু জিমেইল/হোয়াটসঅ্যাপ/ইনবক্সে যোগাযোগ" },
    why: {
      en: "Be suspicious if there is no official website or company-domain email. Check that the company's own careers page has the same notice.",
      bn: "প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট বা ডোমেইন ইমেইল না থাকলে সন্দেহ করুন। কোম্পানির নিজস্ব ক্যারিয়ার পেজে একই বিজ্ঞপ্তি আছে কি না দেখুন।",
    },
  },
  R4: {
    title: { en: "No interview or a guaranteed job", bn: "ইন্টারভিউ ছাড়া বা নিশ্চিত চাকরির কথা বলা হয়েছে" },
    why: {
      en: "A guaranteed job without an interview is a warning sign. No genuine recruiter can promise a job in advance.",
      bn: "ইন্টারভিউ ছাড়া নিশ্চিত চাকরির প্রতিশ্রুতি প্রতারণার ইঙ্গিত। বৈধ নিয়োগে কেউ চাকরির নিশ্চয়তা দিতে পারে না।",
    },
  },
  R5: {
    title: { en: "Unusually high pay for simple work", bn: "সহজ কাজে অস্বাভাবিক বেতনের কথা" },
    why: {
      en: "Very high pay for computer operator, data entry or call-centre work is a common trap.",
      bn: "কম্পিউটার অপারেটর, ডাটা এন্ট্রি বা কল সেন্টারের কাজে অনেক বেশি বেতনের প্রতিশ্রুতি ফাঁদের সাধারণ রূপ।",
    },
  },
  R6_HIGH: {
    title: { en: "Office or computer job in Cambodia, Laos, Myanmar, Vietnam or Thailand", bn: "কম্বোডিয়া/লাওস/মিয়ানমার/ভিয়েতনাম/থাইল্যান্ডে অফিস-কম্পিউটার চাকরি" },
    why: {
      en: "The government and embassies have warned about computer operator, typist and call-centre offers for these countries. Some people were trapped in scam compounds. Verify with the Ministry of Expatriates' Welfare or the Bangladesh embassy.",
      bn: "সরকার ও দূতাবাস এই দেশগুলোর কম্পিউটার অপারেটর, টাইপিস্ট ও কল সেন্টার চাকরি নিয়ে সতর্ক করেছে। অনেকে স্ক্যাম কম্পাউন্ডে আটকে পড়েছেন। প্রবাসী কল্যাণ মন্ত্রণালয় বা বাংলাদেশ দূতাবাস থেকে যাচাই করুন।",
    },
  },
  R6_MED: {
    title: { en: "Job offer in a country under warning", bn: "সতর্কতাভুক্ত দেশে চাকরির অফার" },
    why: {
      en: "The government has warned about job offers for Cambodia, Laos, Myanmar, Vietnam and Thailand. Verify with the ministry or embassy.",
      bn: "কম্বোডিয়া, লাওস, মিয়ানমার, ভিয়েতনাম ও থাইল্যান্ডের চাকরির অফার নিয়ে সরকার সতর্ক করেছে। মন্ত্রণালয় বা দূতাবাসে যাচাই করুন।",
    },
  },
  R7: {
    title: { en: "Uses a government or well-known name", bn: "সরকারি বা পরিচিত প্রতিষ্ঠানের নাম ব্যবহার" },
    why: {
      en: "Fake notices often borrow the name and logo of a ministry, Biman or a big organisation. Match the notice on that organisation's own official website.",
      bn: "ভুয়া নিয়োগ বিজ্ঞপ্তিতে মন্ত্রণালয়, বিমান বা বড় প্রতিষ্ঠানের নাম ও লোগো ব্যবহার করা হয়। প্রতিষ্ঠানের নিজস্ব অফিসিয়াল ওয়েবসাইটে একই বিজ্ঞপ্তি মিলিয়ে নিন।",
    },
  },
  R8_HIGH: {
    title: { en: "Visa or work-permit promise, but no licence number", bn: "ভিসা/ওয়ার্ক পারমিটের নিশ্চয়তা, কিন্তু লাইসেন্স নম্বর নেই" },
    why: {
      en: "An overseas job ad should show the agency's RL number. Check the RL in the official list. Phrases like 'free visa' or 'visa guaranteed' are suspicious.",
      bn: "বিদেশের চাকরির বিজ্ঞাপনে এজেন্সির RL নম্বর থাকা উচিত। সরকারি তালিকায় RL নম্বর মিলিয়ে দেখুন। 'ফ্রি ভিসা' বা 'ভিসা নিশ্চিত' ধরনের কথা সন্দেহজনক।",
    },
  },
  R8_MED: {
    title: { en: "Overseas job ad without an RL number", bn: "বিদেশের চাকরির বিজ্ঞাপনে RL নম্বর নেই" },
    why: {
      en: "A licensed agency shows its RL number. Check it in the official agency list and the BAIRA list.",
      bn: "লাইসেন্সপ্রাপ্ত এজেন্সির RL নম্বর থাকে। সরকারি এজেন্সি তালিকা ও BAIRA তালিকায় মিলিয়ে নিন।",
    },
  },
  R9_HIGH: {
    title: { en: "Asks for an OTP, PIN or card details", bn: "OTP/পিন/কার্ড তথ্য চাওয়া হয়েছে" },
    why: {
      en: "Never give an OTP, PIN, card number or password to anyone. Your account can be emptied.",
      bn: "OTP, পিন, কার্ড বা পাসওয়ার্ড কাউকে দেবেন না। এতে আপনার একাউন্ট খালি হতে পারে।",
    },
  },
  R9_MED: {
    title: { en: "Asks for passport, NID or bank details by message", bn: "মেসেজে পাসপোর্ট/NID/ব্যাংক তথ্য চাওয়া হয়েছে" },
    why: {
      en: "Do not send passport, NID or bank details over WhatsApp or inbox before you have verified the organisation and signed a contract.",
      bn: "চুক্তি ও প্রতিষ্ঠান যাচাইয়ের আগে হোয়াটসঅ্যাপ বা ইনবক্সে পাসপোর্ট, NID বা ব্যাংক তথ্য পাঠাবেন না।",
    },
  },
  R10: {
    title: { en: "Pressure to hurry", bn: "তাড়াহুড়োর চাপ" },
    why: {
      en: "'Last chance' or 'only a few seats' pressure takes away your time to think. Scammers use it.",
      bn: "'শেষ সুযোগ', 'মাত্র কয়েকটি সিট' ধরনের চাপ দিয়ে ভাবার সময় কেড়ে নেওয়া প্রতারকের কৌশল।",
    },
  },
};

export function analyze(raw: string): Result {
  const src: Src = { raw: raw || "", map: [] };
  const n = normalize(src.raw);
  const t = n.t;
  src.map = n.map;
  const find = (_t: string, rx: RegExp): string | null => {
    const m = rx.exec(t);
    return m ? snip(src, t, m.index, m[0].length) : null;
  };
  const flags: Flag[] = [];
  const add = (id: string, severity: Severity, evidence: string) => {
    const m = MSG[id];
    flags.push({ id: id.split("_")[0], severity, title: m.title, why: m.why, evidence });
  };

  const feeEv = find(t, FEE_WORDS);
  const payEv = MOBILE_PAY.test(t) ? find(t, MOBILE_PAY) : null;
  const hasPhone = PHONE.test(t);
  const sendToNumber = re("(?:এই নম্বরে|এই নাম্বারে|নম্বরে|নাম্বারে|send to|পাঠান|পাঠাতে|জমা)").test(t);

  const r2 = !!payEv && (hasPhone || sendToNumber);
  if (r2) add("R2", "high", payEv!);

  if (feeEv) {
    const official = OFFICIAL_PORTAL.test(t) && !r2;
    add(official ? "R1_OFFICIAL" : "R1", official ? "medium" : "high", feeEv);
  }

  const secretEv = SECRET_REQUEST.test(t) ? find(t, SECRET_REQUEST) : null;
  if (secretEv && SEND_VERB.test(t)) {
    add("R9_HIGH", "high", secretEv);
  } else if (DOC_REQUEST.test(t) && SEND_VERB.test(t) && MESSAGING.test(t)) {
    add("R9_MED", "medium", find(t, DOC_REQUEST)!);
  }

  const noInt = find(t, NO_INTERVIEW);
  if (noInt) add("R4", "high", noInt);

  const simple = SIMPLE_JOB.test(t) ? find(t, SIMPLE_JOB) : null;
  const seaEv = SE_ASIA.test(t) ? find(t, SE_ASIA) : null;
  const hiPayAt = salaryHigh(t);
  const hiPay = hiPayAt ? snip(src, t, hiPayAt.index, hiPayAt.length) : null;
  const abroad = ABROAD.test(t) || !!seaEv;
  if (simple && seaEv) add("R6_HIGH", "high", seaEv);
  else if (seaEv) add("R6_MED", "medium", seaEv);
  if (simple && hiPay && (abroad || /মাসে|monthly|per month|মাসিক/.test(t))) add("R5", "high", hiPay);

  const visaP = find(t, VISA_PROMISE);
  if (abroad && !RL.test(t)) {
    if (visaP) add("R8_HIGH", "high", visaP);
    else if (feeEv || r2) add("R8_MED", "medium", find(t, ABROAD)!);
  }

  const freeMail = find(t, FREE_MAIL);
  const hasCompanyMail = ANY_EMAIL.test(t.replace(new RegExp(FREE_MAIL.source, "giu"), ""));
  const msg = find(t, MESSAGING);
  if ((freeMail || msg) && !hasCompanyMail) add("R3", "medium", (freeMail || msg)!);

  const brand = find(t, GOV_BRAND);
  if (brand && flags.some((f) => ["R1", "R2", "R3"].includes(f.id))) add("R7", "medium", brand);

  const urg = find(t, URGENCY);
  if (urg) add("R10", "medium", urg);

  const hasHigh = flags.some((f) => f.severity === "high");
  const level: Level = hasHigh ? "high" : flags.length ? "caution" : "none";
  return { level, flags };
}
