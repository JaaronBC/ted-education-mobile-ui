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
      <Text style={styles.headerText}>Labs Snapshot</Text>
      <View style={styles.statusRow}>
        <Text style={styles.summaryText}>Thyroid State</Text>
        <Text style={styles.valueText}>{data.thyroidState}</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.summaryText}>Antibodies</Text>
        <Text style={styles.valueText}>{data.antibodyStatus}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.headerText}>Available Labs</Text>
      {data.availableLabs.map((lab) => (
        <View key={lab.testName} style={styles.row}>
          <Text style={styles.summaryText}>{lab.testName}</Text>
          <Text style={styles.valueText}>{lab.status}</Text>
        </View>
      ))}
      <View style={styles.divider} />
      <Text style={styles.footerText}>
        Open Labs to view full records and details.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xs,
  },
  headerText: {
    ...theme.typography.subtitle,
    marginTop: theme.spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  valueText: {
    ...theme.typography.body,
    color: theme.colors.primaryBlue,
    textAlign: "right",
    flexShrink: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  summaryText: {
    ...theme.typography.body,
  },
  footerText: {
    ...theme.typography.caption,
  },
});
