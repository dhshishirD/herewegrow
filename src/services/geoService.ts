export interface CountryConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  defaultLang: 'en' | 'bn';
  defaultCurrency: 'BDT' | 'USD';
  currencySymbol: string;
  paymentNotice: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'BD',
    name: 'Bangladesh',
    nativeName: 'বাংলাদেশ',
    flag: '🇧🇩',
    defaultLang: 'bn',
    defaultCurrency: 'BDT',
    currencySymbol: '৳',
    paymentNotice: 'bKash, Nagad, Rocket & Bank instant checkout',
  },
  {
    code: 'US',
    name: 'United States',
    nativeName: 'United States',
    flag: '🇺🇸',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Cards, Apple Pay, Binance & Crypto',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    nativeName: 'United Kingdom',
    flag: '🇬🇧',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Cards, Binance Pay & USDT / Crypto',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    nativeName: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Crypto, Binance Pay & International Cards',
  },
  {
    code: 'IN',
    name: 'India & South Asia',
    nativeName: 'India',
    flag: '🇮🇳',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Binance Pay, USDT & Crypto',
  },
  {
    code: 'CA',
    name: 'Canada',
    nativeName: 'Canada',
    flag: '🇨🇦',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Cards & Crypto instant deposit',
  },
  {
    code: 'AU',
    name: 'Australia',
    nativeName: 'Australia',
    flag: '🇦🇺',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Cards, USDT & Binance Pay',
  },
  {
    code: 'EU',
    name: 'European Union',
    nativeName: 'Europe',
    flag: '🇪🇺',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Cards & Crypto payment processing',
  },
  {
    code: 'GLOBAL',
    name: 'Global / International',
    nativeName: 'International',
    flag: '🌐',
    defaultLang: 'en',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    paymentNotice: 'Worldwide Binance Pay, Crypto & Instant Cards',
  },
];

const GEO_STORAGE_KEY = 'herewegrow_geo_country';
const LANG_STORAGE_KEY = 'herewegrow_lang';
const CURRENCY_STORAGE_KEY = 'herewegrow_currency';

/**
 * Detect user's country using local timezone, browser language, or saved preference.
 */
export function detectInitialGeo(): { country: CountryConfig; lang: 'en' | 'bn'; currency: 'BDT' | 'USD' } {
  try {
    const savedCountry = localStorage.getItem(GEO_STORAGE_KEY);
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as 'en' | 'bn' | null;
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as 'BDT' | 'USD' | null;

    if (savedCountry) {
      const match = COUNTRIES.find((c) => c.code === savedCountry);
      if (match) {
        return {
          country: match,
          lang: savedLang || match.defaultLang,
          currency: savedCurrency || match.defaultCurrency,
        };
      }
    }

    // Timezone check for Bangladesh
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const isBangladeshTz = timeZone.toLowerCase().includes('dhaka') || timeZone.toLowerCase().includes('asia/dhaka');

    // Language check
    const browserLang = (navigator.language || '').toLowerCase();
    const isBengaliLang = browserLang.startsWith('bn');

    if (isBangladeshTz || isBengaliLang) {
      const bd = COUNTRIES.find((c) => c.code === 'BD')!;
      return {
        country: bd,
        lang: savedLang || 'bn',
        currency: savedCurrency || 'BDT',
      };
    }

    // Default global / international
    const globalCountry = COUNTRIES.find((c) => c.code === 'GLOBAL') || COUNTRIES[1];
    return {
      country: globalCountry,
      lang: savedLang || 'en',
      currency: savedCurrency || 'USD',
    };
  } catch {
    const fallback = COUNTRIES[0];
    return { country: fallback, lang: 'bn', currency: 'BDT' };
  }
}

/**
 * Save user preference to localStorage
 */
export function saveGeoPreference(countryCode: string, lang: 'en' | 'bn', currency: 'BDT' | 'USD') {
  try {
    localStorage.setItem(GEO_STORAGE_KEY, countryCode);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  } catch (e) {
    console.error('Failed to save geo preference:', e);
  }
}

/**
 * Asynchronously probe client IP location to refine country if not explicitly set by user.
 */
export async function probeIpCountry(): Promise<string | null> {
  // If user already explicitly set country, do not overwrite
  if (localStorage.getItem(GEO_STORAGE_KEY)) {
    return localStorage.getItem(GEO_STORAGE_KEY);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://api.country.is', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.country) {
        return data.country.toUpperCase();
      }
    }
  } catch {
    // Fail silently, fallback already handled
  }
  return null;
}
