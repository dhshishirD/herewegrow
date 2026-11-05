import { useEffect, useState } from 'react';
import { taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';
import { whatsappLink } from '../lib/whatsapp';
import { track } from '../lib/track';
import { DownloadButtons } from '../components/Downloads';
import { productFor, saveOrder, verifyInvoice, type VerifyResponse } from '../lib/orders';
import { takeCartPending, useCart } from '../lib/cart';
import { findPlan } from '../../shared/plans';
import { useAuth } from '../lib/auth';

type State = { kind: 'checking' } | { kind: 'missing' } | { kind: 'error' } | { kind: 'done'; data: VerifyResponse };

export function PaymentSuccess() {
  const { t, lang } = useLang();
  const { clear: clearCart } = useCart();
  const { refresh } = useAuth();
  const invoiceId = new URLSearchParams(window.location.search).get('invoice_id') ?? '';
  const [state, setState] = useState<State>(invoiceId ? { kind: 'checking' } : { kind: 'missing' });

  useEffect(() => {
    setPageMeta(t({ en: 'Payment', bn: 'পেমেন্ট' }), t({ en: 'Payment confirmation', bn: 'পেমেন্ট নিশ্চিতকরণ' }), '/payment/success');
  }, [t]);

  useEffect(() => {
    if (!invoiceId) return;
    verifyInvoice(invoiceId)
      .then((data) => {
        if (data.ok && data.status === 'paid' && findPlan(data.productId ?? '')) {
          void refresh(); // the header and Builder see Pro straight away
        } else if (data.ok && data.status === 'paid' && data.productId) {
          saveOrder({ invoiceId, productId: data.productId, templateIds: data.templateIds, at: Date.now() });
          if (takeCartPending()) clearCart();
        }
        setState(data.ok ? { kind: 'done', data } : { kind: 'error' });
      })
      .catch(() => setState({ kind: 'error' }));
  }, [invoiceId]);

  const plan = state.kind === 'done' ? findPlan(state.data.productId ?? '') : undefined;
  const product = state.kind === 'done' ? productFor(state.data.productId, state.data.templateIds) : undefined;
  const downloads = state.kind === 'done' && state.data.status === 'paid' ? state.data.downloads ?? [] : [];
  const ref = state.kind === 'done' ? state.data.transactionId || invoiceId : invoiceId;

  const message = plan
    ? `Hello HereWeGrow, I paid for "${plan.name.en}" but need help. Invoice: ${invoiceId}${ref !== invoiceId ? `, TrxID: ${ref}` : ''}.`
    : product
    ? `Hello HereWeGrow, I paid for "${product.name.en}". Invoice: ${invoiceId}${ref !== invoiceId ? `, TrxID: ${ref}` : ''}.${
        product.kind === 'service' ? ' I am sending my CV/details now.' : ' Please send my files.'
      }`
    : `Hello HereWeGrow, I made a payment. Invoice: ${invoiceId}.`;

  return (
    <section className="wrap max-w-2xl py-16">
      {state.kind === 'checking' && (
        <p role="status" className="font-display text-2xl font-semibold">{t({ en: 'Confirming your payment…', bn: 'আপনার পেমেন্ট নিশ্চিত করা হচ্ছে…' })}</p>
      )}

      {state.kind === 'done' && state.data.status === 'paid' && plan && (
        <div>
          <h1 className="text-4xl font-bold text-leaf">{t({ en: 'Pro is active', bn: 'প্রো চালু হয়েছে' })}</h1>
          <p className="mt-3 text-lg">
            {t(plan.name)}, {taka(state.data.amount ?? plan.price, lang)}.{' '}
            {state.data.proUntil
              ? t({
                  en: `Your Pro runs until ${new Date(state.data.proUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
                  bn: `আপনার প্রো ${new Date(state.data.proUntil).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })} পর্যন্ত চালু থাকবে।`,
                })
              : null}
          </p>
          <p className="mt-2 text-muted">{t({ en: 'Keep this reference:', bn: 'এই রেফারেন্সটি রাখুন:' })} <strong className="break-all">{ref}</strong></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/builder" className="btn btn-primary">{t({ en: 'Open the CV builder', bn: 'সিভি বিল্ডার খুলুন' })}</Link>
            <Link href="/account" className="btn btn-quiet">{t({ en: 'My account', bn: 'আমার অ্যাকাউন্ট' })}</Link>
          </div>
        </div>
      )}

      {state.kind === 'done' && state.data.status === 'paid' && product && (
        <div>
          <h1 className="text-4xl font-bold text-leaf">{t({ en: 'Payment received', bn: 'পেমেন্ট পেয়েছি' })}</h1>
          <p className="mt-3 text-lg">
            {t(product.name)}, {taka(state.data.amount ?? product.price, lang)}.{' '}
            {t({ en: 'Keep this reference:', bn: 'এই রেফারেন্সটি রাখুন:' })} <strong className="break-all">{ref}</strong>
          </p>
          {downloads.length > 0 ? (
            <div className="mt-8 rounded-2xl bg-leaf-soft p-6">
              <h2 className="text-xl font-bold">{t({ en: 'Your files are ready', bn: 'আপনার ফাইল প্রস্তুত' })}</h2>
              <p className="mt-2 text-muted">
                {t({
                  en: 'Tap to download. Need it again later? Go to herewegrow.pro/order and enter your invoice number.',
                  bn: 'চাপ দিয়ে ডাউনলোড করুন। পরে আবার লাগলে herewegrow.pro/order-এ গিয়ে ইনভয়েস নম্বর দিন।',
                })}
              </p>
              <div className="mt-5"><DownloadButtons downloads={downloads} /></div>
              <p className="mt-5 text-sm text-muted">
                {t({ en: 'Trouble downloading? ', bn: 'ডাউনলোডে সমস্যা? ' })}
                <a href={whatsappLink(message)} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'payment' })} className="font-semibold text-leaf underline underline-offset-4">
                  {t({ en: 'Get the files on WhatsApp', bn: 'হোয়াটসঅ্যাপে ফাইল নিন' })}
                </a>
              </p>
            </div>
          ) : (
          <div className="mt-8 rounded-2xl bg-mist p-6">
            <h2 className="text-xl font-bold">{t({ en: 'One more step', bn: 'আর একটি ধাপ' })}</h2>
            <p className="mt-2 text-muted">
              {product.kind === 'service'
                ? t({
                    en: 'Send your current CV (or your details) on WhatsApp. Your delivery time starts when we receive it.',
                    bn: 'হোয়াটসঅ্যাপে আপনার বর্তমান সিভি (বা তথ্য) পাঠান। তথ্য পাওয়ার পর থেকে ডেলিভারির সময় গণনা শুরু হবে।',
                  })
                : t({
                    en: 'Tap below to message us on WhatsApp. Your files will be sent there, usually within 2 hours (9am to 11pm).',
                    bn: 'নিচে চাপ দিয়ে হোয়াটসঅ্যাপে মেসেজ দিন। সাধারণত ২ ঘণ্টার মধ্যে (সকাল ৯টা–রাত ১১টা) সেখানে ফাইল পাঠানো হবে।',
                  })}
            </p>
            <a href={whatsappLink(message)} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'payment' })} className="btn btn-primary mt-5">
              {product.kind === 'service'
                ? t({ en: 'Send my CV on WhatsApp', bn: 'হোয়াটসঅ্যাপে সিভি পাঠান' })
                : t({ en: 'Get my files on WhatsApp', bn: 'হোয়াটসঅ্যাপে ফাইল নিন' })}
            </a>
          </div>
          )}
        </div>
      )}

      {state.kind === 'done' && state.data.status === 'pending' && (
        <div>
          <h1 className="text-4xl font-bold">{t({ en: 'Payment is being checked', bn: 'পেমেন্ট যাচাই হচ্ছে' })}</h1>
          <p className="mt-3 text-lg text-muted">
            {t({
              en: 'Your payment has not been confirmed yet. This usually takes a few minutes. Send us your transaction ID and we will confirm it by hand.',
              bn: 'আপনার পেমেন্ট এখনও নিশ্চিত হয়নি। সাধারণত কয়েক মিনিট লাগে। ট্রানজেকশন আইডি পাঠান, আমরা নিজে যাচাই করে দেব।',
            })}
          </p>
          <a href={whatsappLink(message)} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'payment' })} className="btn btn-primary mt-6">{t({ en: 'Send transaction ID on WhatsApp', bn: 'হোয়াটসঅ্যাপে ট্রানজেকশন আইডি পাঠান' })}</a>
        </div>
      )}

      {((state.kind === 'done' && (state.data.status === 'unpaid' || (state.data.status === 'paid' && !product && !plan))) || state.kind === 'error' || state.kind === 'missing') && (
        <div>
          <h1 className="text-4xl font-bold">{t({ en: 'We could not confirm this payment', bn: 'এই পেমেন্ট নিশ্চিত করা যায়নি' })}</h1>
          <p className="mt-3 text-lg text-muted">
            {t({
              en: 'If money left your account, send the transaction ID on WhatsApp and we will check it the same day. If you did not pay, you can order again.',
              bn: 'যদি টাকা কেটে থাকে, হোয়াটসঅ্যাপে ট্রানজেকশন আইডি পাঠান, একই দিনে যাচাই করা হবে। পেমেন্ট না করে থাকলে আবার অর্ডার করতে পারেন।',
            })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={whatsappLink(message)} target="_blank" rel="noreferrer" onClick={() => track('cta_whatsapp_click', { where: 'payment' })} className="btn btn-primary">{t({ en: 'Message us on WhatsApp', bn: 'হোয়াটসঅ্যাপে মেসেজ দিন' })}</a>
            <Link href="/services" className="btn btn-quiet">{t({ en: 'Back to services', bn: 'সার্ভিসে ফিরে যান' })}</Link>
          </div>
        </div>
      )}
    </section>
  );
}

export function PaymentCancel() {
  const { t } = useLang();
  useEffect(() => setPageMeta(t({ en: 'Payment cancelled', bn: 'পেমেন্ট বাতিল' }), '', '/payment/cancel'), [t]);
  return (
    <section className="wrap max-w-2xl py-16">
      <h1 className="text-4xl font-bold">{t({ en: 'Payment cancelled', bn: 'পেমেন্ট বাতিল হয়েছে' })}</h1>
      <p className="mt-3 text-lg text-muted">{t({ en: 'No money was taken. You can choose again whenever you are ready.', bn: 'কোনো টাকা কাটা হয়নি। প্রস্তুত হলে আবার বেছে নিতে পারেন।' })}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/services" className="btn btn-primary">{t({ en: 'See CV services', bn: 'সিভি সার্ভিস দেখুন' })}</Link>
        <Link href="/templates" className="btn btn-quiet">{t({ en: 'See templates', bn: 'টেমপ্লেট দেখুন' })}</Link>
      </div>
    </section>
  );
}
