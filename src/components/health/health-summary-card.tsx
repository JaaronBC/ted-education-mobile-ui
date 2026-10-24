import { View, Text, Image, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import type { HealthSummaryData } from "@/constants/health/health-summaries";

type SummaryContentProps = {
  data: HealthSummaryData;
};
/*
Data will be passed with a type property that determines 
how the summary is rendered. The summaryRenderers object maps 
the type to the corresponding component for rendering.
*/

// Define a component for rendering text summaries
function LabsSummary({ data }: SummaryContentProps) {
  if (data.type !== "labsSummary") return null;

  return (
    <View style={styles.content}>
      <Text style={styles.headerText}>Clinical Activity Score (CAS)</Text>
      <Text style={styles.title}>
        {data.casScore}/7
        <Text style={styles.summaryText}> Latest Assessment</Text>
      </Text>{" "}
      <Text style={styles.summaryText}>
        Your CAS increased by {data.increased} since your last assessment
      </Text>
    </View>
  );
}
// Define a component for most recent image logs with older comparison images
function ImagingSummary({ data }: SummaryContentProps) {
  if (data.type !== "imagingSummary") return null;

  return (
    <View style={styles.content}>
      <View style={styles.imageComparisonRow}>
        {data.images.map((image, index) => (
          <View key={`${image.date}-${index}`} style={styles.comparisonItem}>
            <Image
              source={{ uri: image.uri }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />
            <Text style={styles.imageDate}>{image.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function MedicationSummary({ data }: SummaryContentProps) {
  if (data.type !== "medicationSummary") return null;

  return (
    <View style={styles.content}>
      {/* Table header */}
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.headerText}>Active Medication</Text>
        <Text style={[styles.headerText, styles.rightColumn]}>Next Dose</Text>
      </View>

      {/* Table rows */}
      {data.medications.map((medication) => (
        <View key={medication.id} style={styles.tableRow}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={[styles.doseText, styles.rightColumn]}>
            {medication.nextDoseDate}
          </Text>
        </View>
      ))}
    </View>
  );
}

const summaryRenderers = {
  labsSummary: LabsSummary,
  imagingSummary: ImagingSummary,
  medicationSummary: MedicationSummary,
};
// Main component for rendering health summary cards
export default function HealthSummaryCard({
  data,
}: {
  data: HealthSummaryData;
}) {
  const Content = summaryRenderers[data.type];

  return (
    <View style={styles.card}>
      <Content data={data} />
    </View>
  );
}
// Define styles for the HealthSummaryCard component
const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: theme.spacing.sm,
    backgroundColor: "transparent",
    paddingTop: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.primaryText,
  },
  summaryText: {
    ...theme.typography.body,
  },
  content: {
    gap: theme.spacing.xs,
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
  headerText: {
    flex: 1,
    ...theme.typography.subtitle,
  },
  rightColumn: {
    textAlign: "right",
  },
  medicationName: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  doseText: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  description: {
    ...theme.typography.subheading,
    color: theme.colors.primaryText,
    paddingVertical: theme.spacing.sm,
  },

  // Styles for individual comparison items for the imaging summary
  imageComparisonRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  comparisonItem: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  comparisonImage: {
    width: "100%",
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  imageDate: {
    ...theme.typography.body,
  },
});
