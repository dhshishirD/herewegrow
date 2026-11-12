import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CartButton } from './CartDrawer';
import { BUILDER_LINK, LINK_GROUPS, PRIMARY_LINKS, RESOURCE_LINKS } from './navLinks';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/lang';
import { Link, usePath } from '../lib/router';

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf';

/** Desktop: "Resources" opens a small menu (click, hover or keyboard). */
function ResourcesMenu({ path }: { path: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const active = RESOURCE_LINKS.some((l) => path.startsWith(l.href));
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);
  return (
    <div ref={box} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 font-display font-medium transition-colors xl:px-3 ${FOCUS} ${active || open ? 'text-leaf' : 'text-ink hover:text-leaf'}`}>
        {t({ en: 'Resources', bn: 'রিসোর্স' })}
        <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4.5 6 7.5 9 4.5" /></svg>
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-40 w-64 pt-1">
          <li className="list-none rounded-xl border border-line bg-white p-1.5 shadow-lg">
            {RESOURCE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 font-display font-medium hover:bg-mist hover:text-leaf ${FOCUS} ${path.startsWith(l.href) ? 'text-leaf' : 'text-ink'}`}>
                {t(l.label)}
              </Link>
            ))}
          </li>
        </ul>
      )}
    </div>
  );
}

/** Phone: a sheet with every link, grouped like the footer. */
function PhoneMenu({ path, onClose }: { path: string; onClose: () => void }) {
  const { t, lang, setLang } = useLang();
  const { user, openLogin } = useAuth();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    box.current?.querySelector('a')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return createPortal(
    <div id="phone-menu" role="dialog" aria-modal="true" aria-label={t({ en: 'Menu', bn: 'মেনু' })}
      className="fixed inset-x-0 bottom-0 top-[var(--hdr-row)] z-40 overflow-y-auto bg-paper pb-10 lg:hidden">
      <div ref={box} className="wrap py-5">
        <Link href={BUILDER_LINK.href} className="btn btn-primary w-full">{t({ en: 'Build your CV free', bn: 'ফ্রি সিভি বানান' })}</Link>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {user ? (
            <Link href="/account" className="btn btn-quiet bg-white !min-h-11">{t({ en: 'Account', bn: 'অ্যাকাউন্ট' })}</Link>
          ) : (
            <button type="button" className="btn btn-quiet bg-white !min-h-11" onClick={() => { onClose(); openLogin(); }}>{t({ en: 'Log in', bn: 'লগইন' })}</button>
          )}
          {!path.startsWith('/builder') ? (
            <button type="button" className="btn btn-quiet bg-white !min-h-11" onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}>{lang === 'bn' ? 'English' : 'বাংলা'}</button>
          ) : <span />}
        </div>
        <div className="mt-6 grid gap-6">
          {LINK_GROUPS.map((g) => (
            <section key={g.title.en}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">{t(g.title)}</h2>
              <ul className="mt-2 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
                {g.links.map((l) => (
                  <li key={`${g.title.en}-${l.href}`}>
                    <Link href={l.href} aria-current={path === l.href ? 'page' : undefined} className={`flex min-h-12 items-center px-4 font-display font-medium ${path === l.href ? 'text-leaf' : 'text-ink'}`}>{t(l.label)}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function Header() {
  const { lang, setLang, t } = useLang();
  const path = usePath();
  const { user, openLogin } = useAuth();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  const admin = path.startsWith('/admin');
  const onBuilder = path.startsWith('/builder');

  const langBtn = !onBuilder && (
    <button type="button" onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
      className={`whitespace-nowrap rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-leaf hover:text-leaf ${FOCUS}`}
      aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}>
      {lang === 'bn' ? 'English' : 'বাংলা'}
    </button>
  );

  if (admin) {
    return (
      <header className="site-header sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="wrap flex h-14 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="HereWeGrow home">
            <img src="/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-display text-lg font-semibold tracking-[-0.02em] text-leaf-dark">HereWeGrow</span>
          </Link>
          <span className="rounded-full bg-leaf/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-leaf">Admin</span>
          <Link href="/" className="ml-auto text-sm font-semibold text-leaf hover:underline">{t({ en: 'View site', bn: 'সাইট দেখুন' })}</Link>
        </div>
      </header>
    );
  }

  return (
    <header className="site-header sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="wrap flex h-[var(--hdr-row)] items-center gap-2 sm:gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="HereWeGrow home">
          <img src="/logo-mark.svg" alt="" width={34} height={34} className="h-8 w-8 lg:h-[2.125rem] lg:w-[2.125rem]" />
          <span className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-leaf-dark lg:text-[1.35rem]">HereWeGrow</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-0.5 lg:flex" aria-label={t({ en: 'Main', bn: 'প্রধান মেনু' })}>
          {PRIMARY_LINKS.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap rounded-md px-2.5 py-2 font-display font-medium transition-colors xl:px-3 ${FOCUS} ${active ? 'text-leaf' : 'text-ink hover:text-leaf'}`}>
                {t(item.label)}
              </Link>
            );
          })}
          <ResourcesMenu path={path} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            {langBtn}
            {user ? (
              <Link href="/account" className={`rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-leaf hover:text-leaf ${FOCUS}`}>{t({ en: 'Account', bn: 'অ্যাকাউন্ট' })}</Link>
            ) : (
              <button type="button" onClick={openLogin} className={`rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold hover:border-leaf hover:text-leaf ${FOCUS}`}>{t({ en: 'Log in', bn: 'লগইন' })}</button>
            )}
          </div>
          <CartButton />
          <Link href={BUILDER_LINK.href} aria-current={onBuilder ? 'page' : undefined} className="btn btn-primary hidden whitespace-nowrap !min-h-10 !px-4 text-[0.95rem] lg:inline-flex">
            <span className="xl:hidden">{t({ en: 'Build CV', bn: 'সিভি বানান' })}</span>
            <span className="hidden xl:inline">{t({ en: 'Build your CV free', bn: 'ফ্রি সিভি বানান' })}</span>
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            {langBtn}
            <button type="button" aria-expanded={menu} aria-controls="phone-menu" onClick={() => setMenu((m) => !m)}
              className={`inline-flex h-10 items-center gap-1.5 rounded-md border border-line px-2.5 text-sm font-semibold ${FOCUS} ${menu ? 'bg-leaf text-white' : ''}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">{menu ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
              <span className="max-sm:sr-only">{t({ en: 'Menu', bn: 'মেনু' })}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phone: the four things people reach for most; everything else is behind Menu */}
      <nav className="border-t border-line lg:hidden" aria-label={t({ en: 'Main', bn: 'প্রধান মেনু' })}>
        <div className="wrap flex h-11 items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href={BUILDER_LINK.href} aria-current={onBuilder ? 'page' : undefined}
            className="shrink-0 rounded-full bg-leaf px-3.5 py-1 text-center font-display text-[0.95rem] font-semibold text-white">{t(BUILDER_LINK.label)}</Link>
          {PRIMARY_LINKS.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
                className={`shrink-0 border-b-2 px-3 py-2.5 text-center font-display text-[0.95rem] font-medium ${active ? 'border-leaf text-leaf' : 'border-transparent text-ink'}`}>
                {t(item.label)}
              </Link>
            );
          })}
        </div>
      </nav>
      {menu && <PhoneMenu path={path} onClose={() => setMenu(false)} />}
    </header>
  );
}
