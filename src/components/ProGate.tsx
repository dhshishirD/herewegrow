import { useEffect, useRef } from 'react';
import { PRO_DESIGN_COUNT } from '../../shared/designList';
import { PLANS, PRO_LIMITS } from '../../shared/plans';
import { num, taka, useLang } from '../lib/lang';
import { navigate } from '../lib/router';

type B = { en: string; bn: string };

/** Shown when a free user tries to download a Pro design. Never a dead end: they can switch to a free design. */
export function ProGate({ designName, onClose, onUseFree }: { designName: B; onClose: () => void; onUseFree: () => void }) {
  const { t } = useLang();
  const primary = useRef<HTMLButtonElement>(null);
  const from = Math.min(...PLANS.map((p) => p.price));

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const perks: B[] = [
    { en: 'Download PDF and Word without the HereWeGrow mark', bn: 'HereWeGrow চিহ্ন ছাড়া PDF ও Word ডাউনলোড' },
    { en: `All ${PRO_DESIGN_COUNT} premium designs`, bn: `সব ${num(PRO_DESIGN_COUNT, 'bn')}টি প্রিমিয়াম ডিজাইন` },
    { en: `Save up to ${PRO_LIMITS.savedCvs} CVs, open on any device`, bn: `${num(PRO_LIMITS.savedCvs, 'bn')}টি পর্যন্ত সিভি সেভ, যেকোনো ডিভাইসে` },
    { en: 'Word templates at 50% off or free', bn: 'Word টেমপ্লেট ৫০% ছাড়ে বা ফ্রি' },
  ];

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/55 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="pro-gate-title" onClick={(e) => e.stopPropagation()}
        className="cart-sheet-up w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="relative bg-leaf-dark px-6 pb-6 pt-7 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">Pro</span>
          <h2 id="pro-gate-title" className="mt-3 text-2xl font-semibold text-white">
            {t({ en: `Unlock the ${designName.en} design`, bn: `${designName.bn} ডিজাইনটি আনলক করুন` })}
          </h2>
          <p className="mt-1.5 text-white/80">
            {t({ en: `From ${taka(from, 'en')}. Pay once by bKash or Nagad, no auto-renewal.`, bn: `${taka(from, 'bn')} থেকে। বিকাশ বা নগদে একবার পেমেন্ট, নিজে থেকে নবায়ন নেই।` })}
          </p>
          <button type="button" onClick={onClose} aria-label={t({ en: 'Close', bn: 'বন্ধ করুন' })}
            className="absolute right-3 top-3 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="p-6">
          <ul className="space-y-2.5">
            {perks.map((p) => (
              <li key={p.en} className="flex gap-2.5">
                <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-leaf"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>{t(p)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">{t({ en: 'Your CV stays as it is. After paying you come straight back here to download.', bn: 'আপনার সিভি যেমন আছে তেমনই থাকবে। পেমেন্টের পর এখানে ফিরে এসেই ডাউনলোড করবেন।' })}</p>
          <button ref={primary} type="button" className="btn btn-primary mt-5 w-full" onClick={() => navigate('/pro')}>
            {t({ en: 'See Pro passes', bn: 'প্রো পাস দেখুন' })}
          </button>
          <button type="button" className="btn btn-quiet mt-2 w-full" onClick={onUseFree}>
            {t({ en: 'Download free with the Classic design', bn: 'ক্লাসিক ডিজাইনে ফ্রি ডাউনলোড করুন' })}
          </button>
        </div>
      </div>
    </div>
  );
}
