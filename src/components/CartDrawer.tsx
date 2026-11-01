import { useEffect, useRef } from 'react';
import { CART_PRODUCT_ID, TIERS, nextTier, quoteCart, tierFor } from '../../shared/cart';
import { SINGLE_TEMPLATE_PRICE, findTemplate } from '../../shared/templates';
import { useCart } from '../lib/cart';
import { num, taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { useCheckout } from './Checkout';

/** Cart button for the header, with a count badge. */
export function CartButton() {
  const { ids, setOpen } = useCart();
  const { t, lang } = useLang();
  return (
    <button type="button" onClick={() => setOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-md border border-line hover:border-leaf hover:text-leaf"
      aria-label={t({ en: `Cart, ${ids.length} templates`, bn: `কার্ট, ${num(String(ids.length), 'bn')}টি টেমপ্লেট` })}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 7h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9z" /><path d="M9 7V6a3 3 0 0 1 6 0v1" />
      </svg>
      {ids.length > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-saffron px-1 text-xs font-bold text-ink">{num(String(ids.length), lang)}</span>
      )}
    </button>
  );
}

/** The "how the discount works" ladder, used in the cart and on the templates page. */
export function DiscountLadder({ count }: { count?: number }) {
  const { t, lang } = useLang();
  const current = count ? tierFor(count) : undefined;
  return (
    <ol className="grid grid-cols-5 gap-1.5 text-center">
      {TIERS.map((tier, i) => {
        const next = TIERS[i + 1];
        const range = next ? (next.min - 1 === tier.min ? `${tier.min}` : `${tier.min}–${next.min - 1}`) : `${tier.min}+`;
        const active = current?.min === tier.min;
        const each = Math.round(SINGLE_TEMPLATE_PRICE * (1 - tier.off / 100));
        return (
          <li key={tier.min} className={`rounded-lg px-1 py-2 ${active ? 'bg-leaf text-white' : 'bg-mist text-ink'}`}>
            <span className="block text-xs opacity-80">{t({ en: `${range} items`, bn: `${num(range, 'bn')}টি` })}</span>
            <span className="block font-display text-lg font-semibold leading-tight">{tier.off ? `${num(String(tier.off), lang)}%` : taka(SINGLE_TEMPLATE_PRICE, lang)}</span>
            <span className="block text-xs opacity-80">{tier.off ? t({ en: `৳${each} each`, bn: `প্রতিটি ৳${num(String(each), 'bn')}` }) : t({ en: 'each', bn: 'প্রতিটি' })}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function CartDrawer() {
  const { ids, remove, clear, isOpen, setOpen } = useCart();
  const { t, lang } = useLang();
  const checkout = useCheckout();
  const closeRef = useRef<HTMLButtonElement>(null);
  const q = quoteCart(ids);
  const next = nextTier(q.count);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  const pay = () => {
    setOpen(false);
    checkout(CART_PRODUCT_ID, q.ids);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/45" onClick={() => setOpen(false)}>
      <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(e) => e.stopPropagation()}
        className="cart-sheet flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="cart-title" className="text-2xl">{t({ en: 'Your templates', bn: 'আপনার টেমপ্লেট' })}</h2>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={t({ en: 'Close', bn: 'বন্ধ করুন' })} className="rounded-full p-2 text-muted hover:bg-mist hover:text-ink">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {q.count === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
            <p className="font-display text-xl">{t({ en: 'Your cart is empty.', bn: 'আপনার কার্ট খালি।' })}</p>
            <p className="text-muted">{t({ en: 'Add templates and the price per template goes down: up to 35% off, and never more than ৳249 for all 40.', bn: 'টেমপ্লেট যোগ করুন, যত বেশি নেবেন প্রতিটির দাম তত কমবে: ৩৫% পর্যন্ত ছাড়, আর ৪০টির জন্য কখনও ৳২৪৯-এর বেশি নয়।' })}</p>
            <Link href="/templates" onClick={() => setOpen(false)} className="btn btn-primary">{t({ en: 'Browse templates', bn: 'টেমপ্লেট দেখুন' })}</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {q.ids.map((id) => {
                const tpl = findTemplate(id)!;
                return (
                  <li key={id} className="flex items-center gap-4 py-3">
                    <img src={`/templates/${id}/thumb.webp`} alt="" width={48} height={68} loading="lazy" className="h-[68px] w-12 shrink-0 rounded-sm bg-white object-cover object-top ring-1 ring-line" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{t(tpl.title)}</p>
                      <p className="text-sm text-muted line-through decoration-muted/60">{taka(SINGLE_TEMPLATE_PRICE, lang)}</p>
                    </div>
                    <button type="button" onClick={() => remove(id)} className="text-sm text-muted underline underline-offset-4 hover:text-alert">
                      {t({ en: 'Remove', bn: 'বাদ দিন' })}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line bg-white px-6 pb-6 pt-4">
              {q.upgrade ? (
                <p className="rounded-lg bg-gold-soft px-4 py-3 text-sm text-ink">
                  {t({
                    en: `Better deal applied: you get the whole ${q.upgrade.name.en} (${q.upgrade.id === 'pack-best-40' ? 40 : q.upgrade.templates?.length} templates) for this price.`,
                    bn: `আরও ভালো অফার: এই দামেই পুরো ${q.upgrade.name.bn} (${num(String(q.upgrade.id === 'pack-best-40' ? 40 : q.upgrade.templates?.length ?? ''), 'bn')}টি টেমপ্লেট) পাচ্ছেন।`,
                  })}
                </p>
              ) : next ? (
                <p className="rounded-lg bg-leaf-soft px-4 py-3 text-sm text-leaf-dark">
                  {t({
                    en: `Add ${next.min - q.count} more to get ${next.off}% off every template.`,
                    bn: `আরও ${num(String(next.min - q.count), 'bn')}টি যোগ করলে প্রতিটিতে ${num(String(next.off), 'bn')}% ছাড়।`,
                  })}
                </p>
              ) : null}

              <div className="mt-4"><DiscountLadder count={q.count} /></div>

              <dl className="mt-4 space-y-1">
                <div className="flex justify-between text-muted">
                  <dt>{t({ en: `${q.count} × ${taka(SINGLE_TEMPLATE_PRICE, 'en')}`, bn: `${num(String(q.count), 'bn')} × ${taka(SINGLE_TEMPLATE_PRICE, 'bn')}` })}</dt>
                  <dd>{taka(q.listTotal, lang)}</dd>
                </div>
                {q.savings > 0 && (
                  <div className="flex justify-between font-semibold text-leaf">
                    <dt>{t({ en: `You save ${q.percent}%`, bn: `সাশ্রয় ${num(String(q.percent), 'bn')}%` })}</dt>
                    <dd>−{taka(q.savings, lang)}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-line pt-2">
                  <dt className="font-display text-lg">{t({ en: 'Total', bn: 'মোট' })}</dt>
                  <dd className="font-display text-3xl font-semibold text-ink">{taka(q.total, lang)}</dd>
                </div>
              </dl>

              <button type="button" onClick={pay} className="btn btn-primary mt-4 w-full">
                {t({ en: `Pay ${taka(q.total, 'en')} and download`, bn: `${taka(q.total, 'bn')} দিয়ে ডাউনলোড করুন` })}
              </button>
              <button type="button" onClick={clear} className="mt-3 w-full text-center text-sm text-muted underline underline-offset-4 hover:text-alert">
                {t({ en: 'Empty cart', bn: 'কার্ট খালি করুন' })}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
