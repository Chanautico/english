import type { AppLanguage, LocalizedText } from '@/data/schema';

/** Picks the text for the interface language, falling back to Portuguese. */
export function localize(text: LocalizedText | undefined, language: AppLanguage): string {
  if (!text) return '';
  return text[language] ?? text.pt;
}
