import { Pressable, StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import {
  getTreatmentStatusLabel,
  type PatientTreatment,
} from "@/features/health/constants/treatments";
import { theme } from "@/constants/theme";

type TreatmentCardProps = {
  treatment: PatientTreatment;
  noteCount: number;
  onViewDetails: (patientTreatmentId: string) => void;
};

function formatDateForDisplay(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TreatmentCard({
  treatment,
  noteCount,
  onViewDetails,
}: TreatmentCardProps) {
  const statusLabel = getTreatmentStatusLabel(treatment.status);

  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{treatment.name}</Text>
        <Text style={styles.status}>{statusLabel}</Text>
      </View>

      <Text
        style={styles.meta}
      >{`Date started: ${formatDateForDisplay(treatment.startDate)}`}</Text>

      {treatment.status === "ongoing" ? (
        <Text style={styles.meta}>{`Expected end date: ${
          treatment.expectedEndDate
            ? formatDateForDisplay(treatment.expectedEndDate)
            : "—"
        }`}</Text>
      ) : (
        <Text style={styles.meta}>{`Date ended: ${
          treatment.endDate ? formatDateForDisplay(treatment.endDate) : "—"
        }`}</Text>
      )}

      <Text style={styles.meta}>{`Side effect notes: ${noteCount}`}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View treatment details for ${treatment.name}`}
        onPress={() => onViewDetails(treatment.id)}
        style={styles.action}
      >
        <Text style={styles.actionText}>View Treatment Details</Text>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  name: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
    flex: 1,
  },
  status: {
    ...theme.typography.caption,
    color: theme.colors.primaryBlue,
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  action: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
  },
});
