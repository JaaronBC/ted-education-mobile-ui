import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import type { PatientMedication } from "@/features/health/constants/medications";
import { theme } from "@/constants/theme";
import { formatScheduleSummary } from "@/features/health/constants/medications";

type MedicationCardProps = {
  medication: PatientMedication;
  onEdit: (medicationId: string) => void;
  onManualLog: (medicationId: string) => void;
  onToggleReminder: (medicationId: string) => void;
  onDeactivate: (medicationId: string) => void;
  onReactivate: (medicationId: string) => void;
};

export default function MedicationCard({
  medication,
  onEdit,
  onManualLog,
  onToggleReminder,
  onDeactivate,
  onReactivate,
}: MedicationCardProps) {
  const { tr: tr10 } = useLocale10();

  const remindersSupported =
    medication.schedule.type === "daily" ||
    medication.schedule.type === "weekly";

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{medication.name}</Text>
      <Text
        style={styles.meta}
      >{`Dose: ${medication.dose} ${medication.unit}`}</Text>
      <Text
        style={styles.meta}
      >{`Schedule: ${formatScheduleSummary(medication.schedule)}`}</Text>
      <Text style={styles.meta}>{`Start date: ${medication.startDate}`}</Text>
      {medication.notes ? (
        <Text style={styles.meta}>{`Notes: ${medication.notes}`}</Text>
      ) : null}
      <Text style={styles.meta}>
        {`Reminders: ${
          remindersSupported
            ? medication.remindersEnabled
              ? "Enabled (simulated)"
              : "Disabled"
            : "Not available for this schedule"
        }`}
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => onEdit(medication.id)}
          accessibilityRole="button"
          style={styles.action}
        >
          <Text style={styles.actionText}>{tr10("Edit")}</Text>
        </Pressable>

        <Pressable
          onPress={() => onManualLog(medication.id)}
          accessibilityRole="button"
          style={styles.action}
        >
          <Text style={styles.actionText}>Log Dose</Text>
        </Pressable>

        <Pressable
          onPress={() => onToggleReminder(medication.id)}
          disabled={!remindersSupported}
          accessibilityRole="button"
          accessibilityState={{ disabled: !remindersSupported }}
          style={[styles.action, !remindersSupported && styles.actionDisabled]}
        >
          <Text style={styles.actionText}>Toggle Reminder</Text>
        </Pressable>

        {medication.isActive ? (
          <Pressable
            onPress={() => onDeactivate(medication.id)}
            accessibilityRole="button"
            style={styles.action}
          >
            <Text style={styles.actionText}>Deactivate</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onReactivate(medication.id)}
            accessibilityRole="button"
            style={styles.action}
          >
            <Text style={styles.actionText}>Reactivate</Text>
          </Pressable>
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  action: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
  },
});
