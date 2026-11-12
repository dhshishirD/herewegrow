// Every public link, in one place: the header menus and the footer read from here so they never drift apart.

import type { Bilingual } from '../../shared/builderContent';

export interface NavLink { href: string; label: Bilingual }

export const BUILDER_LINK: NavLink = { href: '/builder', label: { en: 'CV Builder', bn: 'সিভি বিল্ডার' } };

/** The few links that sit in the header bar itself. */
export const PRIMARY_LINKS: NavLink[] = [
  { href: '/templates', label: { en: 'Templates', bn: 'টেমপ্লেট' } },
  { href: '/services', label: { en: 'Services', bn: 'সার্ভিস' } },
  { href: '/tools', label: { en: 'Free tools', bn: 'ফ্রি টুলস' } },
];

/** The "Resources" menu. */
export const RESOURCE_LINKS: NavLink[] = [
  { href: '/guides', label: { en: 'Career guides', bn: 'ক্যারিয়ার গাইড' } },
  { href: '/blog', label: { en: 'Blog', bn: 'ব্লগ' } },
  { href: '/careers', label: { en: 'Career roles and salaries', bn: 'ক্যারিয়ার রোল ও বেতন' } },
  { href: '/about', label: { en: 'About us', bn: 'আমাদের কথা' } },
];

export interface LinkGroup { title: Bilingual; links: NavLink[] }

/** Footer columns, and the groups in the phone menu. */
export const LINK_GROUPS: LinkGroup[] = [
  {
    title: { en: 'Make a CV', bn: 'সিভি বানান' },
    links: [
      BUILDER_LINK,
      { href: '/templates', label: { en: 'CV templates', bn: 'সিভি টেমপ্লেট' } },
      { href: '/cv-for-gulf-jobs', label: { en: 'Gulf job CV', bn: 'গালফ চাকরির সিভি' } },
      { href: '/tools/cv-checker', label: { en: 'Free CV checker', bn: 'ফ্রি সিভি চেকার' } },
    ],
  },
  {
    title: { en: 'Services', bn: 'সার্ভিস' },
    links: [
      { href: '/services', label: { en: 'CV writing and review', bn: 'সিভি রাইটিং ও রিভিউ' } },
      { href: '/linkedin-profile-optimization', label: { en: 'LinkedIn profile', bn: 'লিংকডইন প্রোফাইল' } },
      { href: '/bdjobs-profile-optimization', label: { en: 'BDJobs profile setup', bn: 'বিডিজবস প্রোফাইল সেটআপ' } },
    ],
  },
  {
    title: { en: 'Free tools', bn: 'ফ্রি টুলস' },
    links: [
      { href: '/tools/cv-checker', label: { en: 'CV checker', bn: 'সিভি চেকার' } },
      { href: '/tools/photo-signature-resizer', label: { en: 'Photo and signature resizer', bn: 'ছবি ও স্বাক্ষর রিসাইজার' } },
      { href: '/tools/application-letter', label: { en: 'Application letter', bn: 'আবেদনপত্র জেনারেটর' } },
      { href: '/tools/job-match', label: { en: 'CV and job ad match', bn: 'সিভি বনাম বিজ্ঞাপন ম্যাচ' } },
      { href: '/tools/scam-shield', label: { en: 'Fake job ad checker', bn: 'ভুয়া চাকরির বিজ্ঞপ্তি চেকার' } },
    ],
  },
  {
    title: { en: 'Learn and company', bn: 'শিখুন ও আমরা' },
    links: [
      ...RESOURCE_LINKS,
      { href: '/contact', label: { en: 'Contact', bn: 'যোগাযোগ' } },
    ],
  },
];
