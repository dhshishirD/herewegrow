// Build step: writes a ready-made HTML page for every public route, so search engines and
// link previews (Google, Facebook, WhatsApp) get the right title, description, image and
// structured data without running JavaScript. Also writes sitemap.xml with image entries.
// The React app replaces the static content as soon as it loads.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import { esc, renderPage } from '../shared/pageHtml';
import { PRODUCTS } from '../shared/catalog';
import { GUIDES, type Block } from '../shared/guides';
import { DESIGN_LIST, PRO_DESIGN_COUNT } from '../shared/designList';
import { ABROAD_PAGES } from '../shared/abroadPages';
import { PLANS } from '../shared/plans';
import { PROFILE_PAGES } from '../shared/profilePages';
import { routeSeo } from '../shared/seo';
import { CATEGORY_CONTENT } from '../shared/categoryContent';
import { liveCategoryPages, templatesOfCategory } from '../shared/categoryPages';
import { SECTORS, SINGLE_TEMPLATE_PRICE, TEMPLATES, shownPages } from '../shared/templates';
import { readLastmod, resolveLastmod, writeLastmod } from './lastmod';
import { canonicalPathFor, isListed, isRetired, isVariant, redirectsFile, shouldIndex } from '../shared/templateTiers';

/** Retired templates have no page (the Worker answers 301). Tiers and variants: see shared/templateTiers.ts. */
const LISTED_TEMPLATES = TEMPLATES.filter((t) => isListed(t.id));

const SITE = 'https://herewegrow.pro';
// Bangladesh day (UTC+6), the same calendar the blog uses.
const TODAY = new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const seo = (path: string) => routeSeo(path)!;

interface Page {
  path: string;
  title: string;
  description: string;
  image?: string;
  /** Static fallback content placed inside #root. */
  body: string;
  jsonLd?: unknown[];
  priority: number;
  images?: string[];
  lastmod?: string;
  /** Day the page was first published, if it has one. Used only the first time the page is seen. */
  firstDate?: string;
  /** Keep out of search results and the sitemap. */
  noindex?: boolean;
  /** Original page when this one is a variant: out of the sitemap, canonical points at the lead. */
  canonical?: string;
}

const ORG = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'HereWeGrow',
  url: `${SITE}/`,
  logo: `${SITE}/logo.png`,
  areaServed: { '@type': 'Country', name: 'Bangladesh' },
  contactPoint: { '@type': 'ContactPoint', telephone: '+8801981505761', contactType: 'customer support', availableLanguage: ['Bengali', 'English'] },
};

const crumbs = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});

const link = (path: string, text: string) => `<a href="${path}">${esc(text)}</a>`;

export function pages(): Page[] {
  const services = PRODUCTS.filter((p) => p.kind === 'service');
  const packs = PRODUCTS.filter((p) => p.kind === 'pack');

  const list: Page[] = [
    {
      path: '/',
      ...seo('/'),
      body: `<h1>সিভি রাইটিং, সিভি টেমপ্লেট ও ফ্রি জব টুলস</h1><p>বাংলাদেশের চাকরিপ্রার্থীদের জন্য।</p><ul>${[
        link('/services', 'সিভি রাইটিং ও রিভিউ'),
        link('/templates', 'সিভি টেমপ্লেট'),
        link('/tools/cv-checker', 'ফ্রি সিভি চেকার'),
        link('/tools/photo-signature-resizer', 'ছবি ও স্বাক্ষর রিসাইজার'),
      ].map((l) => `<li>${l}</li>`).join('')}</ul>`,
      jsonLd: [ORG, { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'HereWeGrow', url: `${SITE}/`, inLanguage: ['bn', 'en'], publisher: { '@id': `${SITE}/#org` } }],
      priority: 1,
    },
    {
      path: '/services',
      ...seo('/services'),
      body: `<h1>সিভি রাইটিং ও রিভিউ</h1><ul>${services.map((s) => `<li>${esc(s.name.bn)} (${esc(s.name.en)}): ৳${s.price}. ${esc(s.summary.bn)}</li>`).join('')}</ul>`,
      jsonLd: [
        ...services.map((s) => ({
          '@type': 'Service',
          name: s.name.en,
          alternateName: s.name.bn,
          description: s.summary.en,
          provider: { '@id': `${SITE}/#org` },
          areaServed: 'BD',
          offers: { '@type': 'Offer', price: s.price, priceCurrency: 'BDT', url: `${SITE}/services` },
        })),
        crumbs([['HereWeGrow', '/'], ['CV writing', '/services']]),
      ],
      priority: 0.9,
    },
    {
      path: '/templates',
      ...seo('/templates'),
      image: `${SITE}/templates/${LISTED_TEMPLATES[0].id}/thumb.webp`,
      body: `<h1>Word-এ এডিট করার মতো সিভি টেমপ্লেট</h1><ul>${LISTED_TEMPLATES.map((t) => `<li>${link(`/templates/${t.id}`, `${t.title.bn} (${t.title.en})`)}</li>`).join('')}</ul><h2>প্যাক</h2><ul>${packs.map((p) => `<li>${esc(p.name.bn)}: ৳${p.price}</li>`).join('')}</ul>`,
      jsonLd: [
        {
          '@type': 'ItemList',
          name: 'CV templates',
          itemListElement: LISTED_TEMPLATES.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/templates/${t.id}`, name: t.title.en })),
        },
        crumbs([['HereWeGrow', '/'], ['CV templates', '/templates']]),
      ],
      priority: 0.95,
      images: LISTED_TEMPLATES.map((t) => `${SITE}/templates/${t.id}/thumb.webp`),
    },
    {
      path: '/tools',
      ...seo('/tools'),
      body: `<h1>ফ্রি টুলস</h1><ul><li>${link('/builder', 'সিভি বিল্ডার')}</li><li>${link('/tools/cv-checker', 'সিভি চেকার')}</li><li>${link('/tools/photo-signature-resizer', 'ছবি ও স্বাক্ষর রিসাইজার')}</li><li>${link('/tools/application-letter', 'আবেদনপত্র জেনারেটর')}</li><li>${link('/tools/job-match', 'সিভি বনাম বিজ্ঞাপন ম্যাচ')}</li><li>${link('/tools/scam-shield', 'ভুয়া চাকরির বিজ্ঞপ্তি চেকার')}</li></ul>`,
      priority: 0.7,
    },
    {
      path: '/builder',
      ...seo('/builder'),
      body: `<h1>ফ্রি সিভি বিল্ডার</h1><p>সহজ ফর্ম পূরণ করে ${bn(DESIGN_LIST.length)}টি ডিজাইনে সিভি বানান ও PDF ডাউনলোড করুন।</p><ul>${DESIGN_LIST.map((d) => `<li>${esc(d.name.bn)}: ${esc(d.note.bn)}</li>`).join('')}</ul>`,
      jsonLd: [{ '@type': 'WebApplication', name: 'HereWeGrow CV builder', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' } }],
      priority: 0.9,
    },
    {
      path: '/tools/cv-checker',
      ...seo('/tools/cv-checker'),
      body: '<h1>ফ্রি সিভি চেকার</h1><p>১০০-এর মধ্যে স্কোর ও সংশোধনের তালিকা।</p>',
      jsonLd: [{ '@type': 'WebApplication', name: 'HereWeGrow CV checker', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' } }],
      priority: 0.9,
    },
    {
      path: '/tools/photo-signature-resizer',
      ...seo('/tools/photo-signature-resizer'),
      body: '<h1>ছবি ও স্বাক্ষর রিসাইজার</h1><p>ছবি 300×300, স্বাক্ষর 300×80।</p>',
      jsonLd: [{ '@type': 'WebApplication', name: 'Teletalk photo and signature resizer', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' } }],
      priority: 0.9,
    },
    {
      path: '/tools/application-letter',
      ...seo('/tools/application-letter'),
      body: '<h1>আবেদনপত্র জেনারেটর</h1><p>সরকারি ও বেসরকারি চাকরির আবেদনপত্র, বাংলা ও ইংরেজিতে।</p>',
      jsonLd: [{ '@type': 'WebApplication', name: 'HereWeGrow application letter generator', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' } }],
      priority: 0.9,
    },
    {
      path: '/tools/job-match',
      ...seo('/tools/job-match'),
      body: '<h1>সিভি বনাম চাকরির বিজ্ঞাপন ম্যাচ</h1><p>বিজ্ঞাপনের মূল শব্দের কতটা আপনার সিভিতে আছে, তা দেখুন।</p>',
      jsonLd: [{ '@type': 'WebApplication', name: 'HereWeGrow CV job match checker', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' } }],
      priority: 0.9,
    },
    {
      path: '/tools/scam-shield',
      ...seo('/tools/scam-shield'),
      body: '<h1>ভুয়া চাকরির বিজ্ঞপ্তি চেকার</h1><p>চাকরির বিজ্ঞপ্তি বা মেসেজ পেস্ট করে আগে টাকা চাওয়া, বিকাশে পেমেন্ট, ইন্টারভিউ ছাড়া চাকরির মতো লাল পতাকা দেখুন। লেখাটি আপনার ব্রাউজারেই থাকে।</p>',
      jsonLd: [{ '@type': 'WebApplication', name: 'HereWeGrow fake job checker', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'BDT' } }],
      priority: 0.9,
    },
    {
      path: '/about',
      ...seo('/about'),
      image: `${SITE}/team/shishir.webp`,
      body: '<h1>HereWeGrow সম্পর্কে</h1><p>দেলোয়ার হাসান শিশির, প্রতিষ্ঠাতা ও লিড সিভি কনসালট্যান্ট, Career Solutions।</p>',
      jsonLd: [
        {
          '@type': 'Person',
          name: 'Daloyar Hassan Shishir',
          alternateName: 'দেলোয়ার হাসান শিশির',
          jobTitle: 'Founder and lead CV consultant',
          worksFor: { '@id': `${SITE}/#org` },
          image: `${SITE}/team/shishir.webp`,
          alumniOf: { '@type': 'CollegeOrUniversity', name: 'Shahjalal University of Science and Technology' },
        },
        crumbs([['HereWeGrow', '/'], ['About', '/about']]),
      ],
      priority: 0.6,
    },
    {
      path: '/contact',
      ...seo('/contact'),
      body: '<h1>যোগাযোগ</h1><p>আপনার নম্বর ও একটি ছোট বার্তা দিন। আমরা যোগাযোগ করব।</p><p>Leave your number and a short message. We will get back to you.</p>',
      jsonLd: [
        { '@type': 'ContactPage', name: 'Contact HereWeGrow', url: `${SITE}/contact`, about: { '@id': `${SITE}/#org` } },
        crumbs([['HereWeGrow', '/'], ['Contact', '/contact']]),
      ],
      priority: 0.5,
    },
    {
      path: '/pro',
      ...seo('/pro'),
      body: `<h1>HereWeGrow Pro</h1><p>মার্কছাড়া PDF ও Word, ${bn(PRO_DESIGN_COUNT)}টি প্রিমিয়াম সিভি ডিজাইন, অনলাইনে সিভি সেভ ও টেমপ্লেটে ছাড়।</p><ul>${PLANS.map((p) => `<li>${esc(p.name.bn)} (${esc(p.name.en)}): ৳${p.price}</li>`).join('')}</ul>`,
      jsonLd: [
        {
          '@type': 'Product',
          name: 'HereWeGrow Pro',
          description: 'CV builder pass: watermark-free PDF and Word downloads, premium designs, saved CVs and template discounts.',
          brand: { '@type': 'Brand', name: 'HereWeGrow' },
          offers: PLANS.map((p) => ({ '@type': 'Offer', name: p.name.en, price: p.price, priceCurrency: 'BDT', url: `${SITE}/pro`, availability: 'https://schema.org/InStock' })),
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'Will money be taken again automatically?', acceptedAnswer: { '@type': 'Answer', text: 'No. You pay once by bKash, Nagad or Rocket. Nothing renews by itself.' } },
            { '@type': 'Question', name: 'What if I buy Pro again while it is active?', acceptedAnswer: { '@type': 'Answer', text: 'The new days are added after your current end date. You never lose days.' } },
            { '@type': 'Question', name: 'What happens to my CVs when Pro ends?', acceptedAnswer: { '@type': 'Answer', text: 'They stay saved. You can still open and edit them; clean downloads return when you renew.' } },
          ],
        },
        crumbs([['HereWeGrow', '/'], ['Pro', '/pro']]),
      ],
      priority: 0.8,
    },
    ...Object.values(PROFILE_PAGES).map((pp): Page => {
      const prod = PRODUCTS.find((p) => p.id === pp.productId)!;
      return {
        path: pp.path,
        ...seo(pp.path),
        body: `<h1>${esc(pp.title.bn)}</h1><p>${esc(pp.lead.bn)}</p><p>${esc(pp.lead.en)}</p><ul>${prod.includes.map((i) => `<li>${esc(i.bn)} (${esc(i.en)})</li>`).join('')}</ul><p>৳${prod.price}</p><ul>${pp.faq.map((f) => `<li><strong>${esc(f.q.bn)}</strong> ${esc(f.a.bn)}</li>`).join('')}</ul>`,
        jsonLd: [
          {
            '@type': 'Service',
            name: prod.name.en,
            alternateName: prod.name.bn,
            serviceType: pp.eyebrow.en,
            description: pp.lead.en,
            provider: { '@id': `${SITE}/#org` },
            areaServed: 'BD',
            offers: { '@type': 'Offer', price: prod.price, priceCurrency: 'BDT', url: `${SITE}${pp.path}` },
          },
          {
            '@type': 'FAQPage',
            mainEntity: pp.faq.map((f) => ({ '@type': 'Question', name: f.q.en, acceptedAnswer: { '@type': 'Answer', text: f.a.en } })),
          },
          crumbs([['HereWeGrow', '/'], ['Services', '/services'], [pp.eyebrow.en, pp.path]]),
        ],
        priority: 0.9,
      };
    }),
    ...Object.values(ABROAD_PAGES).map((ap): Page => ({
      path: ap.path,
      ...seo(ap.path),
      body: `<h1>${esc(ap.title.bn)}</h1><p>${esc(ap.lead.bn)}</p><p>${esc(ap.lead.en)}</p><ol>${ap.expect.map((e) => `<li><strong>${esc(e.title.bn)}</strong> ${esc(e.body.bn)}</li>`).join('')}</ol><ul>${ap.safety.map((x) => `<li>${esc(x.bn)}</li>`).join('')}</ul><p>${link(`/builder?preset=${ap.presetId}`, 'বিনামূল্যে সিভি বানান')} · ${link('/pro', 'Pro')} · ${link('/services', 'সিভি রাইটিং')}</p><ul>${ap.faq.map((f) => `<li><strong>${esc(f.q.bn)}</strong> ${esc(f.a.bn)}</li>`).join('')}</ul><p>সর্বশেষ যাচাই ${esc(ap.lastChecked)}</p>`,
      jsonLd: [
        {
          '@type': 'Article',
          headline: ap.title.en,
          alternativeHeadline: ap.title.bn,
          description: ap.lead.en,
          inLanguage: ['bn', 'en'],
          datePublished: ap.lastChecked,
          dateModified: ap.lastChecked,
          mainEntityOfPage: `${SITE}${ap.path}`,
          image: `${SITE}/og.jpg`,
          author: { '@type': 'Person', name: 'Daloyar Hassan Shishir', url: `${SITE}/about` },
          publisher: { '@id': `${SITE}/#org` },
        },
        {
          '@type': 'FAQPage',
          mainEntity: ap.faq.map((f) => ({ '@type': 'Question', name: f.q.en, acceptedAnswer: { '@type': 'Answer', text: f.a.en } })),
        },
        crumbs([['HereWeGrow', '/'], ['CV builder', '/builder'], [ap.eyebrow.en, ap.path]]),
      ],
      priority: 0.9,
      firstDate: ap.lastChecked,
    })),
    { path: '/privacy', title: 'Privacy | HereWeGrow', description: 'How HereWeGrow handles your information.', body: '<h1>Privacy</h1>', priority: 0.3 },
    { path: '/terms', title: 'Terms | HereWeGrow', description: 'Terms for HereWeGrow services and templates.', body: '<h1>Terms</h1>', priority: 0.3 },
  ];

  list.push({
    path: '/guides',
    ...seo('/guides'),
    body: `<h1>ক্যারিয়ার গাইড</h1><ul>${GUIDES.map((g) => `<li>${link(`/guides/${g.slug}`, g.title.bn)}: ${esc(g.summary)}</li>`).join('')}</ul>`,
    jsonLd: [crumbs([['HereWeGrow', '/'], ['Career guides', '/guides']])],
    priority: 0.8,
  });
  const blockHtml = (b: Block) =>
    'h2' in b ? `<h2>${esc(b.h2)}</h2>`
    : 'p' in b ? `<p>${esc(b.p)}</p>`
    : 'ul' in b ? `<ul>${b.ul.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
    : 'ol' in b ? `<ol>${b.ol.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`
    : `<p>${esc(b.tip)}</p>`;
  for (const g of GUIDES) {
    const url = `${SITE}/guides/${g.slug}`;
    list.push({
      path: `/guides/${g.slug}`,
      ...seo(`/guides/${g.slug}`),
      body: `<article lang="bn"><h1>${esc(g.title.bn)}</h1><p>${esc(g.summary)}</p>${g.body.map(blockHtml).join('')}<p>${link(g.cta.href, g.cta.label.bn)}</p></article>`,
      jsonLd: [
        {
          '@type': 'Article',
          headline: g.title.bn,
          alternativeHeadline: g.title.en,
          description: g.summary,
          inLanguage: 'bn',
          datePublished: g.date,
          dateModified: g.date,
          mainEntityOfPage: url,
          image: `${SITE}/og.jpg`,
          author: { '@type': 'Person', name: 'Daloyar Hassan Shishir', url: `${SITE}/about` },
          publisher: { '@id': `${SITE}/#org` },
        },
        crumbs([['HereWeGrow', '/'], ['Career guides', '/guides'], [g.title.en, `/guides/${g.slug}`]]),
      ],
      priority: 0.8,
      firstDate: g.date,
    });
  }

  for (const t of TEMPLATES) {
    if (isRetired(t.id)) continue; // no page: the Worker answers 301
    const sector = SECTORS.find((s) => s.id === t.sector)!;
    const style = t.style === 'ats' ? { en: 'ATS-friendly', bn: 'ATS-ফ্রেন্ডলি' } : { en: 'designed', bn: 'ডিজাইনড' };
    const url = `${SITE}/templates/${t.id}`;
    const images = Array.from({ length: shownPages(t) }, (_, i) => `${url}/page-${i + 1}.webp`);
    list.push({
      path: `/templates/${t.id}`,
      ...seo(`/templates/${t.id}`),
      image: `${url}/page-1.webp`,
      body: `<h1>${esc(t.title.bn)}</h1><p>${esc(t.title.en)}. ${bn(t.pages)} পৃষ্ঠা, ${style.bn}। ৳${SINGLE_TEMPLATE_PRICE}।</p><p>${link('/templates', 'সব সিভি টেমপ্লেট')}</p>`,
      jsonLd: [
        {
          '@type': 'Product',
          name: t.title.en,
          alternateName: t.title.bn,
          sku: t.id,
          image: images,
          description: `Editable ${t.pages}-page ${style.en} CV template in Microsoft Word for ${sector.name.en.toLowerCase()} jobs in Bangladesh.`,
          brand: { '@type': 'Brand', name: 'HereWeGrow' },
          category: 'CV template',
          offers: {
            '@type': 'Offer',
            url,
            price: SINGLE_TEMPLATE_PRICE,
            priceCurrency: 'BDT',
            availability: 'https://schema.org/InStock',
            seller: { '@id': `${SITE}/#org` },
            hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'BD', returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted' },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'BDT' },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'BD' },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
                transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
              },
            },
          },
        },
        crumbs([['HereWeGrow', '/'], ['CV templates', '/templates'], [t.title.en, `/templates/${t.id}`]]),
      ],
      priority: 0.8,
      images,
      noindex: !shouldIndex(t) || (isVariant(t.id) && !!t.lib),
      canonical: isVariant(t.id) ? canonicalPathFor(t.id) : undefined,
    });
  }
  // Category pages: only those whose text is written (shared/categoryContent.ts).
  for (const c of liveCategoryPages()) {
    const content = CATEGORY_CONTENT[c.slug];
    const tpls = templatesOfCategory(c.slug);
    const path = `/templates/category/${c.slug}`;
    list.push({
      path,
      ...seo(path),
      image: `${SITE}/templates/${tpls[0].id}/thumb.webp`,
      body: `<h1>${esc(c.title.bn)}</h1>${content.intro.map((p) => `<p>${esc(p)}</p>`).join('')}<ul>${tpls.map((t) => `<li>${link(`/templates/${t.id}`, `${t.title.bn} (${t.title.en})`)}</li>`).join('')}</ul><h2>সাধারণ প্রশ্ন</h2><ul>${content.faq.map((f) => `<li><strong>${esc(f.q)}</strong> ${esc(f.a)}</li>`).join('')}</ul><p>${link('/templates', 'সব সিভি টেমপ্লেট')}</p>`,
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: c.title.bn,
          alternateName: c.title.en,
          url: `${SITE}${path}`,
          inLanguage: 'bn',
          mainEntity: { '@type': 'ItemList', itemListElement: tpls.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/templates/${t.id}`, name: t.title.en })) },
        },
        { '@type': 'FAQPage', mainEntity: content.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
        crumbs([['HereWeGrow', '/'], ['CV templates', '/templates'], [c.title.en, path]]),
      ],
      priority: 0.8,
      images: tpls.slice(0, 12).map((t) => `${SITE}/templates/${t.id}/thumb.webp`),
    });
  }
  return list;
}

export function sitemap(list: Page[]): string {
  const urls = list
    .filter((p) => !p.noindex && (!p.canonical || p.canonical === p.path))
    .map((p) => {
      const imgs = (p.images ?? []).map((i) => `<image:image><image:loc>${i}</image:loc></image:image>`).join('');
      return `  <url><loc>${SITE}${p.path}</loc><lastmod>${p.lastmod ?? TODAY}</lastmod><priority>${p.priority.toFixed(1)}</priority>${imgs}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}

export function seoPages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'hwg-seo-pages',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir;
    },
    closeBundle() {
      const template = readFileSync(join(outDir, 'index.html'), 'utf8');
      // The empty shell, kept so the Worker can build blog pages from it (blog posts live in the database).
      writeFileSync(join(outDir, 'blog-shell.txt'), template);
      const list = pages();
      for (const p of list) {
        // "/templates/x" is written as templates/x.html so it is served without a trailing-slash redirect.
        const file = p.path === '/' ? join(outDir, 'index.html') : join(outDir, `${p.path}.html`);
        mkdirSync(dirname(file), { recursive: true });
        const html = renderPage(template, p);
        writeFileSync(file, p.noindex ? html.replace('</head>', '<meta name="robots" content="noindex,follow" /></head>') : html);
      }
      // Real lastmod: a page's date changes only when its content does (see scripts/lastmod.ts).
      const { file, dates } = resolveLastmod(readLastmod(), list, TODAY);
      for (const p of list) p.lastmod = dates[p.path];
      writeLastmod(file);
      writeFileSync(join(outDir, 'sitemap.xml'), sitemap(list));
      // Retired template pages: 301 rules applied by Cloudflare before it serves any asset (the Worker is not reached for /templates/*).
      writeFileSync(join(outDir, '_redirects'), redirectsFile());
    },
  };
}
