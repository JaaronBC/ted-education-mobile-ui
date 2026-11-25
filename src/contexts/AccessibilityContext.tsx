
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AccessibilityInfo,
} from 'react-native';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { useSession } from './SessionContext';
import { sessionGeneration } from '../services/sessionTokens';

const STORAGE_KEY = '@ted/accessibility/v1';

interface AccessibilityPreferences {
  fontScale: number;
  highContrast: boolean;
}

type SaveStatus =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'error';

interface AccessibilityContextValue
  extends AccessibilityPreferences {

  ready: boolean;
  reduceMotion: boolean;
  saveStatus: SaveStatus;

  setFontScale: (value: number) => void;
  setHighContrast: (value: boolean) => void;
  resetPreferences: () => void;
  retrySave: () => void;
}

type Draft = AccessibilityPreferences & {
  scope: string;
  revision: number;
};

type SaveResult = {
  scope: string;
  revision: number;
  status: 'saved' | 'error';
};

const DEFAULTS: AccessibilityPreferences = {
  fontScale: 1,
  highContrast: false,
};

const AccessibilityContext =
  createContext<AccessibilityContextValue | undefined>(
    undefined,
  );

function clampScale(value: number): number {
  if (!Number.isFinite(value)) return 1;

  return Math.round(
    Math.min(2, Math.max(1, value)) * 20,
  ) / 20;
}

export function AccessibilityProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    loading,
    updateAccountProfile,
  } = useSession();

  const epoch = sessionGeneration();
  const owner = user?.id ?? null;
  const completed = Boolean(user?.onboardingCompletedAt);
  const scope = (owner ?? 'guest') + ':' + epoch;

  const [stored, setStored] =
    useState<AccessibilityPreferences>(DEFAULTS);

  const [loaded, setLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [draft, setDraft] =
    useState<Draft | null>(null);

  const [result, setResult] =
    useState<SaveResult | null>(null);

  const draftRef = useRef<Draft | null>(null);
  const revision = useRef(0);

  const guestQueue =
    useRef<Promise<void>>(Promise.resolve());

  const updateRef = useRef(updateAccountProfile);

  useEffect(() => {
    updateRef.current = updateAccountProfile;
  }, [updateAccountProfile]);

  const defaults: AccessibilityPreferences = user
    ? {
        fontScale: clampScale(user.fontScale),
        highContrast: Boolean(user.highContrast),
      }
    : stored;

  const activeDraft =
    draft?.scope === scope ? draft : null;

  const current = activeDraft ?? defaults;

  const ready =
    !loading && (owner !== null || loaded);

  const saveStatus: SaveStatus = activeDraft
    ? result?.scope === scope &&
      result.revision === activeDraft.revision &&
      result.status === 'error'
        ? 'error'
        : owner && !completed
          ? 'idle'
          : 'saving'
    : result?.scope === scope &&
      result.status === 'saved'
        ? 'saved'
        : 'idle';

  // Read guest preferences only.
  // Account preferences come from the server.

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!active || !raw) return;

        const parsed = JSON.parse(raw);

        if (!parsed || typeof parsed !== 'object') {
          return;
        }

        setStored({
          fontScale:
            typeof parsed.fontScale === 'number'
              ? clampScale(parsed.fontScale)
              : 1,

          highContrast:
            typeof parsed.highContrast === 'boolean'
              ? parsed.highContrast
              : false,
        });
      })
      .catch(() => {
        console.warn(
          'Unable to load accessibility preferences.',
        );
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Respect the device Reduce Motion preference.

  useEffect(() => {
    let active = true;
    let changed = false;

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      enabled => {
        changed = true;

        if (active) {
          setReduceMotion(enabled);
        }
      },
    );

    void AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => {
        if (active && !changed) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const changePreferences = useCallback(
    (patch: Partial<AccessibilityPreferences>) => {
      if (
        !ready ||
        epoch !== sessionGeneration()
      ) return;

      const previous =
        draftRef.current?.scope === scope
          ? draftRef.current
          : {
              fontScale: defaults.fontScale,
              highContrast: defaults.highContrast,
            };

      const next: Draft = {
        scope,
        revision: ++revision.current,

        fontScale: clampScale(
          patch.fontScale ?? previous.fontScale,
        ),

        highContrast:
          patch.highContrast ?? previous.highContrast,
      };

      draftRef.current = next;
      setDraft(next);
      setResult(null);
    },
    [
      ready,
      scope,
      epoch,
      defaults.fontScale,
      defaults.highContrast,
    ],
  );

  const setFontScale = useCallback(
    (value: number) => {
      changePreferences({
        fontScale: value,
      });
    },
    [changePreferences],
  );

  const setHighContrast = useCallback(
    (value: boolean) => {
      changePreferences({
        highContrast: value,
      });
    },
    [changePreferences],
  );

  const resetPreferences = useCallback(
    () => changePreferences(DEFAULTS),
    [changePreferences],
  );

  const retrySave = useCallback(() => {
    const currentDraft = draftRef.current;

    if (currentDraft?.scope !== scope) return;

    changePreferences({
      fontScale: currentDraft.fontScale,
      highContrast: currentDraft.highContrast,
    });
  }, [scope, changePreferences]);

  // Debounce changes to avoid sending a request
  // every time the user presses a size button.

  useEffect(() => {
    if (!ready || !draft) return;

    if (draft.scope !== scope) {
      if (draftRef.current?.revision === draft.revision) {
        draftRef.current = null;
        setDraft(null);
      }

      return;
    }

    // The setup flow saves its preferences explicitly.
    if (owner && !completed) return;

    let active = true;

    const draftRevision = draft.revision;
    const timer = setTimeout(() => {
      const preferences = {
        fontScale: draft.fontScale,
        highContrast: draft.highContrast,
      };

      function isCurrent(): boolean {
        return (
          active &&
          epoch === sessionGeneration() &&
          draftRef.current?.scope === scope &&
          draftRef.current.revision === draftRevision
        );
      }

      if (!isCurrent()) return;

      async function persist() {
        try {
          if (owner) {
            // SessionContext already serializes
            // account profile mutations.
            await updateRef.current(preferences);

          } else {
            const task = guestQueue.current.then(
              async () => {
                if (!isCurrent()) return;

                await AsyncStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify(preferences),
                );

                setStored(preferences);
              },
            );

            guestQueue.current =
              task.catch(() => undefined);

            await task;
          }

          if (!isCurrent()) return;

          draftRef.current = null;

          setResult({
            scope,
            revision: draftRevision,
            status: 'saved',
          });

          setDraft(previous =>
            previous?.revision === draftRevision
              ? null
              : previous,
          );

        } catch {
          if (!isCurrent()) return;

          setResult({
            scope,
            revision: draftRevision,
            status: 'error',
          });
        }
      }

      void persist();
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    ready,
    owner,
    completed,
    scope,
    epoch,
    draft,
  ]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale: current.fontScale,
        highContrast: current.highContrast,
        ready,
        reduceMotion,
        saveStatus,
        setFontScale,
        setHighContrast,
        resetPreferences,
        retrySave,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      'AccessibilityProvider is required',
    );
  }

  return context;
}
