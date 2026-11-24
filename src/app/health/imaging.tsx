import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ImagingReportCard from "@/components/health/imaging/imaging-report-card";
import ImagingReportFormModal from "@/components/health/imaging/imaging-report-form-modal";
import ImagingReportViewer from "@/components/health/imaging/imaging-report-viewer";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import {
  sortImagingReports,
  type ImagingReport,
  type ImagingSortOrder,
} from "@/constants/health/imaging-reports";
import { theme } from "@/constants/theme";
import { mockImagingReports } from "@/mockdata/imaging-reports";

export default function ImagingScreen() {
  const [reports, setReports] = useState<ImagingReport[]>(mockImagingReports);
  const [sortOrder, setSortOrder] = useState<ImagingSortOrder>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const sortedReports = useMemo(
    () => sortImagingReports(reports, sortOrder),
    [reports, sortOrder],
  );

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );

  function openCreateModal() {
    setFormMode("create");
    setFormVisible(true);
    setSortOpen(false);
  }

  function openViewer(reportId: string) {
    setSelectedReportId(reportId);
    setViewerVisible(true);
    setSortOpen(false);
  }

  function openEditFromViewer() {
    if (!selectedReport) {
      return;
    }

    setFormMode("edit");
    setFormVisible(true);
    setViewerVisible(false);
  }

  function saveReport(report: ImagingReport) {
    if (formMode === "edit") {
      setReports((current) =>
        current.map((item) => (item.id === report.id ? report : item)),
      );
      setSelectedReportId(report.id);
      setFormVisible(false);
      setViewerVisible(true);
      return;
    }

    setReports((current) => [report, ...current]);
    setSelectedReportId(report.id);
    setFormVisible(false);
  }

  const sortLabel = sortOrder === "newest" ? "Newest first" : "Oldest first";

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.description}>
            Store and review your imaging reports with key report details.
          </Text>
          <AppButton title="Upload Imaging Report" onPress={openCreateModal} />
        </View>
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Imaging Reports</Text>

          <View style={styles.sortControlContainer}>
            <Pressable
              style={styles.sortTrigger}
              onPress={() => setSortOpen((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel="Sort imaging reports"
              accessibilityState={{ expanded: sortOpen }}
            >
              <Text style={styles.sortTriggerText}>{sortLabel}</Text>
            </Pressable>

            {sortOpen && (
              <View style={styles.sortMenu}>
                <Pressable
                  style={styles.sortOption}
                  onPress={() => {
                    setSortOrder("newest");
                    setSortOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sortOrder === "newest" }}
                >
                  <Text style={styles.sortOptionText}>Newest first</Text>
                </Pressable>
                <Pressable
                  style={styles.sortOption}
                  onPress={() => {
                    setSortOrder("oldest");
                    setSortOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sortOrder === "oldest" }}
                >
                  <Text style={styles.sortOptionText}>Oldest first</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {sortedReports.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No imaging reports added yet.</Text>
            <Text style={styles.emptyDescription}>
              Add your first imaging report to organize and review it here.
            </Text>
            <AppButton
              title="Upload Imaging Report"
              onPress={openCreateModal}
            />
          </AppCard>
        ) : (
          <View style={styles.reportsList}>
            {sortedReports.map((report) => (
              <ImagingReportCard
                key={report.id}
                report={report}
                onViewReport={openViewer}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {formVisible && (
        <ImagingReportFormModal
          key={
            formMode === "edit"
              ? `edit-${selectedReportId ?? "none"}`
              : "create"
          }
          visible={formVisible}
          mode={formMode}
          initialReport={
            formMode === "edit" ? (selectedReport ?? undefined) : undefined
          }
          onCancel={() => setFormVisible(false)}
          onSave={saveReport}
        />
      )}

      {viewerVisible && selectedReport && (
        <ImagingReportViewer
          visible={viewerVisible}
          report={selectedReport}
          onClose={() => setViewerVisible(false)}
          onEdit={openEditFromViewer}
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
  title: {
    ...theme.typography.title,
    color: theme.colors.primaryText,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  sectionTitle: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  sortControlContainer: {
    minWidth: 150,
    alignItems: "flex-end",
    position: "relative",
  },
  sortTrigger: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  sortTriggerText: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
  },
  sortMenu: {
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
    width: "100%",
  },
  sortOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  sortOptionText: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
  },
  reportsList: {
    gap: theme.spacing.sm,
  },
  emptyCard: {
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  emptyDescription: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
});
