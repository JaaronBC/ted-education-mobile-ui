import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import AppIcon from "@/components/ui/app-icon";
import {
  formatImagingDate,
  type ImagingReport,
} from "@/constants/health/imaging-reports";
import { theme } from "@/constants/theme";

type ImagingReportViewerProps = {
  visible: boolean;
  report: ImagingReport;
  onClose: () => void;
  onEdit: () => void;
};

export default function ImagingReportViewer({
  visible,
  report,
  onClose,
  onEdit,
}: ImagingReportViewerProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{report.name}</Text>
          <Text style={styles.metaText}>
            {formatImagingDate(report.reportDate)}
          </Text>
          <Text style={styles.metaText}>{report.location}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <AppCard style={styles.metaCard}>
            <View style={styles.fileRow}>
              <AppIcon
                icon="Records"
                size={20}
                color={theme.colors.darkBlue}
                strokeWidth={2}
              />
              <Text style={styles.fileName}>{report.fileName}</Text>
            </View>
            {report.notes ? (
              <Text style={styles.notesText}>Notes: {report.notes}</Text>
            ) : null}
          </AppCard>

          <AppCard style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              Simulated Imaging Report Preview
            </Text>
            <Text style={styles.previewLabel}>Sample Document</Text>
            <Text style={styles.previewBody}>Imaging Study: {report.name}</Text>
            <Text style={styles.previewBody}>
              Date: {formatImagingDate(report.reportDate)}
            </Text>
            <Text style={styles.previewBody}>Facility: {report.location}</Text>
          </AppCard>
        </ScrollView>

        <View style={styles.actions}>
          <AppButton title="Close" variant="secondary" onPress={onClose} />
          <AppButton title="Edit Report Details" onPress={onEdit} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  metaText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  content: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  metaCard: {
    gap: theme.spacing.sm,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  fileName: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    flex: 1,
  },
  notesText: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  previewCard: {
    gap: theme.spacing.sm,
  },
  previewTitle: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  previewLabel: {
    ...theme.typography.caption,
    color: theme.colors.warning,
  },
  previewBody: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  previewDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  previewCaption: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
});
