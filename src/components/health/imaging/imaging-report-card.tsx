import { Pressable, StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import AppIcon from "@/components/ui/app-icon";
import {
  formatImagingDate,
  type ImagingReport,
} from "@/constants/health/imaging-reports";
import { theme } from "@/constants/theme";

type ImagingReportCardProps = {
  report: ImagingReport;
  onViewReport: (reportId: string) => void;
};

export default function ImagingReportCard({
  report,
  onViewReport,
}: ImagingReportCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <AppIcon
          icon="Records"
          size={22}
          color={theme.colors.darkBlue}
          strokeWidth={2}
        />
        <View style={styles.metaColumn}>
          <Text style={styles.reportName}>{report.name}</Text>
          <Text style={styles.metaText}>
            {formatImagingDate(report.reportDate)}
          </Text>
          <Text style={styles.metaText}>{report.location}</Text>
        </View>
      </View>

      <Pressable
        style={styles.viewAction}
        onPress={() => onViewReport(report.id)}
        accessibilityRole="button"
        accessibilityLabel={`View report: ${report.name}`}
      >
        <Text style={styles.viewActionText}>View Report</Text>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  metaColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  reportName: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  metaText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  viewAction: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  viewActionText: {
    ...theme.typography.caption,
    color: theme.colors.darkBlue,
  },
});
