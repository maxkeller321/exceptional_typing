import { derived, get } from 'svelte/store';
import { locale } from '../stores/settings';
import { en, type TranslationKey } from './en';
import { de } from './de';
import type { Locale } from '../types';

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  de,
};

// Get translation function
export function t(key: TranslationKey, params?: Record<string, string>): string {
  const currentLocale = get(locale);
  let text = translations[currentLocale]?.[key] || translations.en[key] || key;

  // Replace placeholders like {key} with values from params
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
    }
  }

  return text;
}

// Reactive translation store
export const i18n = derived(locale, ($locale) => {
  return (key: TranslationKey, params?: Record<string, string>): string => {
    let text = translations[$locale]?.[key] || translations.en[key] || key;

    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
      }
    }

    return text;
  };
});

// Export types
export type { TranslationKey };

// Get all available locales
export const availableLocales: { id: Locale; name: string }[] = [
  { id: 'en', name: 'English' },
  { id: 'de', name: 'Deutsch' },
];
