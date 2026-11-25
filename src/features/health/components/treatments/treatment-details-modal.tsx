import { useLanguage as useLocale10 } from '@/i18n/LanguageContext';
import { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "@/components/ui/app-button";
import {
  getTreatmentStatusLabel,
  type PatientTreatment,
  type TreatmentNote,
} from "@/features/health/constants/treatments";
import { theme } from "@/constants/theme";

type TreatmentDetailsModalProps = {
  visible: boolean;
  treatment: PatientTreatment;
  notes: TreatmentNote[];
  onClose: () => void;
  onEditTreatment: (patientTreatmentId: string) => void;
  onEndTreatment: (patientTreatmentId: string) => void;
  onAddNote: (patientTreatmentId: string) => void;
  onEditNote: (noteId: string) => void;
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

export default function TreatmentDetailsModal({
  visible,
  treatment,
  notes,
  onClose,
  onEditTreatment,
  onEndTreatment,
  onAddNote,
  onEditNote,
}: TreatmentDetailsModalProps) {
  const { tr: tr10 } = useLocale10();

  const orderedNotes = useMemo(() => {
    return [...notes].sort((left, right) =>
      right.date.localeCompare(left.date),
    );
  }, [notes]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.surface}>
          <Text style={styles.title}>{tr10("Treatment Details")}</Text>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.heading}>{treatment.name}</Text>
            <Text
              style={styles.meta}
            >{`Status: ${getTreatmentStatusLabel(treatment.status)}`}</Text>
            <Text
              style={styles.meta}
            >{`Date started: ${formatDateForDisplay(treatment.startDate)}`}</Text>
            {treatment.endDate ? (
              <Text
                style={styles.meta}
              >{`Date ended: ${formatDateForDisplay(treatment.endDate)}`}</Text>
            ) : null}
            {treatment.expectedEndDate ? (
              <Text
                style={styles.meta}
              >{`Expected end date: ${formatDateForDisplay(treatment.expectedEndDate)}`}</Text>
            ) : null}

            <View style={styles.notesSection}>
              <Text style={styles.notesHeading}>Side effect notes</Text>

              {orderedNotes.length === 0 ? (
                <Text style={styles.meta}>No side effect notes recorded.</Text>
              ) : (
                orderedNotes.map((note) => (
                  <View key={note.id} style={styles.noteRow}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteDate}>
                        {formatDateForDisplay(note.date)}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Edit side effect note"
                        onPress={() => onEditNote(note.id)}
                        style={styles.noteAction}
                      >
                        <Text style={styles.noteActionText}>Edit Note</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.noteText}>{note.notes}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          <View style={styles.actionsColumn}>
            <AppButton
              title="Edit Treatment"
              onPress={() => onEditTreatment(treatment.id)}
            />
            <AppButton
              title="Add Note"
              onPress={() => onAddNote(treatment.id)}
            />
            {treatment.status === "ongoing" ? (
              <AppButton
                title="End Treatment"
                variant="secondary"
                onPress={() => onEndTreatment(treatment.id)}
              />
            ) : null}
            <AppButton title={tr10("Close")} variant="secondary" onPress={onClose} />
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
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },
  heading: {
    ...theme.typography.subheading,
    color: theme.colors.primaryText,
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  notesSection: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  notesHeading: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  noteRow: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  noteDate: {
    ...theme.typography.caption,
    color: theme.colors.primaryBlue,
  },
  noteText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  noteAction: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  noteActionText: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
  },
  actionsColumn: {
    gap: theme.spacing.sm,
  },
});
