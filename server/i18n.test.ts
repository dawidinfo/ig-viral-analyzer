import { describe, it, expect } from 'vitest';

// Import translations directly from client files
import { de } from '../client/src/i18n/de';
import { en } from '../client/src/i18n/en';
import { fr } from '../client/src/i18n/fr';
import { es } from '../client/src/i18n/es';

const translations = { de, en, fr, es };
type Language = 'de' | 'en' | 'fr' | 'es';

const languageNames: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  es: 'Español'
};

const languageFlags: Record<Language, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸'
};

const DEFAULT_LANGUAGE: Language = 'de';

const isValidLanguage = (lang: string): lang is Language => {
  return ['de', 'en', 'fr', 'es'].includes(lang);
};

const getLanguageFromCountry = (countryCode: string): Language => {
  const code = countryCode.toUpperCase();
  const countryToLanguage: Record<string, Language> = {
    'DE': 'de', 'AT': 'de', 'CH': 'de', 'LI': 'de', 'LU': 'de',
    'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en',
    'FR': 'fr', 'BE': 'fr', 'SN': 'fr', 'CI': 'fr', 'ML': 'fr', 'BF': 'fr',
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'CL': 'es', 'VE': 'es'
  };
  return countryToLanguage[code] || DEFAULT_LANGUAGE;
};

const getTranslations = (lang: Language) => {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
};

describe('i18n System', () => {
  describe('translations', () => {
    it('should have all four languages', () => {
      expect(Object.keys(translations)).toHaveLength(4);
      expect(translations.de).toBeDefined();
      expect(translations.en).toBeDefined();
      expect(translations.fr).toBeDefined();
      expect(translations.es).toBeDefined();
    });

    it('should have consistent structure across all languages', () => {
      const deKeys = Object.keys(translations.de);
      const enKeys = Object.keys(translations.en);
      const frKeys = Object.keys(translations.fr);
      const esKeys = Object.keys(translations.es);

      expect(enKeys).toEqual(deKeys);
      expect(frKeys).toEqual(deKeys);
      expect(esKeys).toEqual(deKeys);
    });

    it('should have nav translations in all languages', () => {
      const languages: Language[] = ['de', 'en', 'fr', 'es'];
      languages.forEach(lang => {
        expect(translations[lang].nav.features).toBeDefined();
        expect(translations[lang].nav.howItWorks).toBeDefined();
        expect(translations[lang].nav.pricing).toBeDefined();
        expect(translations[lang].nav.login).toBeDefined();
        expect(translations[lang].nav.dashboard).toBeDefined();
      });
    });

    it('should have hero translations in all languages', () => {
      const languages: Language[] = ['de', 'en', 'fr', 'es'];
      languages.forEach(lang => {
        expect(translations[lang].hero.badge).toBeDefined();
        expect(translations[lang].hero.title).toBeDefined();
        expect(translations[lang].hero.subtitle).toBeDefined();
        expect(translations[lang].hero.cta).toBeDefined();
      });
    });
  });

  describe('languageNames', () => {
    it('should have names for all languages', () => {
      expect(languageNames.de).toBe('Deutsch');
      expect(languageNames.en).toBe('English');
      expect(languageNames.fr).toBe('Français');
      expect(languageNames.es).toBe('Español');
    });
  });

  describe('languageFlags', () => {
    it('should have flags for all languages', () => {
      expect(languageFlags.de).toBe('🇩🇪');
      expect(languageFlags.en).toBe('🇬🇧');
      expect(languageFlags.fr).toBe('🇫🇷');
      expect(languageFlags.es).toBe('🇪🇸');
    });
  });

  describe('isValidLanguage', () => {
    it('should return true for valid languages', () => {
      expect(isValidLanguage('de')).toBe(true);
      expect(isValidLanguage('en')).toBe(true);
      expect(isValidLanguage('fr')).toBe(true);
      expect(isValidLanguage('es')).toBe(true);
    });

    it('should return false for invalid languages', () => {
      expect(isValidLanguage('it')).toBe(false);
      expect(isValidLanguage('pt')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
      expect(isValidLanguage('invalid')).toBe(false);
    });
  });

  describe('getLanguageFromCountry', () => {
    it('should return German for German-speaking countries', () => {
      expect(getLanguageFromCountry('DE')).toBe('de');
      expect(getLanguageFromCountry('AT')).toBe('de');
      expect(getLanguageFromCountry('CH')).toBe('de');
    });

    it('should return English for English-speaking countries', () => {
      expect(getLanguageFromCountry('US')).toBe('en');
      expect(getLanguageFromCountry('GB')).toBe('en');
      expect(getLanguageFromCountry('CA')).toBe('en');
      expect(getLanguageFromCountry('AU')).toBe('en');
    });

    it('should return French for French-speaking countries', () => {
      expect(getLanguageFromCountry('FR')).toBe('fr');
      expect(getLanguageFromCountry('BE')).toBe('fr');
      expect(getLanguageFromCountry('SN')).toBe('fr');
    });

    it('should return Spanish for Spanish-speaking countries', () => {
      expect(getLanguageFromCountry('ES')).toBe('es');
      expect(getLanguageFromCountry('MX')).toBe('es');
      expect(getLanguageFromCountry('AR')).toBe('es');
      expect(getLanguageFromCountry('CO')).toBe('es');
    });

    it('should return default language for unknown countries', () => {
      expect(getLanguageFromCountry('XX')).toBe(DEFAULT_LANGUAGE);
      expect(getLanguageFromCountry('ZZ')).toBe(DEFAULT_LANGUAGE);
    });

    it('should handle lowercase country codes', () => {
      expect(getLanguageFromCountry('de')).toBe('de');
      expect(getLanguageFromCountry('us')).toBe('en');
    });
  });

  describe('getTranslations', () => {
    it('should return correct translations for each language', () => {
      expect(getTranslations('de').hero.cta).toBe('Analysieren');
      expect(getTranslations('en').hero.cta).toBe('Analyze');
      expect(getTranslations('fr').hero.cta).toBe('Analyser');
      expect(getTranslations('es').hero.cta).toBe('Analizar');
    });

    it('should return default translations for invalid language', () => {
      // TypeScript would prevent this, but testing runtime behavior
      const result = getTranslations('invalid' as Language);
      expect(result).toBeDefined();
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    it('should be German', () => {
      expect(DEFAULT_LANGUAGE).toBe('de');
    });
  });
});
