import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Bilingual } from '../../shared/catalog';
import { usePath } from './router';

export type Lang = 'bn' | 'en';

interface LangValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Pick the current language from a { en, bn } pair. */
  t: (text: Bilingual) => string;
}

const STORAGE_KEY = 'hwg_lang';
const LangContext = createContext<LangValue | null>(null);

const readStored = (): Lang => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'bn') return v;
  } catch {
    // storage unavailable: fall back to Bangla
  }
  return 'bn';
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [stored, setLangState] = useState<Lang>(readStored);
  // The CV builder is English only (CV input and output are English), whatever the site language is.
  const lang: Lang = usePath().startsWith('/builder') ? 'en' : stored;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  };

  return <LangContext.Provider value={{ lang, setLang, t: (x) => x[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const v = useContext(LangContext);
  if (!v) throw new Error('useLang must be used inside LangProvider');
  return v;
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBnDigits = (s: string) => s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/** ৳1,499 in English, ৳১,৪৯৯ in Bangla. */
export const taka = (amount: number, lang: Lang) => {
  const s = `৳${amount.toLocaleString('en-US')}`;
  return lang === 'bn' ? toBnDigits(s) : s;
};

export const num = (n: number | string, lang: Lang) => (lang === 'bn' ? toBnDigits(String(n)) : String(n));
