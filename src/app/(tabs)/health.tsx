import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { StyleSheet, ScrollView, Text } from "react-native";
import ScreenContainer from "@/components/ui/screen-container";
import SectionHeader from "@/components/ui/section-header";
import HealthCategoryCard from "@/features/health/components/health-category-card";
import HealthSummaryCard from "@/features/health/components/health-summary-card";
import { healthCategories } from "@/features/health/constants/health-categories";
import { theme } from "@/constants/theme";

export default function HealthScreen() {
  const { tr: tr10 } = useLocale10();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeader title={tr10("My Health")} BackButton />

        <Text style={{
          color: theme.colors.secondaryText,
          fontSize: 13,
          lineHeight: 20,
        }}>{tr10("Development preview with sample health data. Do not enter real patient information.")} </Text>

        {healthCategories.map((category) => {
          const summary = category.summary;

          return (
            <HealthCategoryCard
              key={category.id}
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
