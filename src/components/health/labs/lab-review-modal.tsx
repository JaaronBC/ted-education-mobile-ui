import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import {
  labMeasurementDefinitions,
  type LabReport,
} from "@/constants/health/lab-measurements";
import { theme } from "@/constants/theme";
import {
  buildValidatedLabReport,
  createReviewFormFromDraft,
  type LabReviewDraftInput,
  type LabReviewFieldErrors,
  type LabReviewFormState,
  type LabReviewValidationErrors,
} from "./lab-review-form";

type LabReviewModalProps = {
  visible: boolean;
  initialDraft: LabReviewDraftInput;
  onCancel: () => void;
  onSave: (report: LabReport) => void;
};

export default function LabReviewModal({
  visible,
  initialDraft,
  onCancel,
  onSave,
}: LabReviewModalProps) {
  const [form, setForm] = useState<LabReviewFormState>(() =>
    createReviewFormFromDraft(initialDraft),
  );
  const [errors, setErrors] = useState<LabReviewValidationErrors>({
    measurements: {},
  });

  const hasErrors =
    Boolean(errors.collectionDate) ||
    Object.keys(errors.measurements).length > 0;

  function updateCollectedAt(value: string) {
    setForm((current) => ({
      ...current,
      collectedAt: value,
      confirmed: false,
    }));
  }

  function updateMeasurementField(
    measurementId: keyof LabReviewFormState["measurements"],
    field: keyof LabReviewFormState["measurements"][typeof measurementId],
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      confirmed: false,
      measurements: {
        ...current.measurements,
        [measurementId]: {
          ...current.measurements[measurementId],
          [field]: value,
        },
      },
    }));
  }

  function onModalSave() {
    const result = buildValidatedLabReport(form);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({ measurements: {} });
    onSave(result.report);
  }

  function getFieldError(
    measurementId: keyof LabReviewFormState["measurements"],
  ): LabReviewFieldErrors | undefined {
    return errors.measurements[measurementId];
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalSurface}>
          <Text style={styles.title}>Review extracted lab report</Text>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <AppCard>
              <Text style={styles.label}>PDF filename</Text>
              <Text style={styles.value}>{form.pdfFileName}</Text>

              <Text style={styles.label}>Collection date (YYYY-MM-DD)</Text>
              <TextInput
                value={form.collectedAt}
                onChangeText={updateCollectedAt}
                style={styles.input}
                placeholder="2026-11-22"
                placeholderTextColor={theme.colors.secondaryText}
              />
              {errors.collectionDate && (
                <Text style={styles.errorText}>{errors.collectionDate}</Text>
              )}
            </AppCard>

            {labMeasurementDefinitions.map((measurement) => {
              const fields = form.measurements[measurement.id];
              const fieldErrors = getFieldError(measurement.id);

              return (
                <AppCard key={measurement.id} style={styles.measurementCard}>
                  <Text style={styles.measurementTitle}>
                    {measurement.name}
                  </Text>

                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Result</Text>
                      <TextInput
                        value={fields.value}
                        onChangeText={(value) =>
                          updateMeasurementField(measurement.id, "value", value)
                        }
                        style={styles.input}
                        keyboardType="decimal-pad"
                        placeholder="Not reported"
                        placeholderTextColor={theme.colors.secondaryText}
                      />
                      {fieldErrors?.value && (
                        <Text style={styles.errorText}>
                          {fieldErrors.value}
                        </Text>
                      )}
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Unit</Text>
                      <TextInput
                        value={fields.unit}
                        onChangeText={(value) =>
                          updateMeasurementField(measurement.id, "unit", value)
                        }
                        style={styles.input}
                      />
                      {fieldErrors?.unit && (
                        <Text style={styles.errorText}>{fieldErrors.unit}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Ref low</Text>
                      <TextInput
                        value={fields.low}
                        onChangeText={(value) =>
                          updateMeasurementField(measurement.id, "low", value)
                        }
                        style={styles.input}
                        keyboardType="decimal-pad"
                        placeholder="optional"
                        placeholderTextColor={theme.colors.secondaryText}
                      />
                      {fieldErrors?.low && (
                        <Text style={styles.errorText}>{fieldErrors.low}</Text>
                      )}
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Ref high</Text>
                      <TextInput
                        value={fields.high}
                        onChangeText={(value) =>
                          updateMeasurementField(measurement.id, "high", value)
                        }
                        style={styles.input}
                        keyboardType="decimal-pad"
                        placeholder="optional"
                        placeholderTextColor={theme.colors.secondaryText}
                      />
                      {fieldErrors?.high && (
                        <Text style={styles.errorText}>{fieldErrors.high}</Text>
                      )}
                    </View>
                  </View>

                  {fieldErrors?.range && (
                    <Text style={styles.errorText}>{fieldErrors.range}</Text>
                  )}
                </AppCard>
              );
            })}

            <AppCard>
              <Text style={styles.label}>Verification</Text>
              <Text
                style={styles.value}
                onPress={() =>
                  setForm((current) => ({
                    ...current,
                    confirmed: !current.confirmed,
                  }))
                }
              >
                {form.confirmed
                  ? "☑ I verified the extracted values"
                  : "☐ I verified the extracted values"}
              </Text>
              {hasErrors && (
                <Text style={styles.errorText}>
                  Fix validation issues before saving.
                </Text>
              )}
            </AppCard>
          </ScrollView>

          <View style={styles.actions}>
            <AppButton title="Cancel" variant="secondary" onPress={onCancel} />
            <AppButton
              title="Save mock report"
              onPress={onModalSave}
              disabled={!form.confirmed}
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
  modalSurface: {
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
  },
  scrollContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  measurementCard: {
    gap: theme.spacing.sm,
  },
  measurementTitle: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  inputGroup: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
});
