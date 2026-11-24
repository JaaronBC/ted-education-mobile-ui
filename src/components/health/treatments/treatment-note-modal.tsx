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
import type { TreatmentNote } from "@/constants/health/treatments";
import { theme } from "@/constants/theme";

type TreatmentNoteFormValue = {
  date: string;
  notes: string;
};

type TreatmentNoteModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  treatmentName: string;
  treatmentStartDate: string;
  initialNote?: TreatmentNote;
  onCancel: () => void;
  onSave: (value: TreatmentNoteFormValue) => void;
};

type NoteErrors = {
  date?: string;
  notes?: string;
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

export default function TreatmentNoteModal({
  visible,
  mode,
  treatmentName,
  treatmentStartDate,
  initialNote,
  onCancel,
  onSave,
}: TreatmentNoteModalProps) {
  const [date, setDate] = useState(
    initialNote?.date ?? toLocalDateKey(new Date()),
  );
  const [notes, setNotes] = useState(initialNote?.notes ?? "");
  const [errors, setErrors] = useState<NoteErrors>({});

  function validate(): NoteErrors {
    const nextErrors: NoteErrors = {};
    const trimmedDate = date.trim();
    const trimmedNotes = notes.trim();
    const todayKey = toLocalDateKey(new Date());

    if (!isValidDateKey(trimmedDate)) {
      nextErrors.date = "Enter a valid date (YYYY-MM-DD).";
    } else {
      if (trimmedDate > todayKey) {
        nextErrors.date = "Note date cannot be in the future.";
      } else if (trimmedDate < treatmentStartDate) {
        nextErrors.date =
          "Note date cannot be earlier than treatment start date.";
      }
    }

    if (!trimmedNotes) {
      nextErrors.notes = "Side effect description is required.";
    }

    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSave({
      date: date.trim(),
      notes: notes.trim(),
    });
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
              ? "Add Side Effect Note"
              : "Edit Side Effect Note"}
          </Text>
          <Text style={styles.subtitle}>{treatmentName}</Text>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Date experienced (YYYY-MM-DD)</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2026-11-24"
                placeholderTextColor={theme.colors.secondaryText}
                style={styles.input}
              />
              {errors.date ? (
                <Text style={styles.error}>{errors.date}</Text>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Side effect description</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Describe your experience"
                placeholderTextColor={theme.colors.secondaryText}
                style={[styles.input, styles.notesInput]}
                multiline
              />
              {errors.notes ? (
                <Text style={styles.error}>{errors.notes}</Text>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <AppButton title="Cancel" variant="secondary" onPress={onCancel} />
            <AppButton
              title={mode === "create" ? "Save Note" : "Update Note"}
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
    maxHeight: "85%",
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
    minHeight: 100,
    textAlignVertical: "top",
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
