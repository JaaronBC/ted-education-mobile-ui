import '../../global.css';
import { Stack } from 'expo-router';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { SessionProvider } from '../contexts/SessionContext';

export default function RootLayout() {
  return (
    <SessionProvider>
      <AccessibilityProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AccessibilityProvider>
    </SessionProvider>
  );
}
