import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import type { HealthSummaryData } from "@/constants/health/health-summaries";

type SummaryContentProps = {
  data: HealthSummaryData;
};
export default function MedicationSummary({ data }: SummaryContentProps) {
  if (data.type !== "medicationSummary") return null;

  return (
    <View>
      {/* Table header */}
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.headerText}>Active Medication</Text>
        <Text style={[styles.headerText, styles.rightColumn]}>Next Dose</Text>
      </View>

      {/* Table rows */}
      {data.medications.map((medication) => (
        <View key={medication.id} style={styles.tableRow}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={[styles.summaryText, styles.rightColumn]}>
            {medication.nextDoseDate}
          </Text>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  summaryText: {
    ...theme.typography.body,
  },
  headerText: {
    flex: 1,
    ...theme.typography.subtitle,
  },

  // Styles for the medication table
  tableHeader: {
    flexDirection: "row",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rightColumn: {
    textAlign: "right",
  },
  medicationName: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
});
