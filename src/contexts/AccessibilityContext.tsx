import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useSession } from './SessionContext';

const STORAGE_KEY = '@ted/accessibility/v1';

interface AccessibilityPreferences {
  fontScale: number;
  highContrast: boolean;
}

interface AccessibilityContextValue extends AccessibilityPreferences {
  setFontScale: (value: number) => void;
  setHighContrast: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

function clampScale(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.round(Math.min(2, Math.max(1, value)) * 20) / 20;
}

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const { user, updateAccountProfile } = useSession();
  const [stored, setStored] = useState<AccessibilityPreferences>({
    fontScale: 1,
    highContrast: false,
  });

  const [draft, setDraft] = useState<
    (AccessibilityPreferences & { owner: string | null }) | null
  >(null);

  const [loaded, setLoaded] = useState(false);

  const owner = user?.id ?? null;

  const defaults: AccessibilityPreferences = user
    ? {
        fontScale: clampScale(user.fontScale),
        highContrast: user.highContrast,
      }
    : stored;

  const current = draft?.owner === owner ? draft : defaults;
  const { fontScale, highContrast } = current;

  const setFontScale = (value: number) => {
    setDraft(previous => ({
      ...(previous?.owner === owner ? previous : defaults),
      owner,
      fontScale: clampScale(value),
    }));
  };

  const setHighContrast = (value: boolean) => {
    setDraft(previous => ({
      ...(previous?.owner === owner ? previous : defaults),
      owner,
      highContrast: value,
    }));
  };

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed: Partial<AccessibilityPreferences> = JSON.parse(raw);
        setStored(previous => ({
          fontScale: typeof parsed.fontScale === 'number'
            ? clampScale(parsed.fontScale)
            : previous.fontScale,
          highContrast: typeof parsed.highContrast === 'boolean'
            ? parsed.highContrast
            : previous.highContrast,
        }));
      })
      .catch((error: unknown) => console.warn('Unable to load accessibility preferences', error))
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  const userId = user?.id;
  const cloudScale = user?.fontScale;
  const cloudContrast = user?.highContrast;
  const onboardingComplete = Boolean(user?.onboardingCompletedAt);

  useEffect(() => {
    if (!loaded || !userId || !onboardingComplete ||
        draft?.owner !== userId) return;

    if (
      typeof cloudScale === 'number' &&
      Math.abs(cloudScale - draft.fontScale) < 0.025 &&
      cloudContrast === draft.highContrast
    ) return;

    const timer = setTimeout(() => {
      void updateAccountProfile({
        fontScale: draft.fontScale,
        highContrast: draft.highContrast,
      }).catch(error =>
        console.warn('Preference sync failed', error)
      );
    }, 800);

    return () => clearTimeout(timer);
  }, [
    loaded, userId, onboardingComplete, cloudScale,
    cloudContrast, draft, updateAccountProfile
  ]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ fontScale, highContrast }))
      .catch((error: unknown) => console.warn('Unable to save accessibility preferences', error));
  }, [fontScale, highContrast, loaded]);

  return (
    <AccessibilityContext.Provider value={{
      fontScale, highContrast,
      setFontScale,
      setHighContrast,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('AccessibilityProvider is required');
  return context;
}
