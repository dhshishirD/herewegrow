import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  X, 
  Check, 
  Search, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Coins 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../data/translations';

export const GeoSelectorModal: React.FC = () => {
  const { 
    isGeoModalOpen, 
    setIsGeoModalOpen, 
    country, 
    language, 
    currency, 
    allCountries, 
    applyCountrySelection, 
    t 
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState(country.code);
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [selectedCurrency, setSelectedCurrency] = useState<'BDT' | 'USD'>(currency);

  if (!isGeoModalOpen) return null;

  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCountry = (c: typeof allCountries[0]) => {
    setSelectedCode(c.code);
    setSelectedLang(c.defaultLang);
    setSelectedCurrency(c.defaultCurrency);
  };

  const handleApply = () => {
    applyCountrySelection(selectedCode, selectedLang, selectedCurrency);
  };

  const currentPickedCountry = allCountries.find(c => c.code === selectedCode) || country;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 flex items-center gap-2">
                {t('geo_modal_title')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('geo_modal_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGeoModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Active Detected Bar */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-slate-500 font-medium">{t('geo_detected_badge')}: </span>
                <strong className="text-slate-900 font-extrabold">{country.flag} {country.name} ({country.nativeName})</strong>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 shadow-2xs">
              {country.code}
            </span>
          </div>

          {/* Country Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-900">
                {t('geo_select_country')}
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {filteredCountries.length} available
              </span>
            </div>

            {/* Search Country Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or region (e.g. Bangladesh, United States)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredCountries.map((c) => {
                const isSelected = selectedCode === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl flex-shrink-0">{c.flag}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          {c.nativeName} • {c.currencySymbol} {c.defaultCurrency}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language & Currency Customizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            
            {/* Language Switch */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                {t('geo_select_language')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLang('en')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedLang === 'en'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  English (EN)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('bn')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedLang === 'bn'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  বাংলা (BN)
                </button>
              </div>
            </div>

            {/* Currency Switch */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                {t('geo_select_currency')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('BDT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedCurrency === 'BDT'
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ৳ BDT (Taka)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('USD')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedCurrency === 'USD'
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  $ USD (Dollar)
                </button>
              </div>
            </div>

          </div>

          {/* Payment Method Preview for Selected Country */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supported Payment Gateways for {currentPickedCountry.name}:</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {selectedCurrency === 'BDT' ? (
                <span className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-800">
                  <Smartphone className="w-3.5 h-3.5" /> bKash, Nagad, Rocket, Upay & Local Bank Gateway
                </span>
              ) : (
                <span className="flex items-center gap-1.5 mt-1 font-semibold text-indigo-800">
                  <Coins className="w-3.5 h-3.5" /> Binance Pay, Crypto (USDT TRC20 / BEP20) & International Cards
                </span>
              )}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsGeoModalOpen(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {t('geo_save_btn')}
          </button>
        </div>

      </div>
    </div>
  );
};
