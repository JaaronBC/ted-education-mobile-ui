import { Pressable, StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import {
  countReportedMeasurements,
  formatCollectionDate,
  labMeasurementDefinitions,
  type LabReport,
} from "@/constants/health/lab-measurements";
import { theme } from "@/constants/theme";
import LabResultRow from "./lab-result-row";

type LabHistoryCardProps = {
  report: LabReport;
  expanded: boolean;
  onToggle: () => void;
};

export default function LabHistoryCard({
  report,
  expanded,
  onToggle,
}: LabHistoryCardProps) {
  const availableCount = countReportedMeasurements(report);

  return (
    <AppCard style={styles.card}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <Text style={styles.collectionDate}>
            {formatCollectionDate(report.collectedAt)}
          </Text>
          <Text style={styles.pdfBadge}>PDF linked</Text>
        </View>

        <Text style={styles.fileName}>{report.pdfFileName}</Text>
        <Text
          style={styles.summaryText}
        >{`${availableCount} of 7 measurements reported`}</Text>
        <Text style={styles.expandText}>
          {expanded ? "Hide details" : "View details"}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          {labMeasurementDefinitions.map((measurement) => (
            <LabResultRow
              key={`${report.id}-${measurement.id}`}
              measurementId={measurement.id}
              measurementName={measurement.name}
              result={report.measurements[measurement.id]}
              showReferenceRange
            />
          ))}
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.sm,
  },
  header: {
    gap: theme.spacing.xs,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  collectionDate: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  pdfBadge: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.lightBlue,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    overflow: "hidden",
  },
  fileName: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  summaryText: {
    ...theme.typography.caption,
  },
  expandText: {
    ...theme.typography.caption,
    color: theme.colors.darkBlue,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
});
