
import type en from './locales/en';

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'es';

export type TranslationKey = keyof typeof en;
