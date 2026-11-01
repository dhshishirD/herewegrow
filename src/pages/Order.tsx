import { useEffect, useState, type FormEvent } from 'react';
import { DownloadButtons } from '../components/Downloads';
import { PageHead } from '../components/PageHead';
import { useLang } from '../lib/lang';
import { productFor, savedOrders, saveOrder, verifyInvoice, type VerifyResponse } from '../lib/orders';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';

type State = { kind: 'idle' } | { kind: 'checking' } | { kind: 'error' } | { kind: 'done'; data: VerifyResponse };

/** Download again: enter an invoice number (or pick a recent order on this device). */
export function OrderPage() {
  const { t } = useLang();
  const initial = new URLSearchParams(window.location.search).get('invoice_id') ?? '';
  const [invoice, setInvoice] = useState(initial);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const recent = savedOrders();

  const title = t({ en: 'Download your files again', bn: 'আবার ফাইল ডাউনলোড করুন' });
  const intro = t({
    en: 'Enter the invoice number from your payment, and get fresh download links.',
    bn: 'পেমেন্টের ইনভয়েস নম্বর দিন, নতুন ডাউনলোড লিংক পেয়ে যাবেন।',
  });
  useEffect(() => setPageMeta(title, intro, '/order'), [title, intro]);

  const check = async (id: string) => {
    const clean = id.trim();
    if (!clean) return;
    setInvoice(clean);
    setState({ kind: 'checking' });
    try {
      const data = await verifyInvoice(clean);
      if (data.ok && data.status === 'paid' && data.productId) saveOrder({ invoiceId: clean, productId: data.productId, templateIds: data.templateIds, at: Date.now() });
      setState(data.ok ? { kind: 'done', data } : { kind: 'error' });
    } catch {
      setState({ kind: 'error' });
    }
  };

  useEffect(() => {
    if (initial) void check(initial);
    // run once for a link that already carries the invoice number
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void check(invoice);
  };

  const data = state.kind === 'done' ? state.data : null;
  const product = productFor(data?.productId, data?.templateIds);
  const help = whatsappLink(`Hello HereWeGrow, I need my files again. Invoice: ${invoice || '(not sure)'}.`);

  return (
    <>
      <PageHead crumbs={[{ href: '/order', label: { en: 'Download again', bn: 'আবার ডাউনলোড' } }]} title={title} intro={intro} />
      <section className="wrap grid gap-10 py-14 md:grid-cols-[1fr_1fr]">
        <div>
          <form onSubmit={submit} className="rounded-2xl bg-white p-6 ring-1 ring-line sm:p-8">
            <label className="label" htmlFor="inv">{t({ en: 'Invoice number', bn: 'ইনভয়েস নম্বর' })}</label>
            <input id="inv" className="field" value={invoice} onChange={(e) => setInvoice(e.target.value)} autoComplete="off" spellCheck={false} maxLength={80}
              placeholder={t({ en: 'From your payment page or SMS', bn: 'পেমেন্ট পেজ বা এসএমএস থেকে' })} />
            <button type="submit" className="btn btn-primary mt-4 w-full" disabled={state.kind === 'checking' || !invoice.trim()}>
              {state.kind === 'checking' ? t({ en: 'Checking…', bn: 'যাচাই হচ্ছে…' }) : t({ en: 'Get my files', bn: 'ফাইল নিন' })}
            </button>
            <p className="mt-4 text-sm text-muted">
              {t({ en: 'Lost the invoice number? ', bn: 'ইনভয়েস নম্বর হারিয়ে গেছে? ' })}
              <a href={help} target="_blank" rel="noreferrer" className="font-semibold text-leaf underline underline-offset-4">
                {t({ en: 'Send your bKash/Nagad transaction ID on WhatsApp', bn: 'হোয়াটসঅ্যাপে বিকাশ/নগদের ট্রানজেকশন আইডি পাঠান' })}
              </a>
            </p>
          </form>

          {recent.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl">{t({ en: 'Recent orders on this device', bn: 'এই ডিভাইসের সাম্প্রতিক অর্ডার' })}</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {recent.map((o) => {
                  const p = productFor(o.productId, o.templateIds);
                  return (
                    <li key={o.invoiceId} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p ? t(p.name) : o.productId}</p>
                        <p className="truncate text-sm text-muted">{o.invoiceId}</p>
                      </div>
                      <button type="button" className="btn btn-quiet shrink-0" onClick={() => void check(o.invoiceId)}>
                        {t({ en: 'Download', bn: 'ডাউনলোড' })}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div aria-live="polite">
          {state.kind === 'idle' && (
            <div className="rounded-2xl border-2 border-dashed border-line p-8 text-muted">
              {t({ en: 'Your files will appear here.', bn: 'আপনার ফাইল এখানে দেখাবে।' })}
            </div>
          )}
          {state.kind === 'error' && (
            <div className="rounded-2xl bg-alert/10 p-6 text-alert">
              {t({ en: 'Could not check right now. Try again in a minute, or message us on WhatsApp.', bn: 'এখন যাচাই করা যাচ্ছে না। এক মিনিট পর আবার চেষ্টা করুন, অথবা হোয়াটসঅ্যাপে মেসেজ দিন।' })}
            </div>
          )}
          {data && data.status === 'paid' && product && (
            <div className="rounded-2xl bg-leaf-soft p-6 sm:p-8">
              <p className="font-display text-2xl">{t(product.name)}</p>
              {data.downloads && data.downloads.length > 0 ? (
                <div className="mt-5"><DownloadButtons downloads={data.downloads} /></div>
              ) : (
                <>
                  <p className="mt-2 text-muted">
                    {product.kind === 'service'
                      ? t({ en: 'This is a service order. Your files come from our team on WhatsApp.', bn: 'এটি সার্ভিস অর্ডার। আমাদের টিম হোয়াটসঅ্যাপে ফাইল পাঠাবে।' })
                      : t({ en: 'These files are sent on WhatsApp. Tap below and we will send them again.', bn: 'এই ফাইলগুলো হোয়াটসঅ্যাপে পাঠানো হয়। নিচে চাপ দিন, আবার পাঠিয়ে দেব।' })}
                  </p>
                  <a href={help} target="_blank" rel="noreferrer" className="btn btn-primary mt-5">{t({ en: 'Message us on WhatsApp', bn: 'হোয়াটসঅ্যাপে মেসেজ দিন' })}</a>
                </>
              )}
            </div>
          )}
          {data && data.status !== 'paid' && (
            <div className="rounded-2xl bg-mist p-6 sm:p-8">
              <p className="font-display text-xl">
                {data.status === 'pending'
                  ? t({ en: 'This payment is still being confirmed.', bn: 'এই পেমেন্ট এখনও নিশ্চিত হচ্ছে।' })
                  : t({ en: 'We could not find a completed payment with this number.', bn: 'এই নম্বরে কোনো সম্পন্ন পেমেন্ট পাওয়া যায়নি।' })}
              </p>
              <p className="mt-2 text-muted">{t({ en: 'Check the number, or send your transaction ID on WhatsApp.', bn: 'নম্বরটি দেখে নিন, অথবা হোয়াটসঅ্যাপে ট্রানজেকশন আইডি পাঠান।' })}</p>
              <a href={help} target="_blank" rel="noreferrer" className="btn btn-quiet mt-5 bg-white">{t({ en: 'Ask on WhatsApp', bn: 'হোয়াটসঅ্যাপে জিজ্ঞেস করুন' })}</a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
