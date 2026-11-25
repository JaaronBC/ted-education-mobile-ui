
import type { Language } from './types';
import { translate } from './translations';

const locales: Record<Language, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  es: 'es-ES',
};

export function localeFor(language: Language): string {
  return locales[language];
}

export function formatDateTime(
  language: Language,
  value?: string | null,
): string {
  const date = value ? new Date(value) : null;

  if (!date || !Number.isFinite(date.getTime())) {
    return translate(language, 'Date unavailable');
  }

  return date.toLocaleString(localeFor(language));
}

export function formatNumber(
  language: Language,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(
    localeFor(language),
    options,
  ).format(value);
}
