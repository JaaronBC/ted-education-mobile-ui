import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import LabHistoryCard from "@/components/health/labs/lab-history-card";
import LabMeasurementSelector from "@/components/health/labs/lab-measurement-selector";
import LabResultRow from "@/components/health/labs/lab-result-row";
import LabReviewModal from "@/components/health/labs/lab-review-modal";
import LabTrendCard from "@/components/health/labs/lab-trend-card";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import {
  formatCollectionDate,
  getMeasurementDefinition,
  labMeasurementDefinitions,
  sortReportsByCollectionDate,
  type LabMeasurementId,
  type LabReport,
} from "@/constants/health/lab-measurements";
import { theme } from "@/constants/theme";
import { mockLabReports, mockReviewDraft } from "@/mockdata/lab-reports";

type LabsView = "trends" | "history";

export default function LabsScreen() {
  const [reports, setReports] = useState<LabReport[]>(mockLabReports);
  const [view, setView] = useState<LabsView>("trends");
  const [selectedMeasurementId, setSelectedMeasurementId] =
    useState<LabMeasurementId>("tsh");
  const [expandedReportIds, setExpandedReportIds] = useState<
    Record<string, boolean>
  >({});
  const [reviewVisible, setReviewVisible] = useState(false);

  const sortedReports = useMemo(
    () => sortReportsByCollectionDate(reports, "desc"),
    [reports],
  );

  const latestReport = sortedReports[0] ?? null;
  const mostRecentDate = latestReport
    ? formatCollectionDate(latestReport.collectedAt)
    : "No reports";

  const selectedMeasurement = getMeasurementDefinition(selectedMeasurementId);

  const latestResults = labMeasurementDefinitions.map((measurement) => ({
    definition: measurement,
    result: latestReport ? latestReport.measurements[measurement.id] : null,
  }));

  function toggleHistoryCard(reportId: string) {
    setExpandedReportIds((current) => ({
      ...current,
      [reportId]: !current[reportId],
    }));
  }

  function openMockReview() {
    setReviewVisible(true);
  }

  function saveMockReport(report: LabReport) {
    setReports((current) => [...current, report]);
    setReviewVisible(false);
    setView("history");
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.description}>
            Track and compare thyroid-related laboratory results across your
            reports.
          </Text>
          <AppButton title="Upload Lab Report" onPress={openMockReview} />
        </View>
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleButton,
              view === "trends" && styles.toggleButtonActive,
            ]}
            onPress={() => setView("trends")}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.toggleText,
                view === "trends" && styles.toggleTextActive,
              ]}
            >
              Lab Trends
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              view === "history" && styles.toggleButtonActive,
            ]}
            onPress={() => setView("history")}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.toggleText,
                view === "history" && styles.toggleTextActive,
              ]}
            >
              Lab History
            </Text>
          </Pressable>
        </View>

        {view === "trends" ? (
          <View style={styles.sectionStack}>
            <LabTrendCard
              reports={sortedReports}
              measurementId={selectedMeasurementId}
              selector={
                <LabMeasurementSelector
                  measurements={labMeasurementDefinitions}
                  selectedMeasurementId={selectedMeasurementId}
                  onSelectMeasurement={setSelectedMeasurementId}
                />
              }
            />

            <AppCard style={styles.latestResultsCard}>
              <Text style={styles.sectionTitle}>Latest Lab Results</Text>
              <Text style={styles.caption}>
                From {mostRecentDate}. Tap a row to update the trend graph.
              </Text>

              {latestResults.map(({ definition, result }) => (
                <LabResultRow
                  key={definition.id}
                  measurementId={definition.id}
                  measurementName={definition.name}
                  result={result}
                  selected={definition.id === selectedMeasurement.id}
                  onPress={setSelectedMeasurementId}
                />
              ))}
            </AppCard>
          </View>
        ) : (
          <View style={styles.sectionStack}>
            {sortedReports.map((report) => (
              <LabHistoryCard
                key={report.id}
                report={report}
                expanded={Boolean(expandedReportIds[report.id])}
                onToggle={() => toggleHistoryCard(report.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {reviewVisible && (
        <LabReviewModal
          visible={reviewVisible}
          initialDraft={mockReviewDraft}
          onCancel={() => setReviewVisible(false)}
          onSave={saveMockReport}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  headerBlock: {
    gap: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
  },
  caption: {
    ...theme.typography.caption,
  },
  sectionTitle: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  toggleButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primaryBlue,
  },
  toggleText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  toggleTextActive: {
    color: theme.colors.background,
  },
  sectionStack: {
    gap: theme.spacing.sm,
  },
  latestResultsCard: {
    gap: theme.spacing.sm,
  },
});
