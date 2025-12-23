import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  Language, 
  Translations, 
  getTranslations, 
  initializeLanguage, 
  saveLanguage,
  DEFAULT_LANGUAGE,
  languageNames,
  languageFlags,
} from "@/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isLoading: boolean;
  languageNames: typeof languageNames;
  languageFlags: typeof languageFlags;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize language with geo-targeting
    initializeLanguage().then((detectedLang) => {
      setLanguageState(detectedLang);
      setIsLoading(false);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
    // Update document lang attribute for accessibility
    document.documentElement.lang = lang;
  };

  const t = getTranslations(language);

  // Update document lang attribute on mount and language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t, 
        isLoading,
        languageNames,
        languageFlags,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Shorthand hook for just translations
export function useTranslations() {
  const { t } = useLanguage();
  return t;
}
