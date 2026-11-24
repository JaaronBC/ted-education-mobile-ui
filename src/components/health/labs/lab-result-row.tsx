import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatReferenceRange,
  getRangeStatus,
  getRangeStatusLabel,
  type LabMeasurementId,
  type LabMeasurementResult,
} from "@/constants/health/lab-measurements";
import { theme } from "@/constants/theme";

type LabResultRowProps = {
  measurementId: LabMeasurementId;
  measurementName: string;
  result: LabMeasurementResult | null;
  showReferenceRange?: boolean;
  selected?: boolean;
  onPress?: (measurementId: LabMeasurementId) => void;
};

export default function LabResultRow({
  measurementId,
  measurementName,
  result,
  showReferenceRange = false,
  selected = false,
  onPress,
}: LabResultRowProps) {
  const status = getRangeStatus(result);
  const statusLabel = getRangeStatusLabel(status);

  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={[styles.row, selected && styles.selectedRow]}
      {...(onPress
        ? {
            accessibilityRole: "button" as const,
            onPress: () => onPress(measurementId),
          }
        : {})}
    >
      <View style={styles.leftColumn}>
        <Text style={styles.measurementName}>{measurementName}</Text>
        {showReferenceRange && (
          <Text style={styles.referenceRange}>
            Reference:{" "}
            {result
              ? formatReferenceRange(result.referenceRange)
              : "Not reported"}
          </Text>
        )}
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.valueText}>
          {result ? `${result.value} ${result.unit}` : "Not reported"}
        </Text>
        <Text style={[styles.statusText, statusStyles[status]]}>
          {statusLabel}
        </Text>
      </View>
    </Container>
  );
}

const statusStyles = StyleSheet.create({
  "within-range": {
    color: theme.colors.success,
  },
  "above-range": {
    color: theme.colors.warning,
  },
  "below-range": {
    color: theme.colors.warning,
  },
  "not-reported": {
    color: theme.colors.secondaryText,
  },
  "reference-range-unavailable": {
    color: theme.colors.secondaryText,
  },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedRow: {
    backgroundColor: theme.colors.lightBlue,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  leftColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  rightColumn: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
  },
  measurementName: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  referenceRange: {
    ...theme.typography.caption,
  },
  valueText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  statusText: {
    ...theme.typography.caption,
  },
});
