import { AccessibleInput } from '@/components/ui/AccessibleInput';
import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useState } from "react";
import { Modal, ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import AppIcon from "@/components/ui/app-icon";
import {
  isValidImagingDate,
  type ImagingReport,
} from "@/features/health/constants/imaging-reports";
import { theme } from "@/constants/theme";

type ImagingReportFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  initialReport?: ImagingReport;
  onCancel: () => void;
  onSave: (report: ImagingReport) => void;
};

type ImagingReportFormValues = {
  fileName: string;
  fileUri: string;
  name: string;
  reportDate: string;
  location: string;
  notes: string;
};

type ImagingReportFormErrors = {
  fileName?: string;
  name?: string;
  reportDate?: string;
  location?: string;
};

function createInitialValues(
  initialReport?: ImagingReport,
): ImagingReportFormValues {
  if (initialReport) {
    return {
      fileName: initialReport.fileName,
      fileUri: initialReport.fileUri,
      name: initialReport.name,
      reportDate: initialReport.reportDate,
      location: initialReport.location,
      notes: initialReport.notes ?? "",
    };
  }

  return {
    fileName: "",
    fileUri: "",
    name: "",
    reportDate: "",
    location: "",
    notes: "",
  };
}

export default function ImagingReportFormModal({
  visible,
  mode,
  initialReport,
  onCancel,
  onSave,
}: ImagingReportFormModalProps) {
  const { tr: tr10 } = useLocale10();

  const [values, setValues] = useState<ImagingReportFormValues>(() =>
    createInitialValues(initialReport),
  );
  const [errors, setErrors] = useState<ImagingReportFormErrors>({});

  function updateField<K extends keyof ImagingReportFormValues>(
    field: K,
    value: ImagingReportFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function simulatePdfSelection() {
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `imaging-report-${timestamp}.pdf`;

    setValues((current) => ({
      ...current,
      fileName,
      fileUri: `mock://imaging/${fileName}`,
    }));
  }

  function validate(): ImagingReportFormErrors {
    const nextErrors: ImagingReportFormErrors = {};

    if (!values.fileName.trim() || !values.fileUri.trim()) {
      nextErrors.fileName = "Select a simulated report document.";
    }

    if (!values.name.trim()) {
      nextErrors.name = "Report name is required.";
    }

    if (!values.reportDate.trim()) {
      nextErrors.reportDate = "Report date is required.";
    } else if (!isValidImagingDate(values.reportDate.trim())) {
      nextErrors.reportDate = "Enter a valid report date (YYYY-MM-DD).";
    }

    if (!values.location.trim()) {
      nextErrors.location = "Facility or location is required.";
    }

    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const report: ImagingReport = {
      id: initialReport?.id ?? `imaging-${Date.now()}`,
      name: values.name.trim(),
      reportDate: values.reportDate.trim(),
      location: values.location.trim(),
      fileName: values.fileName.trim(),
      fileUri: values.fileUri.trim(),
      notes: values.notes.trim() ? values.notes.trim() : undefined,
    };

    onSave(report);
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
          <Text style={styles.title}>
            {mode === "create"
              ? tr10("Upload Imaging Report")
              : "Edit Report Details"}
          </Text>
          <Text style={styles.subtitle}>
            Record your imaging report details alongside the associated report
          </Text>

          <ScrollView contentContainerStyle={styles.formContent}>
            <AppCard style={styles.formCard}>
              <Text style={styles.label}>Simulated PDF</Text>
              <Pressable
                style={styles.selectButton}
                onPress={simulatePdfSelection}
                accessibilityRole="button"
                accessibilityLabel="Simulate selecting a PDF report"
              >
                <AppIcon
                  icon="Records"
                  size={20}
                  color={theme.colors.darkBlue}
                  strokeWidth={2}
                />
                <Text style={styles.selectButtonText}>
                  {values.fileName || "Select simulated report document"}
                </Text>
              </Pressable>
              {errors.fileName ? (
                <Text style={styles.errorText}>{errors.fileName}</Text>
              ) : null}
            </AppCard>

            <AppCard style={styles.formCard}>
              <Text style={styles.label}>Report name</Text>
              <AccessibleInput labelKey="Report name"
                value={values.name}
                onChangeText={(text) => updateField("name", text)}
                placeholder={tr10("Name")}
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}

              <Text style={styles.label}>Report date (YYYY-MM-DD)</Text>
              <AccessibleInput labelKey="Report date (YYYY-MM-DD)"
                value={values.reportDate}
                onChangeText={(text) => updateField("reportDate", text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
              />
              {errors.reportDate ? (
                <Text style={styles.errorText}>{errors.reportDate}</Text>
              ) : null}

              <Text style={styles.label}>Facility / location</Text>
              <AccessibleInput labelKey="Facility / location"
                value={values.location}
                onChangeText={(text) => updateField("location", text)}
                placeholder={tr10("Location")}
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
              />
              {errors.location ? (
                <Text style={styles.errorText}>{errors.location}</Text>
              ) : null}

              <Text style={styles.label}>Personal notes (optional)</Text>
              <AccessibleInput labelKey="Personal notes (optional)"
                value={values.notes}
                onChangeText={(text) => updateField("notes", text)}
                placeholder={tr10("Optional notes")}
                placeholderTextColor={theme.colors.secondaryText}
                style={[styles.input, styles.notesInput]}
                multiline
              />
            </AppCard>
          </ScrollView>

          <View style={styles.actionRow}>
            <AppButton title={tr10("Cancel")} variant="secondary" onPress={onCancel} />
            <AppButton title={tr10("Save Report")} onPress={handleSave} />
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
  formContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  formCard: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.background,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  selectButtonText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    flex: 1,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
});
