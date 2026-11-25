
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { useSession } from '../contexts/SessionContext';
import { sessionGeneration } from '../services/sessionTokens';

import type {
  Language,
  TranslationKey,
} from './types';

import {
  normalizeLanguage,
  translate,
  translateKey,
} from './translations';

export type { Language, TranslationKey } from './types';

export const LANGUAGES: {
  code: Language;
  name: string;
}[] = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
];

const STORAGE_KEY = '@ted/language/v1';

type Selection = {
  scope: string;
  language: Language;
  revision: number;
};

type ContextValue = {
  language: Language;
  setLanguage: (next: Language) => Promise<void>;
  t: (key: string) => string;
  tr: (key: TranslationKey) => string;
};

const Context = createContext<ContextValue | null>(null);

export function LanguageProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    updateAccountProfile,
  } = useSession();

  const epoch = sessionGeneration();

  const scope =
    (user?.id ?? 'guest') + ':' + epoch;

  const owner = user?.id ?? null;
  const completed = Boolean(user?.onboardingCompletedAt);

  const [deviceLanguage, setDeviceLanguage] =
    useState<Language>('en');

  const [pending, setPending] =
    useState<Selection | null>(null);

  const [onboardingSelection, setOnboardingSelection] =
    useState<Selection | null>(null);

  const revision = useRef(0);
  const guestRevision = useRef(0);

  const guestQueue =
    useRef<Promise<void>>(Promise.resolve());

  const language = pending?.scope === scope
    ? pending.language
    : user && completed
      ? normalizeLanguage(user.preferredLanguage)
      : user && onboardingSelection?.scope === scope
        ? onboardingSelection.language
        : deviceLanguage;

  useEffect(() => {
    let active = true;

    const initialRevision = guestRevision.current;

    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (
          active &&
          value &&
          initialRevision === guestRevision.current
        ) {
          setDeviceLanguage(normalizeLanguage(value));
        }
      })
      .catch(() => {
        // English remains the initial fallback.
      });

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback(
    async (next: Language): Promise<void> => {
      if (
        epoch !== sessionGeneration() ||
        normalizeLanguage(next) !== next
      ) {
        throw new Error('Session changed. Please try again.');
      }

      const operation = ++revision.current;

      if (!owner) {
        guestRevision.current++;
        setDeviceLanguage(next);

        const task = guestQueue.current.then(async () => {
          if (epoch !== sessionGeneration()) {
            return;
          }

          await AsyncStorage.setItem(STORAGE_KEY, next);
        });

        guestQueue.current = task.catch(() => undefined);

        await task;
        return;
      }

      const selection = {
        scope,
        language: next,
        revision: operation,
      };

      setPending(selection);

      try {
        // SessionContext already serializes profile mutations.
        // Do not skip a write based on a stale account snapshot.
        await updateAccountProfile({
          preferredLanguage: next,
        });

        if (epoch !== sessionGeneration()) {
          return;
        }

        if (!completed) {
          setOnboardingSelection(selection);
        }

      } finally {
        setPending(current =>
          current?.scope === scope &&
          current.revision === operation
            ? null
            : current
        );
      }
    },
    [
      owner,
      scope,
      epoch,
      completed,
      updateAccountProfile,
    ],
  );

  const t = useCallback(
    (key: string) => translate(language, key),
    [language],
  );

  const tr = useCallback(
    (key: TranslationKey) => translateKey(language, key),
    [language],
  );

  return (
    <Context.Provider value={{
      language,
      setLanguage,
      t,
      tr,
    }}>
      {children}
    </Context.Provider>
  );
}

export function useLanguage() {
  const context = useContext(Context);

  if (!context) {
    throw new Error('LanguageProvider missing');
  }

  return context;
}
