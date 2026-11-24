import { Pressable, StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import type { PatientMedication } from "@/constants/health/medications";
import { theme } from "@/constants/theme";
import { formatTimeForDisplay } from "@/utils/health/medication-schedule";

type MedicationDoseCardProps = {
  medication: PatientMedication;
  scheduledOccurrenceId: string;
  scheduledAt: string;
  isTaken: boolean;
  onMarkTaken: (scheduledOccurrenceId: string) => void;
  onUndoTaken: (scheduledOccurrenceId: string) => void;
};

export default function MedicationDoseCard({
  medication,
  scheduledOccurrenceId,
  scheduledAt,
  isTaken,
  onMarkTaken,
  onUndoTaken,
}: MedicationDoseCardProps) {
  const timeKey = scheduledAt.slice(11, 16);

  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{medication.name}</Text>
        <Text style={[styles.status, isTaken ? styles.taken : styles.pending]}>
          {isTaken ? "Taken" : "Not recorded"}
        </Text>
      </View>

      <Text style={styles.meta}>{`${medication.dose} ${medication.unit}`}</Text>
      <Text
        style={styles.meta}
      >{`Scheduled: ${formatTimeForDisplay(timeKey)}`}</Text>

      <Pressable
        onPress={() =>
          isTaken
            ? onUndoTaken(scheduledOccurrenceId)
            : onMarkTaken(scheduledOccurrenceId)
        }
        accessibilityRole="button"
        accessibilityLabel={
          isTaken ? "Undo recorded dose" : "Mark dose as taken"
        }
        style={[styles.action, isTaken ? styles.undoAction : styles.takeAction]}
      >
        <Text style={styles.actionText}>
          {isTaken ? "Undo" : "Mark as Taken"}
        </Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  name: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
    flex: 1,
  },
  status: {
    ...theme.typography.caption,
  },
  taken: {
    color: theme.colors.success,
  },
  pending: {
    color: theme.colors.warning,
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  action: {
    alignSelf: "flex-start",
    marginTop: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  takeAction: {
    backgroundColor: theme.colors.primaryBlue,
  },
  undoAction: {
    backgroundColor: theme.colors.tanAccent,
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.background,
  },
});
