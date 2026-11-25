import { AccessibleInput } from '@/components/ui/AccessibleInput';
import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/ui/app-button";
import TreatmentSelector from "@/features/health/components/treatments/treatment-selector";
import {
  treatmentStatusOptions,
  type PatientTreatment,
  type TreatmentDefinition,
  type TreatmentNote,
  type TreatmentStatus,
} from "@/features/health/constants/treatments";
import { theme } from "@/constants/theme";

export type TreatmentFormMode = "create" | "edit" | "end";

export type TreatmentFormSubmission = {
  treatmentId?: string;
  name: string;
  startDate: string;
  endDate?: string;
  expectedEndDate?: string;
  status: TreatmentStatus;
  initialNote?: {
    date: string;
    notes: string;
  };
};

type TreatmentFormModalProps = {
  visible: boolean;
  mode: TreatmentFormMode;
  treatmentDefinitions: TreatmentDefinition[];
  relatedNotes: TreatmentNote[];
  initialTreatment?: PatientTreatment;
  onCancel: () => void;
  onSave: (value: TreatmentFormSubmission) => void;
};

type FormState = {
  selectedDefinitionId: string | null;
  customName: string;
  status: TreatmentStatus | "";
  startDate: string;
  endDate: string;
  expectedEndDate: string;
  initialNoteDate: string;
  initialNoteText: string;
};

type FormErrors = {
  treatment?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  expectedEndDate?: string;
  initialNote?: string;
};

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return toLocalDateKey(parsed) === value;
}

function createInitialState(
  mode: TreatmentFormMode,
  treatmentDefinitions: TreatmentDefinition[],
  initialTreatment?: PatientTreatment,
): FormState {
  if (!initialTreatment) {
    const today = toLocalDateKey(new Date());

    return {
      selectedDefinitionId: null,
      customName: "",
      status: "ongoing",
      startDate: "",
      endDate: "",
      expectedEndDate: "",
      initialNoteDate: today,
      initialNoteText: "",
    };
  }

  const matched = initialTreatment.treatmentId
    ? treatmentDefinitions.find(
        (definition) => definition.id === initialTreatment.treatmentId,
      )
    : undefined;

  return {
    selectedDefinitionId: matched?.id ?? null,
    customName: matched ? "" : initialTreatment.name,
    status: mode === "end" ? "completed" : initialTreatment.status,
    startDate: initialTreatment.startDate,
    endDate: initialTreatment.endDate ?? "",
    expectedEndDate: initialTreatment.expectedEndDate ?? "",
    initialNoteDate: toLocalDateKey(new Date()),
    initialNoteText: "",
  };
}

export default function TreatmentFormModal({
  visible,
  mode,
  treatmentDefinitions,
  relatedNotes,
  initialTreatment,
  onCancel,
  onSave,
}: TreatmentFormModalProps) {
  const { tr: tr10 } = useLocale10();

  const [values, setValues] = useState<FormState>(() =>
    createInitialState(mode, treatmentDefinitions, initialTreatment),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const selectedDefinition = useMemo(() => {
    if (!values.selectedDefinitionId) {
      return null;
    }

    return (
      treatmentDefinitions.find(
        (definition) => definition.id === values.selectedDefinitionId,
      ) ?? null
    );
  }, [values.selectedDefinitionId, treatmentDefinitions]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSelectTreatment(definitionId: string | null) {
    if (mode === "end") {
      return;
    }

    if (!definitionId) {
      setValues((current) => ({
        ...current,
        selectedDefinitionId: null,
      }));
      return;
    }

    setValues((current) => ({
      ...current,
      selectedDefinitionId: definitionId,
    }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const today = toLocalDateKey(new Date());
    const status = values.status;
    const startDate = values.startDate.trim();
    const endDate = values.endDate.trim();
    const expectedEndDate = values.expectedEndDate.trim();

    const treatmentName = selectedDefinition?.name ?? values.customName.trim();

    if (!treatmentName) {
      nextErrors.treatment =
        "Select a treatment or enter a custom treatment name.";
    }

    if (!status) {
      nextErrors.status = "Select a treatment status.";
    }

    if (!isValidDateKey(startDate)) {
      nextErrors.startDate = "Enter a valid start date (YYYY-MM-DD).";
    } else if (startDate > today) {
      nextErrors.startDate = "Start date cannot be in the future.";
    }

    if (status === "completed" || status === "discontinued") {
      if (!isValidDateKey(endDate)) {
        nextErrors.endDate = "Enter a valid end date (YYYY-MM-DD).";
      } else if (isValidDateKey(startDate) && endDate < startDate) {
        nextErrors.endDate = "End date cannot be earlier than start date.";
      } else if (endDate > today) {
        nextErrors.endDate = "End date cannot be in the future.";
      }
    }

    if (status === "ongoing" && endDate) {
      nextErrors.endDate =
        "Ongoing treatments cannot include an actual end date.";
    }

    if (expectedEndDate) {
      if (!isValidDateKey(expectedEndDate)) {
        nextErrors.expectedEndDate =
          "Enter a valid expected end date (YYYY-MM-DD).";
      } else if (isValidDateKey(startDate) && expectedEndDate < startDate) {
        nextErrors.expectedEndDate =
          "Expected end date cannot be earlier than start date.";
      }
    }

    if (mode !== "create" && isValidDateKey(startDate)) {
      const hasEarlierNote = relatedNotes.some((note) => note.date < startDate);
      if (hasEarlierNote) {
        nextErrors.startDate =
          "Start date cannot be after existing note dates. Update notes first.";
      }
    }

    if (mode === "create" && values.initialNoteText.trim()) {
      const noteDate = values.initialNoteDate.trim();

      if (!isValidDateKey(noteDate)) {
        nextErrors.initialNote =
          "Initial note date must be valid (YYYY-MM-DD).";
      } else if (noteDate > today) {
        nextErrors.initialNote = "Initial note date cannot be in the future.";
      } else if (isValidDateKey(startDate) && noteDate < startDate) {
        nextErrors.initialNote =
          "Initial note date cannot be earlier than treatment start date.";
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

    const status = values.status as TreatmentStatus;
    const selected = selectedDefinition;

    const submission: TreatmentFormSubmission = {
      treatmentId: selected?.id,
      name: selected?.name ?? values.customName.trim(),
      status,
      startDate: values.startDate.trim(),
      endDate:
        status === "completed" || status === "discontinued"
          ? values.endDate.trim()
          : undefined,
      expectedEndDate:
        status === "ongoing" && values.expectedEndDate.trim()
          ? values.expectedEndDate.trim()
          : undefined,
    };

    if (mode === "create" && values.initialNoteText.trim()) {
      submission.initialNote = {
        date: values.initialNoteDate.trim(),
        notes: values.initialNoteText.trim(),
      };
    }

    onSave(submission);
  }

  const title =
    mode === "create"
      ? "Add Treatment"
      : mode === "edit"
        ? "Edit Treatment"
        : "End Treatment";

  const selectedStatusLabel = values.status
    ? treatmentStatusOptions.find((option) => option.id === values.status)
        ?.label || "Select status"
    : "Select status";

  const disableSelector = mode === "end";
  const showEndDate =
    values.status === "completed" || values.status === "discontinued";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.surface}>
          <Text style={styles.title}>{title}</Text>

          <ScrollView contentContainerStyle={styles.content}>
            {disableSelector ? null : (
              <TreatmentSelector
                treatments={treatmentDefinitions}
                selectedTreatmentId={values.selectedDefinitionId}
                onSelectTreatmentId={handleSelectTreatment}
              />
            )}

            {disableSelector ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>{tr10("Treatment")}</Text>
                <Text style={styles.readOnlyValue}>
                  {initialTreatment?.name}
                </Text>
              </View>
            ) : null}

            {errors.treatment ? (
              <Text style={styles.error}>{errors.treatment}</Text>
            ) : null}

            {!values.selectedDefinitionId && mode !== "end" ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Custom treatment name</Text>
                <AccessibleInput labelKey="Custom treatment name"
                  value={values.customName}
                  onChangeText={(text) => update("customName", text)}
                  placeholder="Enter treatment name"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Treatment status</Text>
              <Pressable accessibilityRole="button"
                style={styles.dropdown}
                onPress={() => setStatusMenuOpen((current) => !current)}
              >
                <Text style={styles.dropdownText}>{selectedStatusLabel}</Text>
              </Pressable>
              {statusMenuOpen ? (
                <View style={styles.dropdownMenu}>
                  {(mode === "end"
                    ? treatmentStatusOptions.filter(
                        (option) => option.id !== "ongoing",
                      )
                    : treatmentStatusOptions
                  ).map((option) => (
                    <Pressable accessibilityRole="button"
                      key={option.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        update("status", option.id);
                        setStatusMenuOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {errors.status ? (
                <Text style={styles.error}>{errors.status}</Text>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Date started (YYYY-MM-DD)</Text>
              <AccessibleInput labelKey="Date started (YYYY-MM-DD)"
                value={values.startDate}
                onChangeText={(text) => update("startDate", text)}
                placeholder="2026-11-24"
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
                editable={mode !== "end"}
              />
              {errors.startDate ? (
                <Text style={styles.error}>{errors.startDate}</Text>
              ) : null}
            </View>

            {showEndDate ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Actual end date (YYYY-MM-DD)</Text>
                <AccessibleInput labelKey="Actual end date (YYYY-MM-DD)"
                  value={values.endDate}
                  onChangeText={(text) => update("endDate", text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
                {errors.endDate ? (
                  <Text style={styles.error}>{errors.endDate}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Expected end date (optional)</Text>
                <AccessibleInput labelKey="Expected end date (optional)"
                  value={values.expectedEndDate}
                  onChangeText={(text) => update("expectedEndDate", text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={styles.input}
                />
                {errors.expectedEndDate ? (
                  <Text style={styles.error}>{errors.expectedEndDate}</Text>
                ) : null}
              </View>
            )}

            {mode === "create" ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  Initial side effect note (optional)
                </Text>
                <AccessibleInput labelKey="Initial side effect note (optional)"
                  value={values.initialNoteText}
                  onChangeText={(text) => update("initialNoteText", text)}
                  placeholder="Describe your experience"
                  placeholderTextColor={theme.colors.secondaryText}
                  style={[styles.input, styles.notesInput]}
                  multiline
                />
                {errors.initialNote ? (
                  <Text style={styles.error}>{errors.initialNote}</Text>
                ) : null}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actionsRow}>
            <AppButton title={tr10("Cancel")} variant="secondary" onPress={onCancel} />
            <AppButton
              title={
                mode === "create"
                  ? tr10("Save Treatment")
                  : mode === "edit"
                    ? "Update Treatment"
                    : "Confirm End"
              }
              onPress={handleSave}
            />
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
  content: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  fieldBlock: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  readOnlyValue: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
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
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
});
