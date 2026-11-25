import { AccessibleInput } from '@/components/ui/AccessibleInput';
import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useMemo, useState } from "react";
import { Modal, ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/ui/app-button";
import {
  doseUnits,
  frequencyOptions,
  type DoseUnitOption,
  type FrequencyOptionId,
  type MedicationDefinition,
  type MedicationSchedule,
  type PatientMedication,
  weekdayOptions,
} from "@/features/health/constants/medications";
import { theme } from "@/constants/theme";
import {
  isValidDateKey,
  isValidTimeKey,
} from "@/features/health/utils/medication-schedule";
import MedicationSelector from "./medication-selector";

type MedicationFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  medicationDefinitions: MedicationDefinition[];
  initialMedication?: PatientMedication;
  onCancel: () => void;
  onSave: (medication: PatientMedication) => void;
};

type MedicationFormValues = {
  selectedMedicationId: string | null;
  customName: string;
  dose: string;
  doseUnit: DoseUnitOption;
  customUnit: string;
  frequency: FrequencyOptionId;
  dailyTimes: string[];
  weeklyDay: string;
  weeklyTime: string;
  customInstructions: string;
  startDate: string;
  notes: string;
  remindersEnabled: boolean;
};

type MedicationFormErrors = {
  medication?: string;
  dose?: string;
  unit?: string;
  frequency?: string;
  startDate?: string;
  times?: string;
  weekly?: string;
  customInstructions?: string;
};

function inferFrequency(schedule: MedicationSchedule): FrequencyOptionId {
  if (schedule.type === "daily") {
    if (schedule.times.length <= 1) {
      return "once-daily";
    }

    if (schedule.times.length === 2) {
      return "twice-daily";
    }

    return "three-daily";
  }

  if (schedule.type === "weekly") {
    return "weekly";
  }

  if (schedule.type === "as-needed") {
    return "as-needed";
  }

  return "custom";
}

function createInitialValues(
  initialMedication?: PatientMedication,
): MedicationFormValues {
  if (!initialMedication) {
    return {
      selectedMedicationId: null,
      customName: "",
      dose: "",
      doseUnit: "mg",
      customUnit: "",
      frequency: "once-daily",
      dailyTimes: ["08:00"],
      weeklyDay: "1",
      weeklyTime: "08:00",
      customInstructions: "",
      startDate: "",
      notes: "",
      remindersEnabled: true,
    };
  }

  const inferredFrequency = inferFrequency(initialMedication.schedule);

  return {
    selectedMedicationId: initialMedication.medicationId ?? null,
    customName: initialMedication.medicationId ? "" : initialMedication.name,
    dose: String(initialMedication.dose),
    doseUnit: doseUnits.includes(initialMedication.unit as DoseUnitOption)
      ? (initialMedication.unit as DoseUnitOption)
      : "Other",
    customUnit: doseUnits.includes(initialMedication.unit as DoseUnitOption)
      ? ""
      : initialMedication.unit,
    frequency: inferredFrequency,
    dailyTimes:
      initialMedication.schedule.type === "daily"
        ? [...initialMedication.schedule.times]
        : inferredFrequency === "once-daily"
          ? ["08:00"]
          : inferredFrequency === "twice-daily"
            ? ["08:00", "18:00"]
            : ["08:00", "13:00", "18:00"],
    weeklyDay:
      initialMedication.schedule.type === "weekly"
        ? String(initialMedication.schedule.days[0] ?? 1)
        : "1",
    weeklyTime:
      initialMedication.schedule.type === "weekly"
        ? (initialMedication.schedule.times[0] ?? "08:00")
        : "08:00",
    customInstructions:
      initialMedication.schedule.type === "custom"
        ? initialMedication.schedule.instructions
        : "",
    startDate: initialMedication.startDate,
    notes: initialMedication.notes ?? "",
    remindersEnabled: initialMedication.remindersEnabled,
  };
}

function getDailyTimeSlots(frequency: FrequencyOptionId): number {
  if (frequency === "once-daily") {
    return 1;
  }

  if (frequency === "twice-daily") {
    return 2;
  }

  if (frequency === "three-daily") {
    return 3;
  }

  return 0;
}

export default function MedicationFormModal({
  visible,
  mode,
  medicationDefinitions,
  initialMedication,
  onCancel,
  onSave,
}: MedicationFormModalProps) {
  const { tr: tr10 } = useLocale10();

  const [values, setValues] = useState<MedicationFormValues>(() =>
    createInitialValues(initialMedication),
  );
  const [errors, setErrors] = useState<MedicationFormErrors>({});
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [frequencyMenuOpen, setFrequencyMenuOpen] = useState(false);
  const [weekdayMenuOpen, setWeekdayMenuOpen] = useState(false);

  const selectedDefinition = useMemo(() => {
    if (!values.selectedMedicationId) {
      return null;
    }

    return (
      medicationDefinitions.find(
        (definition) => definition.id === values.selectedMedicationId,
      ) ?? null
    );
  }, [values.selectedMedicationId, medicationDefinitions]);

  const remindersSupported =
    values.frequency === "once-daily" ||
    values.frequency === "twice-daily" ||
    values.frequency === "three-daily" ||
    values.frequency === "weekly";

  function update<K extends keyof MedicationFormValues>(
    key: K,
    value: MedicationFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateDailyTime(index: number, value: string) {
    setValues((current) => {
      const nextTimes = [...current.dailyTimes];
      nextTimes[index] = value;

      return {
        ...current,
        dailyTimes: nextTimes,
      };
    });
  }

  function handleFrequencyChange(nextFrequency: FrequencyOptionId) {
    setFrequencyMenuOpen(false);

    setValues((current) => {
      const slots = getDailyTimeSlots(nextFrequency);
      const nextTimes =
        slots > 0
          ? Array.from({ length: slots }, (_, index) => {
              return current.dailyTimes[index] ?? "08:00";
            })
          : current.dailyTimes;

      return {
        ...current,
        frequency: nextFrequency,
        dailyTimes: nextTimes,
        remindersEnabled:
          nextFrequency === "as-needed" || nextFrequency === "custom"
            ? false
            : current.remindersEnabled,
      };
    });
  }

  function validate(): MedicationFormErrors {
    const nextErrors: MedicationFormErrors = {};

    const medicationName = selectedDefinition?.name ?? values.customName.trim();

    if (!medicationName) {
      nextErrors.medication = "Select a medication or provide a custom name.";
    }

    const parsedDose = Number(values.dose);
    if (!Number.isFinite(parsedDose) || parsedDose <= 0) {
      nextErrors.dose = "Dose amount must be a positive number.";
    }

    const unitValue =
      values.doseUnit === "Other" ? values.customUnit.trim() : values.doseUnit;

    if (!unitValue) {
      nextErrors.unit = "Select a dose unit or enter a custom unit.";
    }

    if (!isValidDateKey(values.startDate.trim())) {
      nextErrors.startDate = "Enter a valid start date (YYYY-MM-DD).";
    }

    if (values.frequency === "custom") {
      if (!values.customInstructions.trim()) {
        nextErrors.customInstructions =
          "Custom frequency instructions are required.";
      }
    }

    if (
      values.frequency === "once-daily" ||
      values.frequency === "twice-daily" ||
      values.frequency === "three-daily"
    ) {
      const slots = getDailyTimeSlots(values.frequency);
      const times = values.dailyTimes.slice(0, slots);

      if (times.some((time) => !isValidTimeKey(time.trim()))) {
        nextErrors.times =
          "Provide valid HH:MM times for all schedule entries.";
      }

      const unique = new Set(times.map((time) => time.trim()));
      if (unique.size !== times.length) {
        nextErrors.times = "Duplicate scheduled times are not allowed.";
      }
    }

    if (values.frequency === "weekly") {
      if (!values.weeklyDay) {
        nextErrors.weekly = "Select a day of week for weekly schedules.";
      }

      if (!isValidTimeKey(values.weeklyTime.trim())) {
        nextErrors.weekly = "Provide a valid weekly time in HH:MM format.";
      }
    }

    return nextErrors;
  }

  function buildSchedule(): MedicationSchedule {
    if (
      values.frequency === "once-daily" ||
      values.frequency === "twice-daily" ||
      values.frequency === "three-daily"
    ) {
      const slots = getDailyTimeSlots(values.frequency);
      return {
        type: "daily",
        times: values.dailyTimes.slice(0, slots).map((time) => time.trim()),
      };
    }

    if (values.frequency === "weekly") {
      return {
        type: "weekly",
        days: [Number(values.weeklyDay)],
        times: [values.weeklyTime.trim()],
      };
    }

    if (values.frequency === "as-needed") {
      return {
        type: "as-needed",
      };
    }

    return {
      type: "custom",
      instructions: values.customInstructions.trim(),
    };
  }

  function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const selected = selectedDefinition;
    const name = selected?.name ?? values.customName.trim();
    const unit =
      values.doseUnit === "Other" ? values.customUnit.trim() : values.doseUnit;

    const nextMedication: PatientMedication = {
      id: initialMedication?.id ?? `pm-${Date.now()}`,
      medicationId: selected?.id,
      name,
      dose: Number(values.dose),
      unit,
      schedule: buildSchedule(),
      startDate: values.startDate.trim(),
      endDate: initialMedication?.endDate,
      remindersEnabled: remindersSupported ? values.remindersEnabled : false,
      isActive: initialMedication?.isActive ?? true,
      notes: values.notes.trim() || undefined,
    };

    onSave(nextMedication);
  }

  const frequencyLabel =
    frequencyOptions.find((option) => option.id === values.frequency)?.label ??
    "Select frequency";

  const weekdayLabel =
    weekdayOptions.find((option) => String(option.id) === values.weeklyDay)
      ?.label ?? "Select day";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.surface}>
          <Text style={styles.title}>
            {mode === "create" ? tr10("Add Medication") : "Edit Medication"}
          </Text>
          <Text style={styles.subtitle}>
            Medication details are mock values for UI demonstration only.
          </Text>

          <ScrollView contentContainerStyle={styles.content}>
            <MedicationSelector
              medications={medicationDefinitions}
              selectedMedicationId={values.selectedMedicationId}
              onSelectMedicationId={(id) => update("selectedMedicationId", id)}
            />
            {errors.medication ? (
              <Text style={styles.error}>{errors.medication}</Text>
            ) : null}

            {!values.selectedMedicationId ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Custom medication name</Text>
                <AccessibleInput labelKey="Custom medication name"
                  value={values.customName}
                  onChangeText={(text) => update("customName", text)}
                  placeholder="Enter medication name"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Dose amount</Text>
                <AccessibleInput labelKey="Dose amount"
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
                <Text style={styles.label}>Dose unit</Text>
                <Pressable accessibilityRole="button"
                  style={styles.dropdown}
                  onPress={() => setUnitMenuOpen((current) => !current)}
                >
                  <Text style={styles.dropdownText}>{values.doseUnit}</Text>
                </Pressable>
                {unitMenuOpen ? (
                  <View style={styles.dropdownMenu}>
                    {doseUnits.map((unitOption) => (
                      <Pressable accessibilityRole="button"
                        key={unitOption}
                        style={styles.dropdownItem}
                        onPress={() => {
                          update("doseUnit", unitOption);
                          setUnitMenuOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>{unitOption}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            {values.doseUnit === "Other" ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Custom unit</Text>
                <AccessibleInput labelKey="Custom unit"
                  value={values.customUnit}
                  onChangeText={(text) => update("customUnit", text)}
                  placeholder="Enter custom unit"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
              </View>
            ) : null}
            {errors.unit ? (
              <Text style={styles.error}>{errors.unit}</Text>
            ) : null}

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Frequency</Text>
              <Pressable accessibilityRole="button"
                style={styles.dropdown}
                onPress={() => setFrequencyMenuOpen((current) => !current)}
              >
                <Text style={styles.dropdownText}>{frequencyLabel}</Text>
              </Pressable>
              {frequencyMenuOpen ? (
                <View style={styles.dropdownMenu}>
                  {frequencyOptions.map((option) => (
                    <Pressable accessibilityRole="button"
                      key={option.id}
                      style={styles.dropdownItem}
                      onPress={() => handleFrequencyChange(option.id)}
                    >
                      <Text style={styles.dropdownText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            {(values.frequency === "once-daily" ||
              values.frequency === "twice-daily" ||
              values.frequency === "three-daily") && (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Scheduled times (HH:MM)</Text>
                {Array.from({
                  length: getDailyTimeSlots(values.frequency),
                }).map((_, index) => (
                  <AccessibleInput labelKey="Scheduled time (HH:MM)" labelContext={String(index + 1)}
                    key={`daily-time-${index}`}
                    value={values.dailyTimes[index] ?? ""}
                    onChangeText={(text) => updateDailyTime(index, text)}
                    placeholder="08:00"
                    placeholderTextColor={theme.colors.secondaryText}
                    style={styles.input}
                  />
                ))}
                {errors.times ? (
                  <Text style={styles.error}>{errors.times}</Text>
                ) : null}
              </View>
            )}

            {values.frequency === "weekly" && (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Scheduled day</Text>
                <Pressable accessibilityRole="button"
                  style={styles.dropdown}
                  onPress={() => setWeekdayMenuOpen((current) => !current)}
                >
                  <Text style={styles.dropdownText}>{weekdayLabel}</Text>
                </Pressable>
                {weekdayMenuOpen ? (
                  <View style={styles.dropdownMenu}>
                    {weekdayOptions.map((weekday) => (
                      <Pressable accessibilityRole="button"
                        key={weekday.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          update("weeklyDay", String(weekday.id));
                          setWeekdayMenuOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>{weekday.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                <AccessibleInput labelKey="Scheduled time (HH:MM)"
                  value={values.weeklyTime}
                  onChangeText={(text) => update("weeklyTime", text)}
                  placeholder="09:00"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
                {errors.weekly ? (
                  <Text style={styles.error}>{errors.weekly}</Text>
                ) : null}
              </View>
            )}

            {values.frequency === "custom" && (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Custom frequency instructions</Text>
                <AccessibleInput labelKey="Custom frequency instructions"
                  value={values.customInstructions}
                  onChangeText={(text) => update("customInstructions", text)}
                  placeholder="Enter prescribed instructions"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={[styles.input, styles.notesInput]}
                  multiline
                />
                {errors.customInstructions ? (
                  <Text style={styles.error}>{errors.customInstructions}</Text>
                ) : null}
              </View>
            )}

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Start date (YYYY-MM-DD)</Text>
              <AccessibleInput labelKey="Start date (YYYY-MM-DD)"
                value={values.startDate}
                onChangeText={(text) => update("startDate", text)}
                placeholder="2026-11-23"
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
              />
              {errors.startDate ? (
                <Text style={styles.error}>{errors.startDate}</Text>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Prescription notes (optional)</Text>
              <AccessibleInput labelKey="Prescription notes (optional)"
                value={values.notes}
                onChangeText={(text) => update("notes", text)}
                placeholder={tr10("Optional notes")}
                placeholderTextColor={theme.colors.secondaryText}
                style={[styles.input, styles.notesInput]}
                multiline
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Reminder preference (simulated)</Text>
              <Pressable
                style={[
                  styles.dropdown,
                  !remindersSupported && styles.dropdownDisabled,
                ]}
                onPress={() => {
                  if (!remindersSupported) {
                    return;
                  }

                  update("remindersEnabled", !values.remindersEnabled);
                }}
                accessibilityRole="switch"
                accessibilityState={{
                  checked: values.remindersEnabled,
                  disabled: !remindersSupported,
                }}
              >
                <Text style={styles.dropdownText}>
                  {!remindersSupported
                    ? "Disabled for this schedule"
                    : values.remindersEnabled
                      ? tr10("Enabled")
                      : tr10("Disabled")}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <AppButton title={tr10("Cancel")} variant="secondary" onPress={onCancel} />
            <AppButton title={tr10("Save Medication")} onPress={handleSave} />
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
    maxHeight: "92%",
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
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  halfField: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  fieldBlock: {
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
  notesInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  dropdownDisabled: {
    opacity: 0.5,
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
});
