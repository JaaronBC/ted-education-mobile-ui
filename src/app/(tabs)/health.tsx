import { StyleSheet, ScrollView } from "react-native";
import ScreenContainer from "@/components/ui/screen-container";
import SectionHeader from "@/components/ui/section-header";
import HealthCategoryCard from "@/components/health/health-category-card";
import HealthSummaryCard from "@/components/health/health-summary-card";
import type { HealthSummaryData } from "@/constants/health/health-summaries";
import { type Href } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { dummyHealthDashboard } from "@/mockdata/health-dashboard-data";
import { theme } from "@/constants/theme";
import {
  FlaskConical,
  Scan,
  Pill,
  ClipboardList,
  FileText,
} from "lucide-react-native";

const healthCategories: {
  title: string;
  description: string;
  icon: LucideIcon;
  route: Href;
  summary?: HealthSummaryData;
}[] = [
  {
    title: "Labs",
    description: "Review your laboratory results",
    icon: FlaskConical,
    route: "/health/labs",
    summary: dummyHealthDashboard.labs,
  },
  {
    title: "Imaging",
    description: "View your imaging reports",
    icon: Scan,
    route: "/health/imaging",
    summary: dummyHealthDashboard.imaging,
  },
  {
    title: "Medications",
    description: "Review your medications",
    icon: Pill,
    route: "/health/medications",
    summary: dummyHealthDashboard.medications,
  },
  {
    title: "Treatment History",
    description: "Review previous and ongoing treatments.",
    icon: ClipboardList,
    route: "/health/treatments",
    summary: dummyHealthDashboard.treatments,
  },
  {
    title: "Medical Records",
    description: "Access your medical documents",
    icon: FileText,
    route: "/health/records",
    summary: dummyHealthDashboard.records,
  },
];

export default function HealthScreen() {
  // Using the dummyHealthDashboard data to populate the summary cards
  const summary = dummyHealthDashboard;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <SectionHeader title="My Health" />

        {healthCategories.map((category) => (
          <HealthCategoryCard
            key={category.title}
            title={category.title}
            description={category.description}
            icon={category.icon}
            route={category.route}
          >
            {category.summary ? (
              <HealthSummaryCard data={category.summary} />
            ) : null}
          </HealthCategoryCard>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
