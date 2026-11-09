import { Stack } from "expo-router";
import { theme } from "../../../constants/theme";
import { useAccessibility } from "../../../contexts/AccessibilityContext";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function ProfileLayout() {
  const { fontScale, highContrast } = useAccessibility();
  const { t } = useLanguage();
  return (
    <Stack screenOptions={{
      contentStyle: { backgroundColor: highContrast ? "#FFFFFF" : theme.colors.surface },
      headerTintColor: theme.colors.darkBlue,
      headerStyle: { backgroundColor: theme.colors.background },
      headerShadowVisible: false,
      headerTitleStyle: { color: theme.colors.primaryText, fontSize: 19 * fontScale, fontWeight: "700" },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="personal" options={{ title: t('Personal Information') }} />
      <Stack.Screen name="security" options={{ title: t('Account Security') }} />
      <Stack.Screen name="language" options={{ title: t('Language') }} />
      <Stack.Screen name="accessibility" options={{ title: t('Accessibility') }} />
      <Stack.Screen name="data" options={{ title: t('Data Management') }} />
      <Stack.Screen name="privacy" options={{ title: t('Privacy') }} />
      <Stack.Screen name="about" options={{ title: t('About') }} />
    </Stack>
  );
}
