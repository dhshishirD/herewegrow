export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface HowToConfig {
  name: string;
  description: string;
  steps: { title: string; desc: string }[];
}

export interface MetaTagsConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  ogType?: string;
  ogImage?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  howTo?: HowToConfig;
  schema?: object | object[];
}

const DEFAULT_KEYWORDS = [
  'smm panel',
  'best smm panel',
  'cheapest smm panel',
  'smm panel bangladesh',
  'buy facebook followers bkash',
  'increase facebook followers',
  'youtube 4000 watch hours',
  'instagram followers buy',
  'free tiktok downloader hd',
  'youtube tag extractor',
  'engagement rate calculator',
  'fancy bio fonts',
  'bKash smm panel',
  'nagad smm panel',
  'HereWeGrow',
  'herewegrow.pro'
];

/**
 * Dynamically updates document title, meta tags, OpenGraph, Canonical URLs, and Google Featured Snippet JSON-LD Schemas
 */
export function updatePageSEO(config: MetaTagsConfig) {
  try {
    // 1. Title
    document.title = config.title;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', config.description);

    // 3. Meta Keywords
    const allKeywords = [...(config.keywords || []), ...DEFAULT_KEYWORDS];
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', allKeywords.join(', '));

    // 4. Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', config.canonicalUrl);

    // 5. OpenGraph Tags
    const setOgTag = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setOgTag('og:title', config.title);
    setOgTag('og:description', config.description);
    setOgTag('og:url', config.canonicalUrl);
    setOgTag('og:type', config.ogType || 'website');
    setOgTag('og:site_name', 'HereWeGrow.pro');
    setOgTag('og:image', config.ogImage || 'https://herewegrow.pro/logo.svg');

    // 6. Twitter Card Tags
    const setTwitterTag = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setTwitterTag('twitter:card', 'summary_large_image');
    setTwitterTag('twitter:title', config.title);
    setTwitterTag('twitter:description', config.description);
    setTwitterTag('twitter:image', config.ogImage || 'https://herewegrow.pro/logo.svg');

    // 7. Construct Google Featured Snippet Schemas
    const graphItems: object[] = [
      {
        '@type': 'WebSite',
        '@id': 'https://herewegrow.pro/#website',
        url: 'https://herewegrow.pro',
        name: 'HereWeGrow',
        description: 'All-in-One Social Creator Tools & Verified Growth Studio',
        publisher: {
          '@type': 'Organization',
          name: 'HereWeGrow',
          url: 'https://herewegrow.pro',
          logo: 'https://herewegrow.pro/logo.svg'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://herewegrow.pro/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://herewegrow.pro/#organization',
        name: 'HereWeGrow',
        url: 'https://herewegrow.pro',
        logo: 'https://herewegrow.pro/logo.svg',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.98',
          bestRating: '5',
          worstRating: '1',
          ratingCount: '12480',
          reviewCount: '8920'
        }
      }
    ];

    // FAQPage Schema (Triggers Google Rich Snippet Accordions)
    if (config.faqs && config.faqs.length > 0) {
      graphItems.push({
        '@type': 'FAQPage',
        mainEntity: config.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a
          }
        }))
      });
    }

    // HowTo Schema (Triggers Google #0 Featured Snippet Step Lists)
    if (config.howTo && config.howTo.steps && config.howTo.steps.length > 0) {
      graphItems.push({
        '@type': 'HowTo',
        name: config.howTo.name,
        description: config.howTo.description,
        step: config.howTo.steps.map((step, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: step.title,
          text: step.desc
        }))
      });
    }

    // BreadcrumbList Schema (Displays Clean Breadcrumb Trail in Google Search)
    if (config.breadcrumbs && config.breadcrumbs.length > 0) {
      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: config.breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url
        }))
      });
    }

    // Custom Schemas (e.g. Product, SoftwareApplication)
    if (config.schema) {
      if (Array.isArray(config.schema)) {
        graphItems.push(...config.schema);
      } else {
        graphItems.push(config.schema);
      }
    }

    // Inject to DOM
    const existingSchema = document.getElementById('dynamic-jsonld-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement('script');
    script.id = 'dynamic-jsonld-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graphItems
    });
    document.head.appendChild(script);

  } catch (err) {
    console.error('Failed to update SEO tags:', err);
  }
}
