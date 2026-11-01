import { SUPPORT_WHATSAPP_DISPLAY } from '../../shared/catalog';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { whatsappLink } from '../lib/whatsapp';

export function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-leaf-dark text-white/90">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
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
          <p className="mt-5 text-sm text-white/70">
            {t({ en: 'Pay with bKash, Nagad or Rocket', bn: 'বিকাশ, নগদ বা রকেটে পেমেন্ট' })}
          </p>
        </div>

        <div>
          <p className="font-display font-semibold text-white">{t({ en: 'Get help', bn: 'সাহায্য' })}</p>
          <ul className="mt-3 space-y-2">
            <li>
              <a className="hover:text-white underline-offset-4 hover:underline" href={whatsappLink('Hello HereWeGrow')} target="_blank" rel="noreferrer">
                WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
              </a>
            </li>
            <li><Link className="hover:text-white hover:underline underline-offset-4" href="/order">{t({ en: 'Download your files again', bn: 'আবার ফাইল ডাউনলোড' })}</Link></li>
            <li className="text-white/70">{t({ en: 'Every day, 9am to 11pm', bn: 'প্রতিদিন সকাল ৯টা থেকে রাত ১১টা' })}</li>
          </ul>
        </div>

        <div>
          <p className="font-display font-semibold text-white">{t({ en: 'More', bn: 'আরও' })}</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-white hover:underline underline-offset-4" href="/guides">{t({ en: 'Career guides', bn: 'ক্যারিয়ার গাইড' })}</Link></li>
            <li><Link className="hover:text-white hover:underline underline-offset-4" href="/about">{t({ en: 'About us', bn: 'আমাদের কথা' })}</Link></li>
            <li><Link className="hover:text-white hover:underline underline-offset-4" href="/privacy">{t({ en: 'Privacy', bn: 'গোপনীয়তা' })}</Link></li>
            <li><Link className="hover:text-white hover:underline underline-offset-4" href="/terms">{t({ en: 'Terms and refunds', bn: 'শর্তাবলি ও রিফান্ড' })}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="wrap py-5 text-sm text-white/60">© {year} HereWeGrow</p>
      </div>
    </footer>
  );
}
