import { SUPPORT_WHATSAPP_DISPLAY } from '../../shared/catalog';
import { LINK_GROUPS } from './navLinks';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { whatsappLink } from '../lib/whatsapp';
import { track } from '../lib/track';

const LINK = 'hover:text-white hover:underline underline-offset-4';

export function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer bg-leaf-dark text-white/90">
      <div className="wrap grid gap-x-8 gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="flex items-center gap-2.5">
            <img src="/logo-mark.svg" alt="" width={36} height={36} className="h-9 w-9 rounded-lg ring-1 ring-white/20" />
            <span className="font-display text-2xl font-semibold text-white">HereWeGrow</span>
          </p>
          <p className="mt-4 font-display text-xl text-saffron">{t({ en: 'A CV that gets you called', bn: 'যে সিভি দেখে ডাক আসে' })}</p>
          <p className="mt-3 max-w-sm text-white/75">
            {t({
              en: 'CV writing, CV templates and free job tools for Bangladeshi job seekers. Expert work by Career Solutions.',
              bn: 'বাংলাদেশের চাকরিপ্রার্থীদের জন্য সিভি রাইটিং, সিভি টেমপ্লেট ও ফ্রি জব টুলস। বিশেষজ্ঞ সেবা দিচ্ছে Career Solutions।',
            })}
          </p>
          <a className="btn mt-5 !min-h-10 bg-white text-ink hover:bg-white/90" href={whatsappLink('Hello HereWeGrow')} target="_blank" rel="noreferrer"
            onClick={() => track('cta_whatsapp_click', { where: 'footer' })}>
            WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
          </a>
          <p className="mt-3 text-sm text-white/70">{t({ en: 'Every day, 9am to 11pm', bn: 'প্রতিদিন সকাল ৯টা থেকে রাত ১১টা' })}</p>
        </div>

        {LINK_GROUPS.map((g) => (
          <nav key={g.title.en} aria-label={t(g.title)}>
            <p className="font-display font-semibold text-white">{t(g.title)}</p>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={`${g.title.en}-${l.href}`}><Link className={LINK} href={l.href}>{t(l.label)}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/15">
        {/* Extra bottom space on phones keeps the floating "Message us" button off the links */}
        <div className="wrap flex flex-col gap-3 py-5 pb-20 text-sm text-white/65 md:flex-row md:items-center md:justify-between md:pb-5">
          <p>© {year} HereWeGrow</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link className={LINK} href="/privacy">{t({ en: 'Privacy', bn: 'গোপনীয়তা' })}</Link></li>
            <li><Link className={LINK} href="/terms">{t({ en: 'Terms and refunds', bn: 'শর্তাবলি ও রিফান্ড' })}</Link></li>
            <li><Link className={LINK} href="/order">{t({ en: 'Download your files again', bn: 'আবার ফাইল ডাউনলোড' })}</Link></li>
          </ul>
          <p>{t({ en: 'Pay with bKash, Nagad or Rocket', bn: 'বিকাশ, নগদ বা রকেটে পেমেন্ট' })}</p>
        </div>
      </div>
    </footer>
  );
}
