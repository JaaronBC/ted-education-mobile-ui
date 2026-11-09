import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

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
  const [fontScale, updateFontScale] = useState(1);
  const [highContrast, updateHighContrast] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed: Partial<AccessibilityPreferences> = JSON.parse(raw);
        if (typeof parsed.fontScale === 'number') updateFontScale(clampScale(parsed.fontScale));
        if (typeof parsed.highContrast === 'boolean') updateHighContrast(parsed.highContrast);
      })
      .catch((error: unknown) => console.warn('Unable to load accessibility preferences', error))
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ fontScale, highContrast }))
      .catch((error: unknown) => console.warn('Unable to save accessibility preferences', error));
  }, [fontScale, highContrast, loaded]);

  return (
    <AccessibilityContext.Provider value={{
      fontScale, highContrast,
      setFontScale: (value) => updateFontScale(clampScale(value)),
      setHighContrast: updateHighContrast,
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
