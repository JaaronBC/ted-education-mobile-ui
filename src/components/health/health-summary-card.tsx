import { View, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import type { HealthSummaryData } from "@/constants/health/health-summaries";
import LabsSummary from "./summaries/labs-summary";
import ImagingSummary from "./summaries/imaging-summary";
import MedicationSummary from "./summaries/medication-summary";

type SummaryContentProps = {
  data: HealthSummaryData;
};
/*
Data will be passed with a type property that determines 
how the summary is rendered. The summaryRenderers object maps 
the type to the corresponding component for rendering.
*/

const summaryRenderers = {
  labsSummary: LabsSummary,
  imagingSummary: ImagingSummary,
  medicationSummary: MedicationSummary,
};
// Main component for rendering health summary cards
export default function HealthSummaryCard({
  data,
}: {
  data: HealthSummaryData;
}) {
  const Content = summaryRenderers[data.type];

  return (
    <View style={styles.card}>
      <Content data={data} />
    </View>
  );
}
// Define styles for the HealthSummaryCard component
const styles = StyleSheet.create({
  //general card styles
  card: {
    flex: 1,
    gap: theme.spacing.sm,
    backgroundColor: "transparent",
    paddingTop: theme.spacing.sm,
  },
});
