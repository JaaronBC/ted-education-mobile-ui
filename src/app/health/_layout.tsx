import { Text, View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Slot, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppCard from "@/components/ui/app-card";
import { theme } from "@/constants/theme";
import SectionHeader from "@/components/ui/section-header";
import { healthCategories } from "@/constants/health/health-categories";

export default function HealthLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navContainer}>
          <SectionHeader title="My Health" BackButton backRoute="/health" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {healthCategories.map((category) => (
              <Pressable
                key={category.title}
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

        <View style={styles.content}>
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
