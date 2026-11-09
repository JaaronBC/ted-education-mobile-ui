import '../../global.css';
import { Stack } from 'expo-router';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { SessionProvider } from '../contexts/SessionContext';
import { LanguageProvider } from '../i18n/LanguageContext';

export default function RootLayout() {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AccessibilityProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
