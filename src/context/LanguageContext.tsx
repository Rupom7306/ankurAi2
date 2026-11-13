import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  TranslationKey, 
  dictionaries, 
  formatNumber as formatNumHelper,
  toBanglaDigits
} from '../i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatNumber: (val: number | string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('ankur_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  useEffect(() => {
    localStorage.setItem('ankur_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLangState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const formatNumber = (val: number | string | null | undefined): string => {
    return formatNumHelper(val, lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = dictionaries[lang] || dictionaries.bn;
    let text = dict[key] || dictionaries.en[key] || (key as string);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        let displayVal = String(paramVal);
        if (typeof paramVal === 'number' && lang === 'bn') {
          displayVal = toBanglaDigits(paramVal);
        }
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), displayVal);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
