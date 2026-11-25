
import en from './locales/en';
import zh from './locales/zh';
import ja from './locales/ja';
import ko from './locales/ko';
import es from './locales/es';

import type {
  Language,
  TranslationKey,
} from './types';

const messages: Record<
  Language,
  Record<TranslationKey, string>
> = {
  en,
  zh,
  ja,
  ko,
  es,
};

export function normalizeLanguage(
  value?: string | null,
): Language {
  const code = (value ?? '').toLowerCase();

  if (code === 'zh' || code.startsWith('zh-')) return 'zh';
  if (code === 'ja' || code === 'jp' || code.startsWith('ja-')) return 'ja';
  if (code === 'ko' || code === 'kr' || code.startsWith('ko-')) return 'ko';
  if (code === 'es' || code.startsWith('es-')) return 'es';

  return 'en';
}

export function hasTranslation(
  key: string,
): key is TranslationKey {
  return Object.prototype.hasOwnProperty.call(en, key);
}

export function translateKey(
  language: Language,
  key: TranslationKey,
): string {
  return messages[language][key];
}

// Compatibility with existing dynamic text labels.
// Unknown values are not treated as translated.
export function translate(
  language: Language,
  key: string,
): string {
  return hasTranslation(key)
    ? translateKey(language, key)
    : key;
}
