import { PRO_PUBLIC } from '../../shared/plans';
import { CartButton } from './CartDrawer';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/lang';
import { Link, usePath } from '../lib/router';

const NAV = [
  { href: '/services', en: 'CV services', bn: 'সিভি সার্ভিস' },
  { href: '/templates', en: 'Templates', bn: 'টেমপ্লেট' },
  { href: '/tools', en: 'Free tools', bn: 'ফ্রি টুলস' },
  { href: '/guides', en: 'Guides', bn: 'গাইড' },
  ...(PRO_PUBLIC ? [{ href: '/pro', en: 'Pro', bn: 'প্রো' }] : []),
  { href: '/about', en: 'About', bn: 'আমাদের কথা' },
];

export function Header() {
  const { lang, setLang, t } = useLang();
  const path = usePath();
  const { user, openLogin } = useAuth();

  return (
    <header className="site-header sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="wrap flex h-[4.25rem] items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="HereWeGrow home">
          <img src="/logo-mark.svg" alt="" width={34} height={34} className="h-[2.125rem] w-[2.125rem]" />
          <span className="font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-leaf-dark">HereWeGrow</span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1" aria-label={t({ en: 'Main', bn: 'প্রধান মেনু' })}>
          {NAV.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-3 py-2 font-display font-medium transition-colors ${
                  active ? 'text-leaf' : 'text-ink hover:text-leaf'
                }`}
              >
                {t(item)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto md:ml-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-leaf hover:text-leaf"
            aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
          {user ? (
            <Link href="/account" className="rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-leaf hover:text-leaf">
              {t({ en: 'Account', bn: 'অ্যাকাউন্ট' })}
            </Link>
          ) : (
            <button type="button" onClick={openLogin} className="rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-leaf hover:text-leaf">
              {t({ en: 'Log in', bn: 'লগইন' })}
            </button>
          )}
          <CartButton />
          <Link href="/services" className="btn btn-primary hidden sm:inline-flex !min-h-10 !px-4 text-[0.95rem]">
            {t({ en: 'Order a CV', bn: 'সিভি অর্ডার করুন' })}
          </Link>
        </div>
      </div>

      {/* Mobile nav: always visible, no hamburger */}
      <nav className="md:hidden border-t border-line" aria-label={t({ en: 'Main', bn: 'প্রধান মেনু' })}>
        <div className="wrap flex justify-between">
          {NAV.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex-1 py-2.5 text-center font-display text-[0.95rem] font-medium border-b-2 ${
                  active ? 'border-leaf text-leaf' : 'border-transparent text-ink'
                }`}
              >
                {t(item)}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
