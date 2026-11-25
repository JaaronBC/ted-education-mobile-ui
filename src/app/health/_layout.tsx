import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { Text, View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Slot, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppCard from "@/components/ui/app-card";
import { theme } from "@/constants/theme";
import SectionHeader from "@/components/ui/section-header";
import { healthCategories } from "@/features/health/constants/health-categories";

import { useSession } from '@/contexts/SessionContext';
import { sessionGeneration } from '@/services/sessionTokens';

export default function HealthLayout() {
  const { tr: tr10 } = useLocale10();

  const { user } = useSession();

  const healthSessionKey =
    (user?.id ?? 'guest') + ':' + sessionGeneration();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navContainer}>
          <SectionHeader title={tr10("My Health")} BackButton backRoute="/health" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {healthCategories.map((category) => (
              <Pressable accessibilityRole="button"
                key={category.id}
                onPress={() => router.push(category.route)}
                style={styles.card}
              >
                <AppCard style={styles.tab}>
                  <Text style={styles.tabTitle}>{category.title}</Text>
                </AppCard>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Text
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            color: theme.colors.secondaryText,
            fontSize: 13,
          }}
        >{tr10("Demo data only. Do not enter real patient information. Changes are not saved to your account.")} </Text>

        <View
          key={healthSessionKey}
          style={styles.content}
        >
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  navContainer: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.xs,
  },
  tabsContainer: {
    paddingVertical: theme.spacing.xs,
  },
  tab: {
    marginRight: theme.spacing.xs,
  },
  tabTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.xs,
  },
  card: {
    marginBottom: theme.spacing.sm,
  },
});
