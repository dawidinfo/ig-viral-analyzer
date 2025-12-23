import { de, Translations } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";

export type Language = "de" | "en" | "fr" | "es";

export const translations: Record<Language, Translations> = {
  de,
  en,
  fr,
  es,
};

export const languageNames: Record<Language, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  es: "Español",
};

export const languageFlags: Record<Language, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
};

// Country code to language mapping for geo-targeting
const countryToLanguage: Record<string, Language> = {
  // German-speaking countries
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  LU: "de",
  
  // English-speaking countries
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  ZA: "en",
  IN: "en",
  PH: "en",
  SG: "en",
  MY: "en",
  NG: "en",
  KE: "en",
  GH: "en",
  
  // French-speaking countries
  FR: "fr",
  BE: "fr",
  MC: "fr",
  SN: "fr",
  CI: "fr",
  CM: "fr",
  MG: "fr",
  ML: "fr",
  NE: "fr",
  BF: "fr",
  TG: "fr",
  BJ: "fr",
  GA: "fr",
  CG: "fr",
  CD: "fr",
  HT: "fr",
  
  // Spanish-speaking countries
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  PE: "es",
  VE: "es",
  CL: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  PR: "es",
};

// Default language
export const DEFAULT_LANGUAGE: Language = "de";

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = "reelspy_language";

/**
 * Get saved language from localStorage
 */
export function getSavedLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && isValidLanguage(saved)) {
    return saved as Language;
  }
  return null;
}

/**
 * Save language preference to localStorage
 */
export function saveLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

/**
 * Check if a string is a valid language code
 */
export function isValidLanguage(lang: string): lang is Language {
  return ["de", "en", "fr", "es"].includes(lang);
}

/**
 * Get language from browser settings
 */
export function getBrowserLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  if (browserLang && isValidLanguage(browserLang)) {
    return browserLang;
  }
  
  // Check navigator.languages array
  for (const lang of navigator.languages || []) {
    const code = lang.split("-")[0].toLowerCase();
    if (isValidLanguage(code)) {
      return code;
    }
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Detect language based on country code from geo-targeting
 */
export function getLanguageFromCountry(countryCode: string): Language {
  const upperCode = countryCode.toUpperCase();
  return countryToLanguage[upperCode] || DEFAULT_LANGUAGE;
}

/**
 * Fetch user's country from IP geolocation API
 */
export async function detectCountry(): Promise<string | null> {
  try {
    // Use ipapi.co for free geolocation (no API key needed)
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    
    if (!response.ok) {
      throw new Error("Geo API failed");
    }
    
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.warn("[i18n] Could not detect country:", error);
    return null;
  }
}

/**
 * Initialize language with geo-targeting
 * Priority: 1. Saved preference, 2. Geo-detected, 3. Browser language, 4. Default
 */
export async function initializeLanguage(): Promise<Language> {
  // 1. Check for saved preference
  const saved = getSavedLanguage();
  if (saved) {
    return saved;
  }
  
  // 2. Try geo-targeting
  try {
    const country = await detectCountry();
    if (country) {
      const geoLang = getLanguageFromCountry(country);
      saveLanguage(geoLang);
      return geoLang;
    }
  } catch (error) {
    console.warn("[i18n] Geo-targeting failed, falling back to browser language");
  }
  
  // 3. Fall back to browser language
  const browserLang = getBrowserLanguage();
  saveLanguage(browserLang);
  return browserLang;
}

/**
 * Get translation function for a specific language
 */
export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}

export type { Translations };
