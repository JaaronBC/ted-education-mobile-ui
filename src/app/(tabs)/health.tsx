import { Text, View, StyleSheet, ScrollView, Pressable } from "react-native";
import AppButton from "@/components/ui/app-button";
import { router, type Href } from "expo-router";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import { theme } from "@/constants/theme";

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

export default function HealthScreen() {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>My Health</Text>

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
  content: {
    flex: 1,
  },

  title: {
    marginTop: theme.spacing.xxl,
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

  cardTitle: {
    ...theme.typography.heading,
    marginBottom: theme.spacing.xs,
  },

  cardSubtitle: {
    ...theme.typography.subheading,
  },

  buttonContainer: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },

  card: {
    marginBottom: theme.spacing.sm,
  },
});
