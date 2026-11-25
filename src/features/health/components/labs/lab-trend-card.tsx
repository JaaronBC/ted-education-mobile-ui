import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import {
  formatCollectionDate,
  formatReferenceRange,
  getMeasurementTrend,
  getRangeStatus,
  getRangeStatusLabel,
  getSharedReferenceRange,
  getSharedTrendUnit,
  type LabMeasurementId,
  type LabReport,
} from "@/features/health/constants/lab-measurements";
import { theme } from "@/constants/theme";
import LabTrendChart from "./lab-trend-chart";

type LabTrendCardProps = {
  reports: LabReport[];
  measurementId: LabMeasurementId;
  selector?: ReactNode;
};

export default function LabTrendCard({
  reports,
  measurementId,
  selector,
}: LabTrendCardProps) {
  const points = getMeasurementTrend(reports, measurementId);
  const latest = points.length > 0 ? points[points.length - 1] : null;

  const sharedUnit = getSharedTrendUnit(points);
  const sharedRange = getSharedReferenceRange(points);
  const latestStatus = latest
    ? getRangeStatus({
        value: latest.value,
        unit: latest.unit,
        referenceRange: latest.referenceRange,
      })
    : "not-reported";

  return (
    <AppCard style={styles.card}>
      {selector ? (
        <View style={styles.selectorContainer}>{selector}</View>
      ) : null}

      {latest ? (
        <View style={styles.summaryRow}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Latest result</Text>
            <Text
              style={styles.summaryValue}
            >{`${latest.value} ${latest.unit}`}</Text>
          </View>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>Collected</Text>
            <Text style={styles.summaryValue}>
              {formatCollectionDate(latest.collectedAt)}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.mutedText}>
          No results recorded yet for this measurement.
        </Text>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {`Reference range: ${latest ? formatReferenceRange(latest.referenceRange) : "Not reported"}`}
        </Text>
        <Text style={[styles.metaText, statusStyles[latestStatus]]}>
          {getRangeStatusLabel(latestStatus)}
        </Text>
      </View>

      {!sharedUnit && points.length > 0 ? (
        <Text style={styles.warningText}>
          Trend view is unavailable because this measurement uses different
          units across reports.
        </Text>
      ) : (
        <LabTrendChart
          points={points}
          sharedRange={sharedRange}
          unit={sharedUnit ?? latest?.unit ?? ""}
        />
      )}

      {!sharedRange && points.length > 1 && (
        <Text style={styles.mutedText}>
          Reference range shading is hidden because ranges are missing or differ
          across reports.
        </Text>
      )}
    </AppCard>
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
  card: {
    gap: theme.spacing.md,
  },
  selectorContainer: {
    gap: theme.spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  summaryColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  summaryLabel: {
    ...theme.typography.caption,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  metaRow: {
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.typography.caption,
  },
  warningText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
  },
  mutedText: {
    ...theme.typography.caption,
  },
});
