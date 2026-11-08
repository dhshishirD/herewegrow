import { useEffect, useState } from 'react';
import { PageHead, TOOLS_CRUMB } from '../components/PageHead';
import { num, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { analyze, NOTE, type Result } from '../lib/scamShield';
import { setPageMeta } from '../lib/seo';
import { track } from '../lib/track';

// An invented example (not a real person or company) so visitors can see how the check reads.
const EXAMPLE =
  'জরুরি নিয়োগ! অফিস সহকারী পদে ১০ জন। বেতন ২৫,০০০ টাকা। রেজিস্ট্রেশন ফি ২৯৫০ টাকা বিকাশ ০১৭XXXXXXXX নম্বরে পাঠান। ইন্টারভিউ ছাড়াই নিশ্চিত চাকরি। আজ রাতের মধ্যে ইনবক্সে যোগাযোগ করুন।';

const VERIFY_LINKS = [
  {
    href: 'https://www.oep.gov.bd/agencies',
    label: { en: 'Official recruiting agency list (check the RL number)', bn: 'সরকারি রিক্রুটিং এজেন্সি তালিকা (RL নম্বর মেলান)' },
  },
  {
    href: 'https://www.baira.org.bd/dir/all-member-list',
    label: { en: 'BAIRA member list (second check)', bn: 'বায়রা সদস্য তালিকা (দ্বিতীয় যাচাই)' },
  },
  {
    href: 'https://bmet.gov.bd/',
    label: { en: 'BMET (Bureau of Manpower, Employment and Training)', bn: 'জনশক্তি, কর্মসংস্থান ও প্রশিক্ষণ ব্যুরো (BMET)' },
  },
];

export function ScamShield() {
  const { t } = useLang();
  const [text, setText] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageMeta(
      t({ en: 'Free fake job checker (Scam Shield)', bn: 'ভুয়া চাকরির বিজ্ঞপ্তি চেকার (Scam Shield)' }),
      t({
        en: 'Paste a job circular or message and see the red flags: fees, bKash payments, no interview, risky countries. Free, runs in your browser.',
        bn: 'চাকরির বিজ্ঞপ্তি বা মেসেজ পেস্ট করে লাল পতাকা দেখুন: ফি, বিকাশে টাকা, ইন্টারভিউ ছাড়া চাকরি, ঝুঁকিপূর্ণ দেশ। ফ্রি, ব্রাউজারেই চলে।',
      }),
      '/tools/scam-shield',
    );
  }, [t]);

  const check = () => {
    setError(null);
    if (text.trim().length < 20) {
      setError(t({ en: 'Paste the whole circular or message, at least a couple of lines.', bn: 'পুরো বিজ্ঞপ্তি বা মেসেজ পেস্ট করুন, অন্তত দুই-তিন লাইন।' }));
      setResult(null);
      return;
    }
    const r = analyze(text);
    setResult(r);
    // Only the risk level and rule ids are recorded. The pasted text is never sent anywhere.
    track('scam_check', { level: r.level, flags: r.flags.length });
  };

  const tone = !result ? '' : result.level === 'high' ? 'text-alert' : result.level === 'caution' ? 'text-gold' : 'text-muted';
  const heading = !result
    ? ''
    : result.level === 'high'
      ? t({ en: `High risk: ${result.flags.length} red flag${result.flags.length === 1 ? '' : 's'}`, bn: `উচ্চ ঝুঁকি – ${num(result.flags.length, 'bn')}টি লাল পতাকা` })
      : result.level === 'caution'
        ? t({ en: `Be careful: ${result.flags.length} warning${result.flags.length === 1 ? '' : 's'}`, bn: `সতর্ক থাকুন – ${num(result.flags.length, 'bn')}টি সতর্কতা` })
        : t({ en: 'No red flags found, but still verify', bn: 'কোনো লাল পতাকা পাওয়া যায়নি, তবুও যাচাই করুন' });

  return (
    <>
      <PageHead
        crumbs={[TOOLS_CRUMB]}
        title={t({ en: 'Fake job checker', bn: 'ভুয়া চাকরির বিজ্ঞপ্তি চেকার' })}
        intro={t({
          en: 'Got a job circular or message and not sure it is real? Paste it here to see the warning signs. The text stays in your browser and is never sent to us.',
          bn: 'চাকরির বিজ্ঞপ্তি বা মেসেজ আসল কি না নিশ্চিত নন? এখানে পেস্ট করে সতর্কতার লক্ষণ দেখুন। লেখাটি আপনার ব্রাউজারেই থাকে, আমাদের কাছে পাঠানো হয় না।',
        })}
      />

      <section className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <label className="label" htmlFor="scam-text">{t({ en: 'Paste the circular or message', bn: 'বিজ্ঞপ্তি বা মেসেজ পেস্ট করুন' })}</label>
          <textarea id="scam-text" rows={10} className="field" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={check}>{t({ en: 'Check for red flags', bn: 'লাল পতাকা দেখুন' })}</button>
            <button type="button" className="btn" onClick={() => { setText(EXAMPLE); setResult(null); setError(null); }}>
              {t({ en: 'Try an example', bn: 'একটি উদাহরণ দেখুন' })}
            </button>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg bg-alert/10 px-4 py-3 text-alert">{error}</p>}

          <p className="mt-8 text-sm text-muted">
            {t({
              en: 'This is an automatic check of common warning signs. It cannot prove a job is real or fake. HereWeGrow is not a recruiting agent and does not sell jobs or visas.',
              bn: 'এটি সাধারণ সতর্কতার লক্ষণের স্বয়ংক্রিয় চেক। চাকরি আসল না ভুয়া, তা এটি প্রমাণ করতে পারে না। HereWeGrow রিক্রুটিং এজেন্ট নয়, চাকরি বা ভিসা বিক্রি করে না।',
            })}
          </p>
        </div>

        <div aria-live="polite">
          {!result ? (
            <div className="rounded-2xl border border-line p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t({ en: 'What we look for', bn: 'যা যা দেখা হয়' })}</p>
              <ul className="mt-4 space-y-3">
                {[
                  { en: 'Money asked first: fee, deposit, processing charge', bn: 'আগে টাকা চাওয়া: ফি, জামানত, প্রসেসিং চার্জ' },
                  { en: 'Payment to a personal bKash or Nagad number', bn: 'ব্যক্তিগত বিকাশ/নগদ নম্বরে টাকা' },
                  { en: 'A guaranteed job with no interview', bn: 'ইন্টারভিউ ছাড়া নিশ্চিত চাকরি' },
                  { en: 'Very high pay for simple work, or computer jobs in Cambodia, Laos, Myanmar, Vietnam, Thailand', bn: 'সহজ কাজে অনেক বেতন, বা কম্বোডিয়া/লাওস/মিয়ানমার/ভিয়েতনাম/থাইল্যান্ডে কম্পিউটার চাকরি' },
                  { en: 'Overseas offers with no agency licence (RL) number', bn: 'এজেন্সির লাইসেন্স (RL) নম্বর ছাড়া বিদেশের অফার' },
                  { en: 'OTP, PIN or card details asked', bn: 'OTP, পিন বা কার্ডের তথ্য চাওয়া' },
                ].map((x) => <li key={x.en} className="border-l-[3px] border-gold pl-4 text-muted">{t(x)}</li>)}
              </ul>
              <p className="mt-4 text-sm text-muted">{t({ en: 'Paste a message on the left to see your result.', bn: 'ফল দেখতে বাঁ দিকে একটি মেসেজ পেস্ট করুন।' })}</p>
            </div>
          ) : (
            <div>
              <div className="border-b border-line pb-5">
                <p className={`font-display text-3xl font-bold leading-tight sm:text-4xl ${tone}`}>{heading}</p>
                <p className="mt-2 text-sm text-muted">{t(NOTE)}</p>
              </div>

              {result.flags.length > 0 && (
                <ul className="mt-6 space-y-5">
                  {result.flags.map((f) => (
                    <li key={f.id} className={`border-l-[3px] pl-4 ${f.severity === 'high' ? 'border-alert' : 'border-gold'}`}>
                      <p className="font-display font-semibold">{t(f.title)}</p>
                      <p className="text-muted">{t(f.why)}</p>
                      <p className="mt-1 text-sm text-muted">
                        {t({ en: 'In your text: ', bn: 'আপনার লেখায়: ' })}<q className="rounded bg-mist px-1">{f.evidence}</q>
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 rounded-2xl border border-line p-6">
                <p className="font-display text-xl font-bold">{t({ en: 'Verify before you act', bn: 'কিছু করার আগে যাচাই করুন' })}</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
                  <li>{t({ en: 'Open the organisation’s own website yourself and find the same notice. Do not use a link from the message.', bn: 'প্রতিষ্ঠানের নিজস্ব ওয়েবসাইট নিজে খুলে একই বিজ্ঞপ্তি খুঁজুন। মেসেজের লিংক ব্যবহার করবেন না।' })}</li>
                  <li>{t({ en: 'Never pay to get a job. Never share an OTP or PIN.', bn: 'চাকরি পেতে টাকা দেবেন না। OTP বা পিন কাউকে দেবেন না।' })}</li>
                  <li>{t({ en: 'For an overseas job, check the agency’s RL number in the official list and keep a copy of the signed contract.', bn: 'বিদেশের চাকরির জন্য এজেন্সির RL নম্বর সরকারি তালিকায় মেলান এবং সই করা চুক্তির কপি রাখুন।' })}</li>
                </ul>
                <ul className="mt-4 space-y-2">
                  {VERIFY_LINKS.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-leaf underline underline-offset-4">{t(l.label)}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 rounded-2xl bg-leaf-soft p-6">
                <p className="font-display text-xl font-bold text-leaf-dark">{t({ en: 'Applying for real jobs?', bn: 'আসল চাকরিতে আবেদন করছেন?' })}</p>
                <p className="mt-1 text-leaf-dark/80">
                  {t({ en: 'Make a clean, one-page CV for free on your phone.', bn: 'ফোনেই বিনামূল্যে পরিষ্কার এক পাতার সিভি বানান।' })}
                </p>
                <Link href="/builder" className="btn btn-primary mt-4">{t({ en: 'Build my CV free', bn: 'ফ্রি সিভি বানান' })}</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
