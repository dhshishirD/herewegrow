// Shared frame for the admin pages: dark header band, section menu, and cards that overlap the band.
// Purely presentational. Every admin API call is still checked for is_admin on the server.

import type { ReactNode } from 'react';
import { Link } from '../lib/router';

const SECTIONS = [
  { href: '/admin', label: 'Analytics' },
  { href: '/admin/manual', label: 'Manual access' },
  { href: '/admin/careers', label: 'Career Hub' },
  { href: '/admin/promos', label: 'Promo codes' },
];

export function AdminShell({ active, title, subtitle, actions, children }: { active: string; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-[70vh] bg-mist/70 pb-16">
      <div className="bg-gradient-to-br from-leaf-dark via-[#12356b] to-leaf text-white">
        <div className="wrap max-w-6xl pb-28 pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">HereWeGrow admin</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-1.5 max-w-xl text-sm text-white/70 sm:text-base">{subtitle}</p>}
            </div>
            {actions}
          </div>
          <nav aria-label="Admin sections" className="mt-7 flex w-fit max-w-full flex-wrap gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur">
            {SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                aria-current={s.href === active ? 'page' : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${s.href === active ? 'bg-white text-leaf-dark shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="wrap -mt-20 max-w-6xl">{children}</div>
    </div>
  );
}

/** A white panel with a soft shadow. `title` adds a heading row, `aside` puts something at its right. */
export function Card({ title, aside, note, children, className = '' }: { title?: string; aside?: ReactNode; note?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(11_26_51/0.05),0_8px_24px_-12px_rgb(11_26_51/0.18)] ring-1 ring-line/80 ${className}`}>
      {(title || aside) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>}
          {aside}
        </div>
      )}
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      <div className={title || aside || note ? 'mt-3' : ''}>{children}</div>
    </section>
  );
}

const TONES = {
  blue: 'bg-leaf-soft text-leaf',
  green: 'bg-gold-soft text-gold',
  amber: 'bg-amber-100 text-amber-800',
  slate: 'bg-mist text-muted',
  red: 'bg-red-100 text-red-800',
} as const;

export function Badge({ tone = 'slate', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}
