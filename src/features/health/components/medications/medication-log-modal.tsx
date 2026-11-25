import { AccessibleInput } from '@/components/ui/AccessibleInput';
import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useMemo, useState } from "react";
import { Modal, ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/ui/app-button";
import {
  type MedicationLog,
  type PatientMedication,
} from "@/features/health/constants/medications";
import { theme } from "@/constants/theme";
import {
  isValidDateKey,
  isValidTimeKey,
  type ScheduledOccurrence,
} from "@/features/health/utils/medication-schedule";

type MedicationLogModalProps = {
  visible: boolean;
  medication: PatientMedication;
  existingLogs: MedicationLog[];
  scheduledOccurrences: ScheduledOccurrence[];
  onCancel: () => void;
  onSave: (log: MedicationLog) => void;
};

type MedicationLogValues = {
  date: string;
  time: string;
  dose: string;
  unit: string;
  notes: string;
  selectedOccurrenceId: string;
};

type MedicationLogErrors = {
  datetime?: string;
  dose?: string;
  unit?: string;
  duplicate?: string;
};

export default function MedicationLogModal({
  visible,
  medication,
  existingLogs,
  scheduledOccurrences,
  onCancel,
  onSave,
}: MedicationLogModalProps) {
  const { tr: tr10 } = useLocale10();

  const now = new Date();
  const initialDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const initialTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;

  const [values, setValues] = useState<MedicationLogValues>({
    date: initialDate,
    time: initialTime,
    dose: String(medication.dose),
    unit: medication.unit,
    notes: "",
    selectedOccurrenceId: "",
  });
  const [errors, setErrors] = useState<MedicationLogErrors>({});
  const [occurrenceMenuOpen, setOccurrenceMenuOpen] = useState(false);

  const selectedOccurrence = useMemo(() => {
    return (
      scheduledOccurrences.find(
        (occurrence) => occurrence.id === values.selectedOccurrenceId,
      ) ?? null
    );
  }, [scheduledOccurrences, values.selectedOccurrenceId]);

  function update<K extends keyof MedicationLogValues>(
    key: K,
    value: MedicationLogValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validate(): MedicationLogErrors {
    const nextErrors: MedicationLogErrors = {};

    if (
      !isValidDateKey(values.date.trim()) ||
      !isValidTimeKey(values.time.trim())
    ) {
      nextErrors.datetime = "Enter a valid date and time.";
    } else {
      const takenAtDate = new Date(
        `${values.date.trim()}T${values.time.trim()}:00`,
      );

      if (takenAtDate.getTime() > Date.now()) {
        nextErrors.datetime = "Dose time cannot be in the future.";
      }
    }

    const doseValue = Number(values.dose);
    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      nextErrors.dose = "Dose must be a positive number.";
    }

    if (!values.unit.trim()) {
      nextErrors.unit = "Dose unit is required.";
    }

    if (values.selectedOccurrenceId) {
      const duplicate = existingLogs.some(
        (log) => log.scheduledOccurrenceId === values.selectedOccurrenceId,
      );

      if (duplicate) {
        nextErrors.duplicate =
          "A dose is already recorded for this scheduled occurrence.";
      }
    }

    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const takenAt = new Date(
      `${values.date.trim()}T${values.time.trim()}:00`,
    ).toISOString();

    const nextLog: MedicationLog = {
      id: `log-${Date.now()}`,
      patientMedicationId: medication.id,
      scheduledOccurrenceId: selectedOccurrence?.id || undefined,
      scheduledAt: selectedOccurrence?.scheduledAt || undefined,
      takenAt,
      dose: Number(values.dose),
      unit: values.unit.trim(),
      notes: values.notes.trim() || undefined,
    };

    onSave(nextLog);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.surface}>
          <Text style={styles.title}>Log Medication Dose</Text>
          <Text style={styles.subtitle}>{medication.name}</Text>
          <Text
            style={styles.subtitle}
          >{`Prescribed: ${medication.dose} ${medication.unit}`}</Text>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Date taken (YYYY-MM-DD)</Text>
              <AccessibleInput labelKey="Date taken (YYYY-MM-DD)"
                value={values.date}
                onChangeText={(text) => update("date", text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
              />

              <Text style={styles.label}>Time taken (HH:MM)</Text>
              <AccessibleInput labelKey="Time taken (HH:MM)"
                value={values.time}
                onChangeText={(text) => update("time", text)}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
              />
              {errors.datetime ? (
                <Text style={styles.error}>{errors.datetime}</Text>
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Actual amount</Text>
                <AccessibleInput labelKey="Actual amount"
                  value={values.dose}
                  onChangeText={(text) => update("dose", text)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
                {errors.dose ? (
                  <Text style={styles.error}>{errors.dose}</Text>
                ) : null}
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>Actual unit</Text>
                <AccessibleInput labelKey="Actual unit"
                  value={values.unit}
                  onChangeText={(text) => update("unit", text)}
                  placeholder="mg"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
                {errors.unit ? (
                  <Text style={styles.error}>{errors.unit}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>
                Associate with scheduled occurrence (optional)
              </Text>
              <Pressable accessibilityRole="button"
                style={styles.dropdown}
                onPress={() => setOccurrenceMenuOpen((current) => !current)}
              >
                <Text style={styles.dropdownText}>
                  {selectedOccurrence
                    ? selectedOccurrence.scheduledAt.replace("T", " ")
                    : "None"}
                </Text>
              </Pressable>

              {occurrenceMenuOpen ? (
                <View style={styles.dropdownMenu}>
                  <Pressable accessibilityRole="button"
                    style={styles.dropdownItem}
                    onPress={() => {
                      update("selectedOccurrenceId", "");
                      setOccurrenceMenuOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>None</Text>
                  </Pressable>

                  {scheduledOccurrences.map((occurrence) => (
                    <Pressable accessibilityRole="button"
                      key={occurrence.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        update("selectedOccurrenceId", occurrence.id);
                        setOccurrenceMenuOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>
                        {occurrence.scheduledAt.replace("T", " ")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {errors.duplicate ? (
                <Text style={styles.error}>{errors.duplicate}</Text>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Notes (optional)</Text>
              <AccessibleInput labelKey="Notes (optional)"
                value={values.notes}
                onChangeText={(text) => update("notes", text)}
                placeholder={tr10("Optional notes")}
                placeholderTextColor={theme.colors.secondaryText}
                style={[styles.input, styles.notesInput]}
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <AppButton title={tr10("Cancel")} variant="secondary" onPress={onCancel} />
            <AppButton title="Save Dose" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(31,41,51,0.4)",
    justifyContent: "flex-end",
  },
  surface: {
    maxHeight: "90%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  content: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  fieldBlock: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  halfField: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  dropdownText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
});
