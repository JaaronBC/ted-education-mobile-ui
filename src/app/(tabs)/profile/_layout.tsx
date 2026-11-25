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
      <Stack.Screen name="security" options={{ title: t("Two-factor authentication") }} />
      <Stack.Screen name="change-email" options={{ title: t("Change Email") }} />
      <Stack.Screen name="connected-accounts" options={{ title: t("Connected Accounts") }} />
      <Stack.Screen name="devices" options={{ title: t("Devices & Sessions") }} />
      <Stack.Screen name="security-activity" options={{ title: t("Security Activity") }} />
      <Stack.Screen name="change-password" options={{ title: t("Change Password") }} />
      <Stack.Screen name="language" options={{ title: t('Language') }} />
      <Stack.Screen name="accessibility" options={{ title: t('Accessibility') }} />
      <Stack.Screen name="data" options={{ title: t('Data Management') }} />
      <Stack.Screen name="privacy" options={{ title: t('Privacy') }} />
      <Stack.Screen name="support" options={{ title: t("Help & Support") }} />
      <Stack.Screen name="about" options={{ title: t('About') }} />
    </Stack>
  );
}
