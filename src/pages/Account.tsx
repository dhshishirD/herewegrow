import { useAuth } from '../lib/auth';
import { useLang } from '../lib/lang';

export function AccountPage() {
  const { user, ready, openLogin, logout } = useAuth();
  const { lang, t } = useLang();
  const failed = new URLSearchParams(window.location.search).get('login') === 'failed';

  if (!ready) return <div className="wrap py-24 text-muted">…</div>;

  if (!user) {
    return (
      <div className="wrap max-w-lg py-16">
        <h1 className="text-3xl font-bold">{t({ en: 'Your account', bn: 'আপনার অ্যাকাউন্ট' })}</h1>
        {failed && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {t({ en: 'Google login did not work. Please try again.', bn: 'গুগল লগইন কাজ করেনি। আবার চেষ্টা করুন।' })}
          </p>
        )}
        <p className="mt-3 text-muted">{t({ en: 'Log in with your mobile number to save CVs and use Pro.', bn: 'সিভি সেভ করতে ও প্রো ব্যবহার করতে মোবাইল নম্বর দিয়ে লগইন করুন।' })}</p>
        <button type="button" className="btn btn-primary mt-6" onClick={openLogin}>{t({ en: 'Log in', bn: 'লগইন করুন' })}</button>
      </div>
    );
  }

  const until = user.proUntil ? new Date(user.proUntil).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  return (
    <div className="wrap max-w-lg py-16">
      <h1 className="text-3xl font-bold">{t({ en: 'Your account', bn: 'আপনার অ্যাকাউন্ট' })}</h1>
      <dl className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-6">
        {user.name && <div><dt className="label">{t({ en: 'Name', bn: 'নাম' })}</dt><dd>{user.name}</dd></div>}
        {user.phone && <div><dt className="label">{t({ en: 'Mobile', bn: 'মোবাইল' })}</dt><dd>{user.phone}</dd></div>}
        {user.email && <div><dt className="label">{t({ en: 'Email', bn: 'ইমেইল' })}</dt><dd>{user.email}</dd></div>}
        <div>
          <dt className="label">Pro</dt>
          <dd>
            {user.pro && until
              ? t({ en: `Active until ${until}`, bn: `${until} পর্যন্ত চালু` })
              : t({ en: 'Not active', bn: 'চালু নেই' })}
          </dd>
        </div>
      </dl>
      <button type="button" className="btn btn-quiet mt-6" onClick={() => void logout()}>{t({ en: 'Log out', bn: 'লগআউট' })}</button>
    </div>
  );
}
