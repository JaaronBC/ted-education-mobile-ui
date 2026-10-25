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
      <View style={styles.imageComparisonRow}>
        {data.images.map((image, index) => (
          <View key={`${image.date}-${index}`} style={styles.comparisonItem}>
            <Image
              source={{ uri: image.uri }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />
            <AppCard style={styles.labelCard}>
              <Text style={styles.imageLabel}>
                {index === data.images.length - 1
                  ? "Latest photo"
                  : "Previous photo"}
              </Text>
            </AppCard>
            <Text style={styles.summaryText}>{image.date}</Text>
          </View>
        ))}
      </View>
      <View style={styles.summaryDivider} />
    </View>
  );
}
const styles = StyleSheet.create({
  //general card styles
  card: {
    flex: 1,
    gap: theme.spacing.sm,
    backgroundColor: "transparent",
    paddingTop: theme.spacing.sm,
  },
  summaryDivider: {
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
  summaryText: {
    ...theme.typography.body,
  },
  content: {
    gap: theme.spacing.xs,
  },
  footerText: {
    ...theme.typography.subheading,
  },
  imageLabel: {
    ...theme.typography.caption,
    color: theme.colors.surface,
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
});
