import { useState } from 'react';
import { PRODUCTS, type Product } from '../../shared/catalog';
import { findTemplate } from '../../shared/templates';
import { isRetired } from '../../shared/templateTiers';
import { num, taka, useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { track } from '../lib/track';
import { useCheckout } from './Checkout';
import { ArrowRight, ChevronDown, Clock, Star } from 'lucide-react';
import { FeatureList } from './FeatureList';

const services = PRODUCTS.filter((p) => p.kind === 'service');
const packs = PRODUCTS.filter((p) => p.kind === 'pack');

/** Expert services as premium cards: what it is, what you get, when, and the price. */
export function ServiceRateCard({ group = 'cv' }: { group?: 'cv' | 'profile' | 'study' }) {
  const { t, lang } = useLang();
  const order = useCheckout();
  const list = services.filter((s) => (s.group ?? 'cv') === group);

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s) => {
        const dark = !!s.featured;
        return (
          <li key={s.id} className={`svc-card group relative flex flex-col rounded-3xl p-6 sm:p-7 ${dark ? 'svc-card-featured text-white' : 'bg-white ring-1 ring-line'}`}>
            {s.featured && (
              <p className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-saffron px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-md">
                <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                {t(s.badge ?? { en: 'Most chosen', bn: 'সবচেয়ে বেশি নেওয়া হয়' })}
              </p>
            )}
            <h3 className={`text-2xl ${dark ? 'text-white' : ''}`}>{t(s.name)}</h3>
            <p className={`mt-2 ${dark ? 'text-white/75' : 'text-muted'}`}>{t(s.summary)}</p>

            <div className={`my-5 h-px ${dark ? 'bg-white/15' : 'bg-line'}`} />
            <p className={`mb-3 text-xs font-bold uppercase tracking-[0.12em] ${dark ? 'text-saffron' : 'text-gold'}`}>{t({ en: 'What you get', bn: 'যা পাবেন' })}</p>
            <FeatureList items={s.includes} tone={dark ? 'dark' : 'light'} className="flex-1 content-start" />

            <p className={`mt-5 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${dark ? 'bg-white/10 text-white/85' : 'bg-mist text-muted'}`}>
              <Clock size={14} aria-hidden="true" /> {t(s.delivery)}
            </p>

            <div className="mt-6 flex items-end justify-between gap-4">
              <p className="leading-none">
                <span className={`block text-xs font-semibold uppercase tracking-wide ${dark ? 'text-white/60' : 'text-muted'}`}>{t({ en: 'Fixed price', bn: 'নির্দিষ্ট দাম' })}</span>
                <span className={`mt-1.5 block font-display text-4xl font-bold ${dark ? 'text-white' : 'text-ink'}`}>{taka(s.price, lang)}</span>
              </p>
              <button type="button" className={`btn ${dark ? 'bg-saffron text-ink hover:bg-white' : 'btn-primary'}`} onClick={() => order(s.id)}>
                {t({ en: 'Order now', bn: 'অর্ডার করুন' })}
                <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Three real template previews fanned out, or a drawn stack for packs without previews. */
function PackCover({ product, label }: { product: Product; label: string }) {
  const picks = product.templates?.slice(0, 3) ?? [];
  if (picks.length === 0) {
    return (
      <div aria-hidden="true" className="relative h-28 w-24 shrink-0">
        <div className="absolute inset-0 translate-x-3 -translate-y-1 rotate-6 rounded-sm border border-line bg-mist" />
        <div className="absolute inset-0 translate-x-1.5 rotate-3 rounded-sm border border-line bg-white" />
        <div className="absolute inset-0 rounded-sm border border-line bg-white p-2">
          <div className="h-1.5 w-8 rounded bg-leaf/70" />
          <div className="mt-1.5 h-1 w-12 rounded bg-line" />
          <div className="mt-1 h-1 w-10 rounded bg-line" />
          <p className="absolute bottom-1.5 right-2 font-display text-lg font-bold text-leaf">{label}</p>
        </div>
      </div>
    );
  }
  const turn = ['-rotate-6 -translate-x-3', 'rotate-0', 'rotate-6 translate-x-3'];
  return (
    <div aria-hidden="true" className="relative h-28 w-24 shrink-0">
      {picks.map((id, i) => (
        <img key={id} src={`/templates/${id}/thumb.webp`} alt="" loading="lazy" decoding="async" width={84} height={119}
          className={`absolute left-1.5 top-0 h-[7.4rem] w-21 rounded-sm bg-white object-cover object-top shadow ring-1 ring-line ${turn[i]}`} style={{ zIndex: i === 1 ? 3 : i }} />
      ))}
      <p className="absolute -bottom-2 -right-2 z-10 rounded-full bg-ink px-2 py-0.5 font-display text-sm font-bold text-white">{label}</p>
    </div>
  );
}

/** What is inside a pack: every template with its preview, each one opening its own page (a template that is no longer sold on its own stays in the pack but has no page to open). */
function PackContents({ pack }: { pack: Product }) {
  const { t } = useLang();
  const items = (pack.templates ?? []).map((id) => findTemplate(id)).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <ul id={`pack-contents-${pack.id}`} className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((tpl) => {
        const img = (
          <img
            src={`/templates/${tpl.id}/thumb.webp`}
            alt={t(tpl.title)}
            width={420}
            height={594}
            loading="lazy"
            decoding="async"
            className="aspect-[210/297] w-full bg-white object-cover object-top shadow-sm"
          />
        );
        return (
          <li key={tpl.id} className="min-w-0">
            {isRetired(tpl.id) ? (
              <div className="rounded-lg bg-mist p-2 ring-1 ring-line">{img}</div>
            ) : (
              <Link href={`/templates/${tpl.id}`} className="block rounded-lg bg-mist p-2 ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-2 hover:ring-leaf">
                {img}
              </Link>
            )}
            <p className="mt-1 line-clamp-2 text-xs text-muted">{t(tpl.title)}</p>
          </li>
        );
      })}
    </ul>
  );
}

function PackItem({ p }: { p: Product }) {
  const { t, lang } = useLang();
  const order = useCheckout();
  const [open, setOpen] = useState(false);
  const count = p.templates?.length ?? 0;
  return (
    <article className="border-t border-line py-7">
      <div className="flex gap-6">
        <PackCover product={p} label={p.id === 'pack-biodata' ? t({ en: 'Bio', bn: 'বায়ো' }) : p.id === 'pack-library' ? num('300+', lang) : num(p.id === 'pack-best-40' ? '40' : String(count || ''), lang)} />
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-bold">{t(p.name)}</h3>
            <p className="font-display text-xl font-bold text-leaf whitespace-nowrap">{taka(p.price, lang)}</p>
          </div>
          <p className="mt-1 text-muted">{t(p.summary)}</p>
          <p className="mt-1 text-sm">{t(p.includes[0])}{lang === 'bn' ? '। ' : '. '}{t(p.delivery)}{lang === 'bn' ? '।' : '.'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" className="font-display font-semibold text-leaf underline underline-offset-4 decoration-2 hover:text-leaf-dark" onClick={() => order(p.id)}>
              {t({ en: 'Buy and get files', bn: 'কিনুন ও ফাইল নিন' })}
            </button>
            {count > 0 && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`pack-contents-${p.id}`}
                className="inline-flex items-center gap-1 font-display font-semibold text-ink underline underline-offset-4 decoration-2 hover:text-leaf"
                onClick={() => {
                  if (!open) track('view_pack_contents', { id: p.id });
                  setOpen(!open);
                }}
              >
                {open ? t({ en: 'Hide templates', bn: 'টেমপ্লেট লুকান' }) : t({ en: `See the ${count} templates inside`, bn: `ভেতরের ${num(String(count), lang)}টি টেমপ্লেট দেখুন` })}
                <ChevronDown size={16} aria-hidden="true" className={open ? 'rotate-180' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>
      {open && <PackContents pack={p} />}
    </article>
  );
}

export function PackGrid({ limit }: { limit?: number }) {
  const list: Product[] = limit ? packs.slice(0, limit) : packs;
  return (
    <div className="grid items-start gap-x-8 gap-y-0 md:grid-cols-2">
      {list.map((p) => (
        <PackItem key={p.id} p={p} />
      ))}
    </div>
  );
}
