import { PRO_PUBLIC } from '../../shared/plans';
import { CartButton } from './CartDrawer';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/lang';
import { Link, usePath } from '../lib/router';

const NAV = [
  { href: '/services', en: 'Services', bn: 'সার্ভিস' },
  { href: '/templates', en: 'Templates', bn: 'টেমপ্লেট' },
  { href: '/tools', en: 'Free tools', bn: 'ফ্রি টুলস' },
  { href: '/guides', en: 'Guides', bn: 'গাইড' },
  { href: '/careers', en: 'Careers', bn: 'ক্যারিয়ার' },
  ...(PRO_PUBLIC ? [{ href: '/pro', en: 'Pro', bn: 'প্রো' }] : []),
  { href: '/about', en: 'About', bn: 'আমাদের কথা' },
];

/** The CV Builder is the main product, so it gets its own highlighted pill in both menus. */
const BUILDER = { href: '/builder', en: 'CV Builder', bn: 'সিভি বিল্ডার' };

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
          <Link
            href={BUILDER.href}
            aria-current={path.startsWith(BUILDER.href) ? 'page' : undefined}
            className="mr-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-leaf/10 px-3.5 py-1.5 font-display font-semibold text-leaf transition-colors hover:bg-leaf hover:text-white"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            {t(BUILDER)}
          </Link>
          {NAV.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap rounded-md px-2.5 py-2 font-display font-medium transition-colors lg:px-3 ${
                  active ? 'text-leaf' : 'text-ink hover:text-leaf'
                }`}
              >
                {t(item)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto md:ml-2 flex items-center gap-2">
          {!path.startsWith('/builder') && <button
            type="button"
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="whitespace-nowrap rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-leaf hover:text-leaf"
            aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          >
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>}
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
          <Link href="/builder" className="btn btn-primary hidden whitespace-nowrap xl:inline-flex !min-h-10 !px-4 text-[0.95rem]">
            {t({ en: 'Build your CV free', bn: 'ফ্রি সিভি বানান' })}
          </Link>
        </div>
      </div>

      {/* Mobile nav: always visible, no hamburger */}
      <nav className="md:hidden border-t border-line" aria-label={t({ en: 'Main', bn: 'প্রধান মেনু' })}>
        <div className="wrap flex gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={BUILDER.href}
            aria-current={path.startsWith(BUILDER.href) ? 'page' : undefined}
            className="my-1.5 shrink-0 rounded-full bg-leaf px-3.5 py-1 text-center font-display text-[0.95rem] font-semibold text-white"
          >
            {t(BUILDER)}
          </Link>
          {NAV.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 px-2.5 py-2.5 text-center font-display text-[0.95rem] font-medium border-b-2 ${
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
