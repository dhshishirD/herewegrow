import { useEffect } from 'react';
import { findPlan } from '../../shared/plans';
import { taka } from '../lib/lang';
import { Link } from '../lib/router';
import { track } from '../lib/track';
import { whatsappLink } from '../lib/whatsapp';

/**
 * Shown after every free export. The free file has already downloaded; this offers the clean PDF.
 * Always Bangla (the builder forces English on the page, but this offer is for Bangladeshi job seekers).
 * No promise of jobs, visas or outcomes. The price comes from the plan, never typed here.
 */
export function ExportReady({ onClose }: { onClose: () => void }) {
  const price = taka(findPlan('pro-7')?.price ?? 49, 'bn');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/55 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="export-ready-title" onClick={(e) => e.stopPropagation()}
        className="cart-sheet-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="overflow-y-auto px-6 pb-4 pt-7">
          <h2 id="export-ready-title" className="text-2xl font-semibold leading-snug">আপনার CV তৈরি!</h2>
          <p className="mt-2 text-lg leading-relaxed text-muted">আপনার ফ্রি ফাইল ডাউনলোড হয়ে গেছে। ওয়াটারমার্ক ছাড়া পরিষ্কার PDF চাইলে ৭ দিনের পাস নিন।</p>
          <p className="mt-4 text-lg font-semibold">{price} · ৭ দিন · বিকাশ বা নগদে পেমেন্ট</p>
          <p className="mt-3 text-base text-muted">আমরা এজেন্ট নই; ভিসা বা চাকরি বিক্রি করি না</p>
          <a href={whatsappLink('আমার CV ডাউনলোড নিয়ে সাহায্য দরকার')} target="_blank" rel="noreferrer"
            onClick={() => track('cta_whatsapp_click', { where: 'export_ready' })}
            className="mt-4 inline-block text-base font-semibold text-leaf underline underline-offset-4">
            হোয়াটসঅ্যাপে সাহায্য নিন
          </a>
        </div>
        <div className="sticky bottom-0 grid gap-2 border-t border-line bg-white px-6 pb-5 pt-3">
          <Link href="/pro?plan=pro-7&from=export" className="btn btn-primary !min-h-12 w-full text-[1.05rem]">
            ক্লিন PDF নিন — {price} (৭ দিন)
          </Link>
          <button type="button" className="btn btn-quiet !min-h-12 w-full" onClick={onClose}>ফ্রি ভার্সন রাখুন</button>
        </div>
      </div>
    </div>
  );
}
