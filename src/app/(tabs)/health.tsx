import { StyleSheet, ScrollView } from "react-native";
import ScreenContainer from "@/components/ui/screen-container";
import SectionHeader from "@/components/ui/section-header";
import HealthCategoryCard from "@/components/health/health-category-card";
import HealthSummaryCard from "@/components/health/health-summary-card";
import { healthCategories } from "@/constants/health/health-categories";
import { theme } from "@/constants/theme";

export default function HealthScreen() {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeader title="My Health" BackButton />

        {healthCategories.map((category) => {
          const summary = category.summary;

          return (
            <HealthCategoryCard
              key={category.title}
              title={category.title}
              description={category.description}
              icon={category.icon}
              route={category.route}
            >
              {summary ? <HealthSummaryCard data={summary} /> : null}
            </HealthCategoryCard>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
});
