import { View, Text, Image, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import type { HealthSummaryData } from "@/constants/health/health-summaries";
import AppCard from "../../ui/app-card";

type SummaryContentProps = {
  data: HealthSummaryData;
};

export default function ImagingSummary({ data }: SummaryContentProps) {
  if (data.type !== "imagingSummary") return null;

  return (
    <View style={styles.content}>
      {data.report.map((report, index) => (
        <View key={`${report.reportType}-${report.date}-${index}`}>
          <View style={styles.cardRow}>
            <Image
              source={{ uri: report.uri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.detailsColumn}>
              <AppCard style={styles.labelCard}>
                <Text style={styles.imageLabel}>{report.reportType}</Text>
              </AppCard>
              <Text style={styles.dateText}>{report.date}</Text>
              <Text style={styles.summaryText}>Available</Text>
            </View>
          </View>

          <View style={styles.divider} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xs,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.md,
  },
  detailsColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  labelCard: {
    backgroundColor: theme.colors.primaryBlue,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.primaryBlue,
    borderWidth: 1,
    alignItems: "center",
  },
  // Text styles
  dateText: {
    ...theme.typography.body,
  },
  summaryText: {
    ...theme.typography.body,
    color: theme.colors.primaryBlue,
  },
  imageLabel: {
    ...theme.typography.body,
    color: theme.colors.surface,
  },
});
