import { useEffect } from 'react';
import { SUPPORT_WHATSAPP_DISPLAY } from '../../shared/catalog';
import { useLang } from '../lib/lang';
import { Link } from '../lib/router';
import { setPageMeta } from '../lib/seo';

type Para = { en: string; bn: string };

function Policy({ title, path, sections }: { title: Para; path: string; sections: { h: Para; p: Para[] }[] }) {
  const { t } = useLang();
  useEffect(() => setPageMeta(t(title), t(sections[0].p[0]), path), [t, title, sections, path]);
  return (
    <article className="wrap max-w-3xl py-14">
      <h1 className="text-4xl font-bold">{t(title)}</h1>
      <p className="mt-2 text-sm text-muted">{t({ en: 'Last updated: 1 November 2026', bn: 'সর্বশেষ হালনাগাদ: ১ নভেম্বর ২০২৬' })}</p>
      {sections.map((s) => (
        <section key={s.h.en} className="mt-8">
          <h2 className="text-2xl font-bold">{t(s.h)}</h2>
          {s.p.map((p) => <p key={p.en} className="mt-3">{t(p)}</p>)}
        </section>
      ))}
    </article>
  );
}

export function PrivacyPage() {
  return (
    <Policy
      path="/privacy"
      title={{ en: 'Privacy', bn: 'গোপনীয়তা নীতি' }}
      sections={[
        {
          h: { en: 'What we collect', bn: 'আমরা কী সংগ্রহ করি' },
          p: [
            { en: 'When you order, we collect your name, WhatsApp number, optional email and any note you add. Our payment partner processes your payment; we do not see your bKash, Nagad or Rocket PIN.', bn: 'অর্ডারের সময় আমরা আপনার নাম, হোয়াটসঅ্যাপ নম্বর, ঐচ্ছিক ইমেইল ও আপনার দেওয়া নোট সংগ্রহ করি। পেমেন্ট প্রক্রিয়া করে আমাদের পেমেন্ট পার্টনার; আমরা আপনার বিকাশ, নগদ বা রকেটের পিন দেখি না।' },
            { en: 'The CV you send us is used only to do the work you ordered.', bn: 'আপনার পাঠানো সিভি শুধু আপনার অর্ডার করা কাজের জন্যই ব্যবহার হয়।' },
          ],
        },
        {
          h: { en: 'Free tools', bn: 'ফ্রি টুলস' },
          p: [
            { en: 'The CV checker and the photo resizer work inside your browser. Your files are not uploaded to our servers.', bn: 'সিভি চেকার ও ছবি রিসাইজার আপনার ব্রাউজারের ভেতরেই কাজ করে। আপনার ফাইল আমাদের সার্ভারে আপলোড হয় না।' },
          ],
        },
        {
          h: { en: 'What we never do', bn: 'আমরা যা কখনো করি না' },
          p: [
            { en: 'We never sell or share your CV or contact details. We do not show your CV as a sample without your written permission.', bn: 'আমরা কখনো আপনার সিভি বা যোগাযোগের তথ্য বিক্রি বা শেয়ার করি না। আপনার লিখিত অনুমতি ছাড়া আপনার সিভি নমুনা হিসেবে দেখাই না।' },
          ],
        },
        {
          h: { en: 'Deleting your data', bn: 'তথ্য মুছে ফেলা' },
          p: [
            { en: `Message ${SUPPORT_WHATSAPP_DISPLAY} on WhatsApp to ask us to delete your files and messages. We delete them within 7 days.`, bn: `আপনার ফাইল ও মেসেজ মুছতে হোয়াটসঅ্যাপে ${SUPPORT_WHATSAPP_DISPLAY} নম্বরে জানান। ৭ দিনের মধ্যে মুছে ফেলা হবে।` },
            { en: 'We use Google Analytics to count visits to this site.', bn: 'সাইটের ভিজিট গণনার জন্য আমরা Google Analytics ব্যবহার করি।' },
          ],
        },
        {
          h: { en: 'Analytics and contact form', bn: 'অ্যানালিটিক্স ও যোগাযোগ ফর্ম' },
          p: [
            { en: 'We run our own simple analytics: which pages are viewed and which buttons are used. It uses a random ID kept in your browser; our own analytics sets no cookies (Google Analytics, described above, may). If you are signed in, your visits are linked to your account. If you buy something, the purchase is linked to this anonymous browser ID, so we can see which page or ad led to it. We do not store your IP address, only your country and device type. Raw records are kept for 90 days, after which only daily totals remain.', bn: 'আমরা নিজস্ব সহজ অ্যানালিটিক্স চালাই: কোন পেজ দেখা হয় ও কোন বাটন ব্যবহার হয়। এতে আপনার ব্রাউজারে রাখা একটি এলোমেলো আইডি ব্যবহার হয়; আমাদের নিজস্ব অ্যানালিটিক্স কোনো কুকি সেট করে না (উপরে বলা Google Analytics করতে পারে)। সাইন ইন থাকলে আপনার ভিজিট আপনার অ্যাকাউন্টের সাথে যুক্ত হয়। কিছু কিনলে সেই কেনাকাটা এই বেনামি ব্রাউজার আইডির সাথে যুক্ত হয়, যাতে আমরা বুঝতে পারি কোন পেজ বা বিজ্ঞাপন থেকে এসেছে। আমরা আপনার আইপি অ্যাড্রেস রাখি না, শুধু দেশ ও ডিভাইসের ধরন রাখি। মূল রেকর্ড ৯০ দিন থাকে, তারপর শুধু দৈনিক মোট সংখ্যা থাকে।' },
            { en: 'Messages you send through the contact form are saved together with the page you were on, the advertising source you came from (if any) and the anonymous browser ID. They are used only to reply to you.', bn: 'যোগাযোগ ফর্মে পাঠানো মেসেজ সংরক্ষণ করা হয়, সাথে থাকে আপনি যে পেজে ছিলেন, যে বিজ্ঞাপন থেকে এসেছেন (যদি থাকে) এবং বেনামি ব্রাউজার আইডি। এগুলো শুধু আপনাকে উত্তর দিতে ব্যবহার হয়।' },
            { en: `To have your analytics ID or contact messages deleted, message ${SUPPORT_WHATSAPP_DISPLAY} on WhatsApp.`, bn: `আপনার অ্যানালিটিক্স আইডি বা যোগাযোগের মেসেজ মুছতে হোয়াটসঅ্যাপে ${SUPPORT_WHATSAPP_DISPLAY} নম্বরে জানান।` },
          ],
        },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <Policy
      path="/terms"
      title={{ en: 'Terms and refunds', bn: 'শর্তাবলি ও রিফান্ড' }}
      sections={[
        {
          h: { en: 'Services', bn: 'সার্ভিস' },
          p: [
            { en: 'Delivery times start when we receive your CV or details after payment. Each service includes the number of changes listed on its page.', bn: 'পেমেন্টের পর আপনার সিভি বা তথ্য পাওয়া থেকে ডেলিভারির সময় গণনা শুরু হয়। প্রতিটি সার্ভিসে পেজে উল্লেখিত সংখ্যক সংশোধন অন্তর্ভুক্ত।' },
            { en: 'We write from the information you give us. You are responsible for checking that every fact in your CV is true.', bn: 'আপনার দেওয়া তথ্য থেকেই আমরা লিখি। সিভির প্রতিটি তথ্য সত্য কিনা তা যাচাইয়ের দায়িত্ব আপনার।' },
            { en: 'No service can guarantee a job or an interview.', bn: 'কোনো সার্ভিস চাকরি বা ইন্টারভিউয়ের নিশ্চয়তা দিতে পারে না।' },
          ],
        },
        {
          h: { en: 'Templates', bn: 'টেমপ্লেট' },
          p: [
            { en: 'Templates are for your own use. Please do not resell or share them.', bn: 'টেমপ্লেট শুধু আপনার নিজের ব্যবহারের জন্য। অনুগ্রহ করে বিক্রি বা শেয়ার করবেন না।' },
          ],
        },
        {
          h: { en: 'Refunds', bn: 'রিফান্ড' },
          p: [
            { en: 'If we have not started your service, you can ask for a full refund. If we cannot deliver within the stated time, you get a full refund.', bn: 'সার্ভিসের কাজ শুরু না হলে পুরো টাকা ফেরত চাইতে পারেন। নির্ধারিত সময়ে ডেলিভারি দিতে না পারলে পুরো টাকা ফেরত পাবেন।' },
            { en: 'Template packs are digital files, so they are refunded only if a file is broken and we cannot replace it.', bn: 'টেমপ্লেট প্যাক ডিজিটাল ফাইল, তাই শুধু ফাইল নষ্ট হলে এবং আমরা বদলে দিতে না পারলে রিফান্ড হয়।' },
            { en: `Refunds go back to the same bKash, Nagad or Rocket number within 3 working days. Ask on WhatsApp: ${SUPPORT_WHATSAPP_DISPLAY}.`, bn: `রিফান্ড ৩ কর্মদিবসের মধ্যে একই বিকাশ, নগদ বা রকেট নম্বরে ফেরত যায়। হোয়াটসঅ্যাপে জানান: ${SUPPORT_WHATSAPP_DISPLAY}।` },
          ],
        },
      ]}
    />
  );
}

export function NotFound() {
  const { t } = useLang();
  useEffect(() => setPageMeta(t({ en: 'Page not found', bn: 'পেজ পাওয়া যায়নি' }), '', window.location.pathname), [t]);
  return (
    <section className="wrap max-w-2xl py-20">
      <h1 className="text-4xl font-bold">{t({ en: 'This page does not exist', bn: 'এই পেজটি নেই' })}</h1>
      <p className="mt-3 text-lg text-muted">
        {t({ en: 'HereWeGrow now offers CV services, templates and free job tools.', bn: 'HereWeGrow এখন সিভি সার্ভিস, টেমপ্লেট ও ফ্রি জব টুলস দেয়।' })}
      </p>
      <Link href="/" className="btn btn-primary mt-6">{t({ en: 'Go to the home page', bn: 'হোম পেজে যান' })}</Link>
    </section>
  );
}
