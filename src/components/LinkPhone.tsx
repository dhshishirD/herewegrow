import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/lang';
import { track } from '../lib/track';

type B = { en: string; bn: string };

/** For accounts without a phone number (made with Google): connect it so every login opens the same account. */
export function LinkPhone({ gate = false }: { gate?: boolean }) {
  const { t } = useLang();
  const { refresh, logout } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<B | null>(null);
  const post = async (path: string, body: Record<string, string>) => {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string; merged?: boolean };
  };
  const ERR: Record<string, B> = {
    phone: { en: 'Please write a valid mobile number (01XXXXXXXXX).', bn: 'সঠিক মোবাইল নম্বর (01XXXXXXXXX) লিখুন।' },
    rate: { en: 'Too many tries. Please wait a while.', bn: 'অনেকবার চেষ্টা হয়েছে। একটু পরে চেষ্টা করুন।' },
    sms: { en: 'We could not send the code. Please try again in a minute.', bn: 'কোড পাঠানো যায়নি। এক মিনিট পরে আবার চেষ্টা করুন।' },
    code: { en: 'That code is not right. Please check and try again.', bn: 'কোডটি ঠিক নয়। দেখে আবার দিন।' },
    conflict: { en: 'Both accounts are CV Partner accounts, so we must join them by hand. Please message us on WhatsApp.', bn: 'দুটি অ্যাকাউন্টই সিভি পার্টনার, তাই আমাদের নিজে জোড়া দিতে হবে। হোয়াটসঅ্যাপে মেসেজ করুন।' },
  };
  const send = async () => {
    setBusy(true);
    setMsg(null);
    const r = await post('/api/auth/link/otp', { phone });
    setBusy(false);
    if (r.ok) setSent(true);
    else setMsg(ERR[r.error ?? ''] ?? ERR.sms);
  };
  const verify = async () => {
    setBusy(true);
    setMsg(null);
    const r = await post('/api/auth/link/verify', { phone, code });
    if (r.ok) {
      track('account_phone_linked', { merged: r.merged ? 1 : 0 });
      if (r.merged) {
        window.location.reload(); // the login changed to your phone account
        return;
      }
      await refresh();
    } else setMsg(ERR[r.error ?? ''] ?? ERR.code);
    setBusy(false);
  };
  return (
    <section className={gate ? 'wrap max-w-xl py-14' : 'wrap max-w-5xl pt-6'}>
      <div className="rounded-2xl border-2 border-leaf/40 bg-leaf-soft/60 p-5">
        {gate && <p className="text-sm font-semibold text-leaf">{t({ en: 'One last step', bn: 'শেষ একটি ধাপ' })}</p>}
        <p className={gate ? 'text-2xl font-bold' : 'text-lg font-bold'}>{t({ en: 'Connect your mobile number', bn: 'আপনার মোবাইল নম্বর যুক্ত করুন' })}</p>
        <p className="mt-1 text-muted">{t({ en: 'You logged in with Google. Add your mobile number so you open the same account, with the same CVs, orders and passes, however you log in. If you already have an account with this number, we join them.', bn: 'আপনি গুগল দিয়ে লগইন করেছেন। মোবাইল নম্বর যুক্ত করলে যেভাবেই লগইন করুন, একই অ্যাকাউন্ট খুলবে, একই CV, অর্ডার ও পাস থাকবে। এই নম্বরে আগে অ্যাকাউন্ট থাকলে দুটি জুড়ে দেওয়া হবে।' })}</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block"><span className="label">{t({ en: 'Mobile number', bn: 'মোবাইল নম্বর' })}</span>
            <input className="field w-56" inputMode="tel" placeholder="01XXXXXXXXX" value={phone} disabled={sent} onChange={(e) => setPhone(e.target.value)} /></label>
          {!sent && <button type="button" className="btn btn-primary" disabled={busy || !phone.trim()} onClick={() => void send()}>{busy ? '…' : t({ en: 'Send code', bn: 'কোড পাঠান' })}</button>}
          {sent && (
            <>
              <label className="block"><span className="label">{t({ en: '6-digit code from SMS', bn: 'SMS-এর ৬ সংখ্যার কোড' })}</span>
                <input className="field w-40" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} /></label>
              <button type="button" className="btn btn-primary" disabled={busy || code.length !== 6} onClick={() => void verify()}>{busy ? '…' : t({ en: 'Connect', bn: 'যুক্ত করুন' })}</button>
              <button type="button" className="btn btn-quiet" onClick={() => { setSent(false); setCode(''); setMsg(null); }}>{t({ en: 'Change number', bn: 'নম্বর বদলান' })}</button>
            </>
          )}
        </div>
        {msg && <p role="alert" className="mt-3 rounded-lg bg-white px-4 py-3 text-red-800">{t(msg)}</p>}
        {gate && <p className="mt-4"><button type="button" className="text-sm font-semibold text-muted underline" onClick={() => void logout()}>{t({ en: 'Log out', bn: 'লগআউট' })}</button></p>}
      </div>
    </section>
  );
}
