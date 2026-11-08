import type { Level, Requirement } from '../lib/jobRequirements';
import { num, type Lang } from '../lib/lang';

type T = (s: { en: string; bn: string }) => string;

const LEVEL: Record<Level, { en: string; bn: string }> = {
  1: { en: 'SSC', bn: 'এসএসসি' },
  2: { en: 'HSC or diploma', bn: 'এইচএসসি বা ডিপ্লোমা' },
  3: { en: 'a bachelor’s degree', bn: 'স্নাতক ডিগ্রি' },
  4: { en: 'a master’s degree', bn: 'স্নাতকোত্তর ডিগ্রি' },
  5: { en: 'a PhD', bn: 'পিএইচডি' },
};

const TONE: Record<Requirement['status'], { box: string; mark: string; label: { en: string; bn: string } }> = {
  meets: { box: 'bg-leaf-soft', mark: '✓', label: { en: 'Looks met', bn: 'মিলছে' } },
  short: { box: 'bg-alert/10', mark: '!', label: { en: 'Looks short', bn: 'কম মনে হচ্ছে' } },
  unknown: { box: 'bg-mist', mark: '?', label: { en: 'Check yourself', bn: 'নিজে দেখুন' } },
  info: { box: 'bg-mist', mark: 'i', label: { en: 'Good to know', bn: 'জেনে রাখুন' } },
};

function text(r: Requirement, t: T, lang: Lang): { title: { en: string; bn: string }; body: string } {
  if (r.kind === 'years') {
    const need = num(r.required, lang);
    const have = num(Math.round(r.have), lang);
    const how = r.estimated ? t({ en: ' (worked out from your dates)', bn: ' (আপনার তারিখ থেকে হিসাব)' }) : '';
    const title = r.preferred ? { en: 'Experience (preferred)', bn: 'অভিজ্ঞতা (অগ্রাধিকার)' } : { en: 'Experience', bn: 'অভিজ্ঞতা' };
    if (r.status === 'unknown') return { title, body: t({ en: `The ad asks for ${need} years. We could not read your work dates. Check your own.`, bn: `বিজ্ঞাপনে ${need} বছর চাওয়া হয়েছে। আপনার কাজের তারিখ পড়া যায়নি, নিজে মিলিয়ে নিন।` }) };
    if (r.status === 'meets') return { title, body: t({ en: `The ad asks for ${need} years. Your CV shows about ${have}${how}.`, bn: `বিজ্ঞাপনে ${need} বছর চাওয়া হয়েছে। আপনার সিভিতে প্রায় ${have} বছর দেখাচ্ছে${how}।` }) };
    return { title, body: t({ en: `The ad asks for ${need} years. Your CV shows about ${have}${how}. Check for internships, part-time or freelance work you have not listed.`, bn: `বিজ্ঞাপনে ${need} বছর চাওয়া হয়েছে। আপনার সিভিতে প্রায় ${have} বছর দেখাচ্ছে${how}। ইন্টার্নশিপ, খণ্ডকালীন বা ফ্রিল্যান্স কাজ বাদ পড়ে থাকলে যোগ করুন।` }) };
  }
  if (r.kind === 'degree') {
    const need = t(LEVEL[r.required]);
    const title = { en: 'Education', bn: 'শিক্ষাগত যোগ্যতা' };
    if (r.status === 'unknown') return { title, body: t({ en: `The ad asks for at least ${need}. We could not find your degree on the CV.`, bn: `বিজ্ঞাপনে অন্তত ${need} চাওয়া হয়েছে। সিভিতে আপনার ডিগ্রি খুঁজে পাইনি।` }) };
    const have = t(LEVEL[r.have!]);
    return { title, body: t({ en: `The ad asks for at least ${need}. Your CV shows ${have}.`, bn: `বিজ্ঞাপনে অন্তত ${need} চাওয়া হয়েছে। আপনার সিভিতে ${have} ${r.status === 'meets' ? 'আছে' : 'দেখাচ্ছে'}।` }) };
  }
  const range = r.min ? `${num(r.min, lang)}–${num(r.max, lang)}` : `${num(r.max, lang)}`;
  return {
    title: { en: 'Age', bn: 'বয়স' },
    body: t({ en: `The ad mentions an age limit: ${range} years. Check the date the age is counted from.`, bn: `বিজ্ঞাপনে বয়সসীমা আছে: ${range} বছর। কোন তারিখ ধরে বয়স গণনা হবে, দেখে নিন।` }),
  };
}

/** What the ad asks for in years, degree and age, next to what the CV seems to show. A guide only. */
export function MatchRequirements({ items, t, lang }: { items: Requirement[]; t: T; lang: Lang }) {
  if (!items.length) return null;
  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-base font-semibold">{t({ en: 'What the ad asks for', bn: 'বিজ্ঞাপন যা চায়' })}</h3>
      <ul className="space-y-2">
        {items.map((r) => {
          const tone = TONE[r.status];
          const x = text(r, t, lang);
          return (
            <li key={r.kind} className={`flex gap-3 rounded-xl px-3 py-2.5 text-sm ${tone.box}`}>
              <span aria-label={t(tone.label)} className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white font-bold">{tone.mark}</span>
              <span><strong>{t(x.title)}{lang === 'bn' ? '।' : '.'}</strong> {x.body}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">{t({ en: 'Worked out from the plain text of your CV. Always check the ad yourself.', bn: 'আপনার সিভির লেখা থেকে হিসাব করা। বিজ্ঞাপনটি নিজেও দেখে নিন।' })}</p>
    </div>
  );
}
