import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth, type AccountUser } from '../lib/auth';
import { useLang } from '../lib/lang';

const ERRORS: Record<string, { en: string; bn: string }> = {
  phone: { en: 'Enter a valid mobile number like 01XXXXXXXXX.', bn: 'সঠিক মোবাইল নম্বর দিন, যেমন 01XXXXXXXXX।' },
  rate: { en: 'Too many tries. Please wait a few minutes.', bn: 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।' },
  sms: { en: 'We could not send the SMS. Try again shortly.', bn: 'এসএমএস পাঠানো যায়নি। একটু পরে আবার চেষ্টা করুন।' },
  code: { en: 'That code is wrong or expired.', bn: 'কোডটি ভুল বা মেয়াদ শেষ।' },
  config: { en: 'Login is not available right now.', bn: 'এই মুহূর্তে লগইন চালু নেই।' },
  generic: { en: 'Something went wrong. Please try again.', bn: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।' },
};

async function post(path: string, body: unknown) {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return (await res.json().catch(() => ({ ok: false, error: 'generic' }))) as { ok: boolean; error?: string; user?: AccountUser };
}

export function LoginModal() {
  const { loginOpen, closeLogin, setUser, googleEnabled } = useAuth();
  const { lang, t } = useLang();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loginOpen) return;
    setStep('phone');
    setCode('');
    setError('');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLogin();
    window.addEventListener('keydown', onKey);
    setTimeout(() => first.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [loginOpen, closeLogin]);

  if (!loginOpen) return null;
  const fail = (key?: string) => setError(t(ERRORS[key && ERRORS[key] ? key : 'generic']));

  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await post('/api/auth/otp', { phone });
    setBusy(false);
    if (r.ok) setStep('code');
    else fail(r.error);
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await post('/api/auth/verify', { phone, code, lang });
    setBusy(false);
    if (r.ok && r.user) {
      setUser(r.user);
      closeLogin();
    } else fail(r.error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-6" onClick={() => !busy && closeLogin()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="login-title" className="text-2xl font-bold">{t({ en: 'Log in', bn: 'লগইন করুন' })}</h2>
          <button type="button" onClick={closeLogin} disabled={busy} aria-label={t({ en: 'Close', bn: 'বন্ধ করুন' })}
            className="-mr-2 -mt-1 rounded-full p-2 text-muted hover:bg-mist hover:text-ink">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={sendCode} className="mt-5 space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="login-phone">{t({ en: 'Mobile number', bn: 'মোবাইল নম্বর' })}</label>
              <input ref={first} id="login-phone" className="field" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" maxLength={16}
                value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={busy || !phone.trim()}>
              {t({ en: 'Send code by SMS', bn: 'এসএমএসে কোড পাঠান' })}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-5 space-y-4" noValidate>
            <p className="text-sm text-muted">{t({ en: `We sent a 6-digit code to ${phone}.`, bn: `${phone} নম্বরে ৬ সংখ্যার কোড পাঠানো হয়েছে।` })}</p>
            <div>
              <label className="label" htmlFor="login-code">{t({ en: 'Code', bn: 'কোড' })}</label>
              <input ref={first} id="login-code" className="field tracking-[0.4em] text-center text-xl" inputMode="numeric" autoComplete="one-time-code"
                maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={busy || code.length !== 6}>
              {t({ en: 'Log in', bn: 'লগইন' })}
            </button>
            <button type="button" className="btn btn-quiet w-full" onClick={() => { setStep('phone'); setError(''); }}>
              {t({ en: 'Change number', bn: 'নম্বর বদলান' })}
            </button>
          </form>
        )}

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

        {googleEnabled && (
          <>
            <div className="my-5 text-center text-sm text-muted">{t({ en: 'or', bn: 'অথবা' })}</div>
            <a className="btn btn-quiet w-full" href={`/api/auth/google/start?next=${encodeURIComponent(window.location.pathname)}`}>
              {t({ en: 'Continue with Google', bn: 'গুগল দিয়ে চালিয়ে যান' })}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
