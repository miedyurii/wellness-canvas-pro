import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface Translations {
  [key: string]: any;
}

const translations: Record<Language, Translations> = {
  en: {} as Translations,
  ru: {} as Translations,
};

// Load translations
const loadTranslations = async () => {
  try {
    const [enTranslations, ruTranslations] = await Promise.all([
      import('../locales/en.json'),
      import('../locales/ru.json'),
    ]);
    
    translations.en = enTranslations.default;
    translations.ru = ruTranslations.default;
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  useEffect(() => {
    loadTranslations().then(() => {
      setTranslationsLoaded(true);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    if (!translationsLoaded) return key;
    
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in any language
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};