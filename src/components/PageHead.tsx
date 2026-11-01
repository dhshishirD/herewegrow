import type { ReactNode } from 'react';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';

interface Crumb {
  href: string;
  label: { en: string; bn: string };
}

/** Top of every inner page: where you are, the page title, one line of intro, and an optional side panel. */
export function PageHead({ title, intro, crumbs = [], aside }: { title: string; intro: ReactNode; crumbs?: Crumb[]; aside?: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="relative overflow-hidden border-b border-line bg-mist">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
      <div className={`wrap relative py-10 md:py-14 ${aside ? 'grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end' : ''}`}>
        <div>
          <nav aria-label={t({ en: 'Breadcrumb', bn: 'অবস্থান' })} className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-leaf hover:underline">{t({ en: 'Home', bn: 'হোম' })}</Link></li>
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  <span aria-hidden="true">/</span>
                  <Link href={c.href} className="hover:text-leaf hover:underline">{t(c.label)}</Link>
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-4 text-4xl sm:text-5xl">{title}</h1>
          <div className="mt-4 max-w-2xl text-lg text-muted">{intro}</div>
        </div>
        {aside}
      </div>
    </div>
  );
}

export const TOOLS_CRUMB: Crumb = { href: '/tools', label: { en: 'Free tools', bn: 'ফ্রি টুলস' } };
