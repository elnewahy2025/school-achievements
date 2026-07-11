'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { t as translate } from '@/lib/i18n';

type Theme = 'dark' | 'light';
type Language = 'en' | 'ar';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const SettingsContext = createContext<SettingsContextType>({
  theme: 'dark',
  language: 'en',
  toggleTheme: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
  dir: 'ltr',
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', language);
  }, [language, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const tFn = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language]
  );

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        toggleTheme,
        toggleLanguage,
        t: tFn,
        dir: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
