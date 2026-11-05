// "Message us": a floating button with a small form, and the same form inline on /contact.
// Visitor text goes to /api/contact only; nothing here can affect the rest of the site.

import { useEffect, useState, type FormEvent } from 'react';
import { useLang } from '../lib/lang';
import { usePath } from '../lib/router';
import { track, tracker } from '../lib/track';
import { whatsappLink } from '../lib/whatsapp';

const FIELD_ERRORS: Record<string, { en: string; bn: string }> = {
  name: { en: 'Enter your name.', bn: 'আপনার নাম লিখুন।' },
  phone: { en: 'Enter a valid mobile number like 01XXXXXXXXX.', bn: 'সঠিক মোবাইল নম্বর দিন, যেমন 01XXXXXXXXX।' },
  email: { en: 'That email does not look right.', bn: 'ইমেইলটি সঠিক মনে হচ্ছে না।' },
  message: { en: 'Write a short message.', bn: 'একটি ছোট বার্তা লিখুন।' },
};

type Result = { kind: 'idle' } | { kind: 'sent' } | { kind: 'failed'; fields: string[] };

export function ContactForm() {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>({ kind: 'idle' });

  const wa = (
    <a className="btn btn-quiet" href={whatsappLink('Hello HereWeGrow')} target="_blank" rel="noreferrer">
      {t({ en: 'Message us on WhatsApp', bn: 'হোয়াটসঅ্যাপে মেসেজ করুন' })}
    </a>
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message, website, page: window.location.pathname, vid: tracker.vid(), utmSource: tracker.source() }),
      });
      if (res.ok) {
        track('contact_submit');
        setResult({ kind: 'sent' });
      } else {
        const b = (await res.json().catch(() => ({}))) as { errors?: unknown };
        const fields = res.status === 400 && Array.isArray(b.errors) ? b.errors.filter((x): x is string => typeof x === 'string' && x in FIELD_ERRORS) : [];
        setResult({ kind: 'failed', fields });
      }
    } catch {
      setResult({ kind: 'failed', fields: [] });
    }
    setBusy(false);
  };

  if (result.kind === 'sent') {
    return (
      <div role="status" className="space-y-4">
        <p className="font-semibold">{t({ en: 'Thank you! We will call or message you soon.', bn: 'ধন্যবাদ! আমরা শীঘ্রই আপনাকে কল বা মেসেজ করব।' })}</p>
        {wa}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="contact-name">{t({ en: 'Your name', bn: 'আপনার নাম' })}</label>
        <input id="contact-name" className="field" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="contact-phone">{t({ en: 'Mobile number', bn: 'মোবাইল নম্বর' })}</label>
        <input id="contact-phone" className="field" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" maxLength={16} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="contact-message">{t({ en: 'Message', bn: 'বার্তা' })}</label>
        <textarea id="contact-message" className="field" rows={4} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={busy || !name.trim() || !phone.trim() || !message.trim()}>
        {t({ en: 'Send message', bn: 'বার্তা পাঠান' })}
      </button>
      {result.kind === 'failed' && (
        <div role="alert" className="space-y-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {result.fields.length > 0 ? (
            <ul>{result.fields.map((f) => <li key={f}>{t(FIELD_ERRORS[f])}</li>)}</ul>
          ) : (
            <p>{t({ en: 'We could not send your message. Please message us on WhatsApp instead.', bn: 'বার্তা পাঠানো যায়নি। অনুগ্রহ করে হোয়াটসঅ্যাপে মেসেজ করুন।' })}</p>
          )}
          {result.fields.length === 0 && wa}
        </div>
      )}
    </form>
  );
}

export function ContactWidget() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const path = usePath();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (path === '/contact' || path.startsWith('/admin')) return null;

  return (
    <>
      <button type="button" className="no-print btn btn-primary fixed bottom-4 left-4 z-30 shadow-lg" onClick={() => setOpen(true)}>
        {t({ en: 'Message us', bn: 'মেসেজ করুন' })}
      </button>
      {open && (
        <div className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-6" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="contact-title" className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 sm:p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h2 id="contact-title" className="text-2xl font-bold">{t({ en: 'Message us', bn: 'আমাদের মেসেজ করুন' })}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={t({ en: 'Close', bn: 'বন্ধ করুন' })} className="-mr-2 -mt-1 rounded-full p-2 text-muted hover:bg-mist hover:text-ink">
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="mt-5"><ContactForm /></div>
          </div>
        </div>
      )}
    </>
  );
}

export function ContactPage() {
  const { t } = useLang();
  return (
    <div className="wrap max-w-lg py-14">
      <h1 className="text-4xl font-bold">{t({ en: 'Contact us', bn: 'যোগাযোগ' })}</h1>
      <p className="mt-3 text-muted">{t({ en: 'Leave your number and a short message. We will get back to you.', bn: 'আপনার নম্বর ও একটি ছোট বার্তা দিন। আমরা যোগাযোগ করব।' })}</p>
      <div className="relative mt-6"><ContactForm /></div>
    </div>
  );
}
