import { View, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import type { HealthSummaryData } from "@/constants/health/health-summaries";
import LabsSummary from "./summaries/labs-summary";
import ImagingSummary from "./summaries/imaging-summary";
import MedicationSummary from "./summaries/medication-summary";

type HealthSummaryCardProps = {
  data: HealthSummaryData;
};

const summaryRenderers = {
  labsSummary: LabsSummary,
  imagingSummary: ImagingSummary,
  medicationSummary: MedicationSummary,
};
export default function HealthSummaryCard({ data }: HealthSummaryCardProps) {
  const Content = summaryRenderers[data.type];

  return (
    <View style={styles.card}>
      <Content data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: theme.spacing.sm,
    backgroundColor: "transparent",
    paddingTop: theme.spacing.sm,
  },
});
