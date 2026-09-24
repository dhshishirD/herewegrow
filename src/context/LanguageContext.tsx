import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, type Language, type TranslationDictionary } from '../data/translations';
import { COUNTRIES, detectInitialGeo, saveGeoPreference, probeIpCountry, type CountryConfig } from '../services/geoService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  country: CountryConfig;
  setCountry: (country: CountryConfig) => void;
  currency: 'BDT' | 'USD';
  setCurrency: (c: 'BDT' | 'USD') => void;
  t: (key: keyof TranslationDictionary) => string;
  isGeoModalOpen: boolean;
  setIsGeoModalOpen: (open: boolean) => void;
  allCountries: CountryConfig[];
  applyCountrySelection: (countryCode: string, lang?: Language, curr?: 'BDT' | 'USD') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = detectInitialGeo();
  const [country, setCountryState] = useState<CountryConfig>(initial.country);
  const [language, setLanguageState] = useState<Language>(initial.lang);
  const [currency, setCurrencyState] = useState<'BDT' | 'USD'>(initial.currency);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);

  // Background probe on initial mount to refine IP geo if user hasn't picked manually
  useEffect(() => {
    probeIpCountry().then((ipCountryCode) => {
      if (ipCountryCode) {
        const found = COUNTRIES.find((c) => c.code === ipCountryCode);
        if (found && found.code !== country.code && !localStorage.getItem('herewegrow_geo_country')) {
          setCountryState(found);
          setLanguageState(found.defaultLang);
          setCurrencyState(found.defaultCurrency);
          saveGeoPreference(found.code, found.defaultLang, found.defaultCurrency);
        }
      }
    });
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    saveGeoPreference(country.code, newLang, currency);
  };

  const setCurrency = (newCurr: 'BDT' | 'USD') => {
    setCurrencyState(newCurr);
    saveGeoPreference(country.code, language, newCurr);
  };

  const setCountry = (newCountry: CountryConfig) => {
    setCountryState(newCountry);
    setLanguageState(newCountry.defaultLang);
    setCurrencyState(newCountry.defaultCurrency);
    saveGeoPreference(newCountry.code, newCountry.defaultLang, newCountry.defaultCurrency);
  };

  const applyCountrySelection = (countryCode: string, customLang?: Language, customCurr?: 'BDT' | 'USD') => {
    const selected = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
    const resolvedLang = customLang || selected.defaultLang;
    const resolvedCurr = customCurr || selected.defaultCurrency;

    setCountryState(selected);
    setLanguageState(resolvedLang);
    setCurrencyState(resolvedCurr);
    saveGeoPreference(selected.code, resolvedLang, resolvedCurr);
    setIsGeoModalOpen(false);
  };

  const t = (key: keyof TranslationDictionary): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        country,
        setCountry,
        currency,
        setCurrency,
        t,
        isGeoModalOpen,
        setIsGeoModalOpen,
        allCountries: COUNTRIES,
        applyCountrySelection,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
