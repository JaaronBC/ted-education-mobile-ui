import { Stack } from "expo-router";
import { theme } from "../../../constants/theme";
import { useAccessibility } from "../../../contexts/AccessibilityContext";

export default function ProfileLayout() {
  const { fontScale, highContrast } = useAccessibility();
  return (
    <Stack screenOptions={{
      contentStyle: { backgroundColor: highContrast ? "#FFFFFF" : theme.colors.surface },
      headerTintColor: theme.colors.darkBlue,
      headerStyle: { backgroundColor: theme.colors.background },
      headerShadowVisible: false,
      headerTitleStyle: { color: theme.colors.primaryText, fontSize: 19 * fontScale, fontWeight: "700" },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="personal" options={{ title: "Personal Information" }} />
      <Stack.Screen name="language" options={{ title: "Language" }} />
      <Stack.Screen name="accessibility" options={{ title: "Accessibility" }} />
      <Stack.Screen name="data" options={{ title: "Data Management" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
    </Stack>
  );
}
