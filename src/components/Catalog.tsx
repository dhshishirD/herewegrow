import { PRODUCTS, type Product } from '../../shared/catalog';
import { num, taka, useLang } from '../lib/lang';
import { useCheckout } from './Checkout';

const services = PRODUCTS.filter((p) => p.kind === 'service');
const packs = PRODUCTS.filter((p) => p.kind === 'pack');

/** Expert services as a rate card: one row per service, price at the right edge. */
export function ServiceRateCard({ group = 'cv' }: { group?: 'cv' | 'profile' | 'study' }) {
  const { t, lang } = useLang();
  const order = useCheckout();
  const list = services.filter((s) => (s.group ?? 'cv') === group);

  return (
    <ul className="divide-y divide-line border-y border-line">
      {list.map((s) => (
        <li key={s.id} className={`grid gap-4 py-6 md:grid-cols-[1.1fr_1.4fr_auto] md:items-start md:gap-8 ${s.featured ? 'relative' : ''}`}>
          <div>
            <h3 className="text-xl font-bold">{t(s.name)}</h3>
            {s.featured && (
              <p className="mt-1 inline-block rounded bg-gold-soft px-2 py-0.5 text-sm font-semibold text-gold">
                {t(s.badge ?? { en: 'Most chosen', bn: 'সবচেয়ে বেশি নেওয়া হয়' })}
              </p>
            )}
            <p className="mt-2 text-muted">{t(s.summary)}</p>
          </div>
          <div>
            <ul className="space-y-1.5">
              {s.includes.map((line) => (
                <li key={line.en} className="flex gap-2.5">
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-leaf"><path d="M2 8.5l3.5 3.5L14 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>{t(line)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">{t(s.delivery)}</p>
          </div>
          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
            <p className="font-display text-3xl font-bold text-ink">{taka(s.price, lang)}</p>
            <button type="button" className={`btn ${s.featured ? 'btn-primary' : 'btn-quiet'}`} onClick={() => order(s.id)}>
              {t({ en: 'Order', bn: 'অর্ডার করুন' })}
            </button>
          </div>
        </li>
      ))}
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

export function PackGrid({ limit }: { limit?: number }) {
  const { t, lang } = useLang();
  const order = useCheckout();
  const list: Product[] = limit ? packs.slice(0, limit) : packs;

  return (
    <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
      {list.map((p) => (
        <article key={p.id} className="flex gap-6 border-t border-line py-7">
          <PackCover product={p} label={p.id === 'pack-biodata' ? t({ en: 'Bio', bn: 'বায়ো' }) : p.id === 'pack-library' ? num('300+', lang) : num(p.id === 'pack-best-40' ? '40' : String(p.templates?.length ?? ''), lang)} />
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold">{t(p.name)}</h3>
              <p className="font-display text-xl font-bold text-leaf whitespace-nowrap">{taka(p.price, lang)}</p>
            </div>
            <p className="mt-1 text-muted">{t(p.summary)}</p>
            <p className="mt-1 text-sm">{t(p.includes[0])}{lang === 'bn' ? '। ' : '. '}{t(p.delivery)}{lang === 'bn' ? '।' : '.'}</p>
            <button type="button" className="mt-3 font-display font-semibold text-leaf underline underline-offset-4 decoration-2 hover:text-leaf-dark" onClick={() => order(p.id)}>
              {t({ en: 'Buy and get files', bn: 'কিনুন ও ফাইল নিন' })}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
