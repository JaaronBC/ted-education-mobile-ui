import { Text, View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, router, type Href } from "expo-router";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import { theme } from "@/constants/theme";
import SectionHeader from "@/components/ui/section-header";

const healthSections: {
  title: string;
  route: Href;
}[] = [
  { title: "Labs", route: "/health/labs" },
  { title: "Imaging", route: "/health/imaging" },
  { title: "Medications", route: "/health/medications" },
  { title: "Treatments", route: "/health/treatments" },
  { title: "Records", route: "/health/records" },
];

export default function HealthLayout() {
  return (
    <ScreenContainer>
      <View>
        <SectionHeader title="My Health" BackButton backRoute="/health" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.md }}
        >
          {healthSections.map((section) => (
            <Pressable
              key={section.title}
              onPress={() => router.push(section.route)}
              style={styles.card}
            >
              <AppCard style={styles.tab}>
                <Text style={styles.tabTitle}>{section.title}</Text>
              </AppCard>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: theme.spacing.md,
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
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
