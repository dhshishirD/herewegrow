import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { CART_PRODUCT_ID, cartProduct, quoteCart } from '../../shared/cart';
import { findProduct, type Product } from '../../shared/catalog';
import { markCartPending } from '../lib/cart';
import { taka, useLang } from '../lib/lang';

/** Opens checkout for one product, or for a cart of templates when templateIds is given. */
type OpenCheckout = (productId: string, templateIds?: string[]) => void;

const CheckoutContext = createContext<OpenCheckout>(() => {});

export const useCheckout = () => useContext(CheckoutContext);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<{ product: Product; templateIds?: string[] } | null>(null);
  const start: OpenCheckout = (id, templateIds) => {
    if (id === CART_PRODUCT_ID && templateIds) {
      setOpen({ product: cartProduct(quoteCart(templateIds)), templateIds });
      return;
    }
    const product = findProduct(id);
    setOpen(product ? { product } : null);
  };
  return (
    <CheckoutContext.Provider value={start}>
      {children}
      {open && <CheckoutDialog product={open.product} templateIds={open.templateIds} onClose={() => setOpen(null)} />}
    </CheckoutContext.Provider>
  );
}

const ERRORS: Record<string, { en: string; bn: string }> = {
  phone: {
    en: 'This number looks incomplete. Use 11 digits starting with 01, or leave it empty.',
    bn: 'নম্বরটি অসম্পূর্ণ মনে হচ্ছে। ০১ দিয়ে শুরু ১১ সংখ্যা দিন, অথবা খালি রাখুন।',
  },
  email: { en: 'Check the email address, or leave it empty.', bn: 'ইমেইল ঠিক আছে কিনা দেখুন, অথবা খালি রাখুন।' },
  gateway: {
    en: 'The payment page could not open. Try again in a minute, or order on WhatsApp.',
    bn: 'পেমেন্ট পেজ খোলা যায়নি। এক মিনিট পর আবার চেষ্টা করুন, অথবা হোয়াটসঅ্যাপে অর্ডার করুন।',
  },
};

function CheckoutDialog({ product, templateIds, onClose }: { product: Product; templateIds?: string[]; onClose: () => void }) {
  const { t, lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [busy, onClose]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    setDetail(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: templateIds ? CART_PRODUCT_ID : product.id,
          templateIds,
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email'),
          note: form.get('note'),
          lang,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; paymentUrl?: string; error?: string; detail?: string };
      if (data.ok && data.paymentUrl) {
        if (templateIds) markCartPending();
        window.location.href = data.paymentUrl;
        return;
      }
      setError(data.error && ERRORS[data.error] ? data.error : 'gateway');
      setDetail(data.detail ?? (res.ok ? null : `HTTP ${res.status}${data.error ? ` (${data.error})` : ''}`));
    } catch {
      setError('gateway');
    }
    setBusy(false);
  };

  const isService = product.kind === 'service';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-6" onClick={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="cart-sheet-up w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="checkout-title" className="text-2xl font-bold">{t(product.name)}</h2>
            <p className="mt-1 text-muted">{t(product.delivery)}</p>
          </div>
          <div className="flex items-start gap-3">
            <p className="font-display text-2xl font-bold text-leaf whitespace-nowrap">{taka(product.price, lang)}</p>
            <button type="button" onClick={onClose} disabled={busy} aria-label={t({ en: 'Close', bn: 'বন্ধ করুন' })}
              className="-mr-2 -mt-1 rounded-full p-2 text-muted hover:bg-mist hover:text-ink">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <p className="flex gap-2 rounded-lg bg-leaf-soft px-4 py-3 text-sm text-leaf-dark">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>
            {t({
              en: 'All fields are optional. A WhatsApp number helps us reach you if anything goes wrong.',
              bn: 'সব ঘর ঐচ্ছিক। হোয়াটসঅ্যাপ নম্বর দিলে কোনো সমস্যা হলে আমরা যোগাযোগ করতে পারব।',
            })}</span>
          </p>
          <div>
            <label className="label" htmlFor="co-phone">{t({ en: 'WhatsApp number', bn: 'হোয়াটসঅ্যাপ নম্বর' })}</label>
            <input ref={firstField} id="co-phone" name="phone" className="field" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" maxLength={16}
              aria-invalid={error === 'phone'} aria-describedby={error === 'phone' ? 'co-error' : undefined} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="co-name">{t({ en: 'Name', bn: 'নাম' })}</label>
              <input id="co-name" name="name" className="field" autoComplete="name" maxLength={80} />
            </div>
            <div>
              <label className="label" htmlFor="co-email">{t({ en: 'Email', bn: 'ইমেইল' })}</label>
              <input id="co-email" name="email" type="email" className="field" autoComplete="email" maxLength={120}
                aria-invalid={error === 'email'} aria-describedby={error === 'email' ? 'co-error' : undefined} />
            </div>
          </div>
          {isService && (
            <div>
              <label className="label" htmlFor="co-note">{t({ en: 'Target job or note', bn: 'লক্ষ্য চাকরি বা নোট' })}</label>
              <textarea id="co-note" name="note" rows={2} className="field" maxLength={500}
                placeholder={t({ en: 'e.g. Junior Officer at a private bank', bn: 'যেমন: বেসরকারি ব্যাংকে জুনিয়র অফিসার' })} />
            </div>
          )}

          {error && (
            <div id="co-error" role="alert" className="rounded-lg bg-alert/10 px-4 py-3 text-alert">
              <p>{t(ERRORS[error])}</p>
              {detail && <p className="mt-1 break-words text-xs text-alert/80">{t({ en: 'Details', bn: 'বিস্তারিত' })}: {detail}</p>}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy
              ? t({ en: 'Opening payment page…', bn: 'পেমেন্ট পেজ খোলা হচ্ছে…' })
              : t({ en: `Pay ${taka(product.price, 'en')}`, bn: `${taka(product.price, 'bn')} পরিশোধ করুন` })}
          </button>
          <ul className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold" aria-label={t({ en: 'Payment methods', bn: 'পেমেন্ট মাধ্যম' })}>
            {[['bKash', '#e2136e'], ['Nagad', '#f6921e'], ['Rocket', '#8c3494']].map(([n, c]) => (
              <li key={n} className="rounded-full px-3 py-1 text-white" style={{ background: c }}>{n}</li>
            ))}
          </ul>
          <p className="text-center text-sm text-muted">{t({ en: 'Secure payment page. Your files or Pro are ready right after paying.', bn: 'নিরাপদ পেমেন্ট পেজ। পেমেন্টের পরেই ফাইল বা প্রো চালু।' })}</p>
          <p className="text-sm text-muted">
            {isService
              ? t({
                  en: 'After paying, send your current CV or details on WhatsApp. We start as soon as we have them.',
                  bn: 'পেমেন্টের পর হোয়াটসঅ্যাপে আপনার বর্তমান সিভি বা তথ্য পাঠান। তথ্য পেলেই কাজ শুরু হবে।',
                })
              : product.files?.length
                ? t({
                    en: 'After paying, you come back here and download your files straight away.',
                    bn: 'পেমেন্টের পর এখানে ফিরে এসে সাথে সাথে ফাইল ডাউনলোড করবেন।',
                  })
                : t({
                    en: 'After paying, message us on WhatsApp and we send your files.',
                    bn: 'পেমেন্টের পর হোয়াটসঅ্যাপে মেসেজ দিন, আমরা ফাইল পাঠিয়ে দেব।',
                  })}
          </p>
        </form>
      </div>
    </div>
  );
}
