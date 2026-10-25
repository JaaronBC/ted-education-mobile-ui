import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import type { HealthSummaryData } from "@/constants/health/health-summaries";

type SummaryContentProps = {
  data: HealthSummaryData;
};

export default function LabsSummary({ data }: SummaryContentProps) {
  if (data.type !== "labsSummary") return null;

  return (
    <View style={styles.content}>
      <Text style={styles.headerText}>Clinical Activity Score (CAS)</Text>
      <Text style={styles.casText}>
        {data.casScore}/7{"  "}
        <Text style={styles.summaryText}>Latest Assessment</Text>
      </Text>
      <View style={styles.summaryDivider} />
      <Text style={styles.footerText}>Assessed: {data.dateAssessed}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  //general card styles
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  // Text styles
  casText: {
    ...theme.typography.title,
    color: theme.colors.primaryText,
  },
  summaryText: {
    ...theme.typography.body,
  },
  content: {
    gap: theme.spacing.xs,
  },
  footerText: {
    ...theme.typography.subheading,
  },
  headerText: {
    flex: 1,
    ...theme.typography.subtitle,
  },
});
