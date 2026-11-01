// Build step: writes a ready-made HTML page for every public route, so search engines and
// link previews (Google, Facebook, WhatsApp) get the right title, description, image and
// structured data without running JavaScript. Also writes sitemap.xml with image entries.
// The React app replaces the static content as soon as it loads.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import { PRODUCTS } from '../shared/catalog';
import { routeSeo } from '../shared/seo';
import { SECTORS, SINGLE_TEMPLATE_PRICE, TEMPLATES } from '../shared/templates';

const SITE = 'https://herewegrow.pro';
const TODAY = new Date().toISOString().slice(0, 10);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const seo = (path: string) => routeSeo(path)!;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
}

const ORG = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'HereWeGrow',
  url: `${SITE}/`,
  logo: `${SITE}/logo.png`,
  areaServed: { '@type': 'Country', name: 'Bangladesh' },
  contactPoint: { '@type': 'ContactPoint', telephone: '+8801981505759', contactType: 'customer support', availableLanguage: ['Bengali', 'English'] },
};

const crumbs = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});

const link = (path: string, text: string) => `<a href="${path}">${esc(text)}</a>`;

function pages(): Page[] {
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
      image: `${SITE}/templates/${TEMPLATES[0].id}/thumb.webp`,
      body: `<h1>Word-এ এডিট করার মতো সিভি টেমপ্লেট</h1><ul>${TEMPLATES.map((t) => `<li>${link(`/templates/${t.id}`, `${t.title.bn} (${t.title.en})`)}</li>`).join('')}</ul><h2>প্যাক</h2><ul>${packs.map((p) => `<li>${esc(p.name.bn)}: ৳${p.price}</li>`).join('')}</ul>`,
      jsonLd: [
        {
          '@type': 'ItemList',
          name: 'CV templates',
          itemListElement: TEMPLATES.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/templates/${t.id}`, name: t.title.en })),
        },
        crumbs([['HereWeGrow', '/'], ['CV templates', '/templates']]),
      ],
      priority: 0.95,
      images: TEMPLATES.map((t) => `${SITE}/templates/${t.id}/thumb.webp`),
    },
    {
      path: '/tools',
      ...seo('/tools'),
      body: `<h1>ফ্রি টুলস</h1><ul><li>${link('/tools/cv-checker', 'সিভি চেকার')}</li><li>${link('/tools/photo-signature-resizer', 'ছবি ও স্বাক্ষর রিসাইজার')}</li></ul>`,
      priority: 0.7,
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
    { path: '/privacy', title: 'Privacy | HereWeGrow', description: 'How HereWeGrow handles your information.', body: '<h1>Privacy</h1>', priority: 0.3 },
    { path: '/terms', title: 'Terms | HereWeGrow', description: 'Terms for HereWeGrow services and templates.', body: '<h1>Terms</h1>', priority: 0.3 },
  ];

  for (const t of TEMPLATES) {
    const sector = SECTORS.find((s) => s.id === t.sector)!;
    const style = t.style === 'ats' ? { en: 'ATS-friendly', bn: 'ATS-ফ্রেন্ডলি' } : { en: 'designed', bn: 'ডিজাইনড' };
    const url = `${SITE}/templates/${t.id}`;
    const images = Array.from({ length: t.pages }, (_, i) => `${url}/page-${i + 1}.webp`);
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
    });
  }
  return list;
}

function render(template: string, p: Page): string {
  const url = `${SITE}${p.path}`;
  const image = p.image ?? `${SITE}/logo.png`;
  const ld = p.jsonLd?.length
    ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': p.jsonLd }).replace(/</g, '\\u003c')}</script>`
    : '';
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(p.description)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(p.title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(p.description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(
    '</head>',
    `    <meta property="og:locale" content="bn_BD" />\n    <meta property="og:locale:alternate" content="en_US" />\n    <meta name="twitter:card" content="summary_large_image" />\n    ${ld}\n  </head>`,
  );
  return html.replace('<div id="root"></div>', `<div id="root"><main class="wrap" style="padding:2rem 1.25rem">${p.body}</main></div>`);
}

function sitemap(list: Page[]): string {
  const urls = list
    .map((p) => {
      const imgs = (p.images ?? []).map((i) => `<image:image><image:loc>${i}</image:loc></image:image>`).join('');
      return `  <url><loc>${SITE}${p.path}</loc><lastmod>${TODAY}</lastmod><priority>${p.priority.toFixed(1)}</priority>${imgs}</url>`;
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
      const list = pages();
      for (const p of list) {
        // "/templates/x" is written as templates/x.html so it is served without a trailing-slash redirect.
        const file = p.path === '/' ? join(outDir, 'index.html') : join(outDir, `${p.path}.html`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, render(template, p));
      }
      writeFileSync(join(outDir, 'sitemap.xml'), sitemap(list));
    },
  };
}
