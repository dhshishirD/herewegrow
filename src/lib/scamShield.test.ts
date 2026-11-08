import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { analyze } from './scamShield';

const ids = (text: string) => analyze(text).flags.map((f) => f.id).sort();

// Samples are modelled on cases in official warnings (ministry notices, embassy alerts), not real messages.
const SCAMS: Record<string, { text: string; mustHave: string[] }> = {
  'fee + bKash + guaranteed job': {
    text: 'জরুরি নিয়োগ! অফিস সহকারী পদে ১০ জন। বেতন ২৫,০০০ টাকা। রেজিস্ট্রেশন ফি ২৯৫০ টাকা বিকাশ ০১৭১২৩৪৫৬৭৮ নম্বরে পাঠান। ইন্টারভিউ ছাড়াই নিশ্চিত চাকরি।',
    mustHave: ['R1', 'R2', 'R4'],
  },
  'Cambodia data entry $800 via WhatsApp': {
    text: 'কম্বোডিয়ায় ডাটা এন্ট্রি অপারেটর নিয়োগ। মাসিক বেতন $800, থাকা খাওয়া ফ্রি। ভিসা ও টিকেট ফ্রি। যোগাযোগ WhatsApp 01812345678',
    mustHave: ['R3', 'R5', 'R6'],
  },
  'fake ministry notice with deposit': {
    text: 'গণপূর্ত মন্ত্রণালয়ের অধীনে ১৬১ জন নিয়োগ: নিরাপত্তা প্রহরী, লিফটম্যান, কম্পিউটার টাইপিস্ট। নিয়োগ নিশ্চিত করতে ৫০০০ টাকা জমা দিন। আজ রাতের মধ্যে। ইনবক্সে যোগাযোগ করুন।',
    mustHave: ['R1', 'R3', 'R7', 'R10'],
  },
  'fake Biman Facebook post': {
    text: 'বিমান বাংলাদেশ এয়ারলাইন্সে পাসপোর্ট চেকার পদে নিয়োগ। আবেদন ফি ১৫০০ টাকা নগদ ০১৯১২৩৪৫৬৭৮ এ পাঠান। ইনবক্সে মেসেজ দিন।',
    mustHave: ['R1', 'R2', 'R7'],
  },
  'OTP request': {
    text: 'আপনার চাকরি কনফার্ম হয়েছে। ভেরিফিকেশনের জন্য আপনার ফোনে আসা OTP কোড আমাদের পাঠান।',
    mustHave: ['R9'],
  },
  'English: free visa Romania': {
    text: 'Free visa and work permit for Romania. No interview. Pay 50,000 Tk advance payment. WhatsApp +8801712345678',
    mustHave: ['R4', 'R8'],
  },
};

const LEGIT: Record<string, { text: string; level: 'none' | 'caution' }> = {
  "company circular with company email ('অফিস' must not trigger the fee rule)": {
    text: 'ABC Limited-এ সেলস এক্সিকিউটিভ নিয়োগ। অফিস: গুলশান, ঢাকা। যোগ্যতা: স্নাতক। বেতন আলোচনা সাপেক্ষে। আবেদন: CV পাঠান career@abc-company.com ঠিকানায়। শেষ তারিখ ১৫ ডিসেম্বর।',
    level: 'none',
  },
  'bank circular with Teletalk application fee': {
    text: 'ব্যাংকে সিনিয়র অফিসার পদে নিয়োগ। আবেদন করুন www.xyz.teletalk.com.bd সাইটে। আবেদন ফি ১১২ টাকা টেলিটকের মাধ্যমে প্রদেয়।',
    level: 'caution',
  },
  'licensed agency ad with RL number and company email': {
    text: 'RL-1234 লাইসেন্সপ্রাপ্ত এজেন্সি: সৌদি আরবে ড্রাইভার চাই, বেতন ১৫০০ রিয়াল, অফিস মতিঝিল, ডিমান্ড লেটার আছে। ইমেইল info@agency-bd.com',
    level: 'none',
  },
  'domestic call-centre job with realistic pay': {
    text: 'কল সেন্টার এজেন্ট, ঢাকা। বেতন ২০,০০০ টাকা। ইন্টারভিউ সোমবার সকাল ১০টায়। hr@company.com.bd',
    level: 'none',
  },
  'Thailand hotel chef via licensed agency (caution only)': {
    text: 'থাইল্যান্ডে হোটেল শেফ নিয়োগ, RL-777, বিস্তারিত info@lic-agency.com',
    level: 'caution',
  },
  'empty text': { text: '', level: 'none' },
};

describe('scam-like messages are rated high risk', () => {
  for (const [name, c] of Object.entries(SCAMS)) {
    it(name, () => {
      const r = analyze(c.text);
      expect(r.level).toBe('high');
      for (const id of c.mustHave) expect(ids(c.text), `missing ${id}`).toContain(id);
    });
  }
});

describe('normal messages are never rated high risk', () => {
  for (const [name, c] of Object.entries(LEGIT)) {
    it(name, () => {
      const r = analyze(c.text);
      expect(r.level, `false alarm: ${ids(c.text)}`).not.toBe('high');
      expect(r.level).toBe(c.level);
    });
  }
});

describe('details', () => {
  it('reads Bangla digits as numbers', () => {
    expect(ids('মাসিক বেতন ১২০০ ডলার, কম্পিউটার অপারেটর, থাইল্যান্ড')).toContain('R5');
  });

  it('quotes the user text as evidence', () => {
    expect(analyze('রেজিস্ট্রেশন ফি ৩০০০ টাকা দিতে হবে').flags[0].evidence).toContain('ফি');
  });

  it('quotes the original wording: same digits and capital letters as pasted', () => {
    const ev = analyze('Pay Registration Fee ৩০০০ Tk to bKash 01712345678').flags.map((f) => f.evidence).join(' | ');
    expect(ev).toContain('৩০০০');
    expect(ev).toContain('Registration Fee');
  });

  it('every flag has English and Bangla text', () => {
    for (const c of Object.values(SCAMS)) {
      for (const f of analyze(c.text).flags) {
        expect(f.title.en.length).toBeGreaterThan(5);
        expect(f.title.bn.length).toBeGreaterThan(5);
        expect(f.why.en.length).toBeGreaterThan(20);
        expect(f.why.bn.length).toBeGreaterThan(20);
      }
    }
  });

  it('uses no regex lookbehind, which older phone browsers reject', () => {
    const src = readFileSync(new URL('./scamShield.ts', import.meta.url), 'utf8');
    expect(src).not.toMatch(/\(\?<[!=]/);
  });
});
