import i18n from 'i18next';
import { getLocales } from 'expo-localization';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import { APP_LANGUAGES, type AppLanguage } from '@/data/schema';

export const resources = { pt: { translation: pt }, en: { translation: en }, es: { translation: es } };

/** Native names, so each option is readable regardless of the current language. */
export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
};

const isAppLanguage = (code: string | null | undefined): code is AppLanguage =>
  !!code && (APP_LANGUAGES as readonly string[]).includes(code);

export function detectDeviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode;
  return isAppLanguage(code) ? code : 'pt';
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
});

export default i18n;
