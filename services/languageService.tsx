import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Translations, translations } from '../constants/languages';

const STORAGE_KEY = 'app_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: translations.en,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && saved in translations) {
        setLanguageState(saved as Language);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
