import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import TreatmentCard from "@/components/health/treatments/treatment-card";
import TreatmentDetailsModal from "@/components/health/treatments/treatment-details-modal";
import TreatmentFormModal, {
  type TreatmentFormMode,
  type TreatmentFormSubmission,
} from "@/components/health/treatments/treatment-form-modal";
import TreatmentNoteModal from "@/components/health/treatments/treatment-note-modal";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import {
  treatmentDefinitions,
  type PatientTreatment,
  type TreatmentNote,
} from "@/constants/health/treatments";
import { theme } from "@/constants/theme";
import {
  mockPatientTreatments,
  mockTreatmentNotes,
} from "@/mockdata/treatments";

type TreatmentsView = "current" | "history";
type ActiveModal = "none" | "form" | "details" | "note";
type NoteMode = "create" | "edit";

function sortByDateDescending(left: string, right: string): number {
  return right.localeCompare(left);
}

export default function TreatmentsScreen() {
  const [treatments, setTreatments] = useState<PatientTreatment[]>(
    mockPatientTreatments,
  );
  const [treatmentNotes, setTreatmentNotes] =
    useState<TreatmentNote[]>(mockTreatmentNotes);
  const [selectedView, setSelectedView] = useState<TreatmentsView>("current");

  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(
    null,
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<ActiveModal>("none");
  const [formMode, setFormMode] = useState<TreatmentFormMode>("create");
  const [noteMode, setNoteMode] = useState<NoteMode>("create");

  const currentTreatments = useMemo(() => {
    return treatments
      .filter((item) => item.status === "ongoing")
      .sort((left, right) =>
        sortByDateDescending(left.startDate, right.startDate),
      );
  }, [treatments]);

  const historicalTreatments = useMemo(() => {
    return treatments
      .filter((item) => item.status !== "ongoing")
      .sort((left, right) => {
        const leftDate = left.endDate || left.startDate;
        const rightDate = right.endDate || right.startDate;
        return sortByDateDescending(leftDate, rightDate);
      });
  }, [treatments]);

  const selectedTreatment = useMemo(() => {
    if (!selectedTreatmentId) {
      return null;
    }

    return treatments.find((item) => item.id === selectedTreatmentId) ?? null;
  }, [selectedTreatmentId, treatments]);

  const selectedTreatmentNotes = useMemo(() => {
    if (!selectedTreatmentId) {
      return [];
    }

    return treatmentNotes.filter(
      (note) => note.patientTreatmentId === selectedTreatmentId,
    );
  }, [selectedTreatmentId, treatmentNotes]);

  const selectedNote = useMemo(() => {
    if (!selectedNoteId) {
      return null;
    }

    return treatmentNotes.find((note) => note.id === selectedNoteId) ?? null;
  }, [selectedNoteId, treatmentNotes]);

  function getTreatmentNoteCount(patientTreatmentId: string): number {
    return treatmentNotes.filter(
      (note) => note.patientTreatmentId === patientTreatmentId,
    ).length;
  }

  function closeAllModals() {
    setActiveModal("none");
    setSelectedNoteId(null);
  }

  function openCreateTreatmentModal() {
    setFormMode("create");
    setSelectedTreatmentId(null);
    setActiveModal("form");
  }

  function openDetails(patientTreatmentId: string) {
    setSelectedTreatmentId(patientTreatmentId);
    setSelectedNoteId(null);
    setActiveModal("details");
  }

  function openEditTreatment(patientTreatmentId: string) {
    setFormMode("edit");
    setSelectedTreatmentId(patientTreatmentId);
    setActiveModal("form");
  }

  function openEndTreatment(patientTreatmentId: string) {
    setFormMode("end");
    setSelectedTreatmentId(patientTreatmentId);
    setActiveModal("form");
  }

  function openAddNote(patientTreatmentId: string) {
    setSelectedTreatmentId(patientTreatmentId);
    setSelectedNoteId(null);
    setNoteMode("create");
    setActiveModal("note");
  }

  function openEditNote(noteId: string) {
    setSelectedNoteId(noteId);
    setNoteMode("edit");
    setActiveModal("note");
  }

  function saveTreatment(submission: TreatmentFormSubmission) {
    if (formMode === "create") {
      const nextTreatmentId = `pt-${Date.now()}`;

      const nextTreatment: PatientTreatment = {
        id: nextTreatmentId,
        treatmentId: submission.treatmentId,
        name: submission.name,
        startDate: submission.startDate,
        endDate: submission.endDate,
        expectedEndDate: submission.expectedEndDate,
        status: submission.status,
      };

      setTreatments((current) => [nextTreatment, ...current]);

      if (submission.initialNote) {
        const nextNote: TreatmentNote = {
          id: `tn-${Date.now()}`,
          patientTreatmentId: nextTreatmentId,
          date: submission.initialNote.date,
          notes: submission.initialNote.notes,
        };

        setTreatmentNotes((current) => [nextNote, ...current]);
      }

      closeAllModals();
      return;
    }

    if (!selectedTreatmentId) {
      closeAllModals();
      return;
    }

    setTreatments((current) =>
      current.map((item) => {
        if (item.id !== selectedTreatmentId) {
          return item;
        }

        return {
          ...item,
          treatmentId: submission.treatmentId,
          name: submission.name,
          startDate: submission.startDate,
          status: submission.status,
          endDate:
            submission.status === "ongoing" ? undefined : submission.endDate,
          expectedEndDate:
            submission.status === "ongoing"
              ? submission.expectedEndDate
              : undefined,
        };
      }),
    );

    closeAllModals();
  }

  function saveNote(value: { date: string; notes: string }) {
    if (!selectedTreatmentId) {
      closeAllModals();
      return;
    }

    if (noteMode === "create") {
      const nextNote: TreatmentNote = {
        id: `tn-${Date.now()}`,
        patientTreatmentId: selectedTreatmentId,
        date: value.date,
        notes: value.notes,
      };

      setTreatmentNotes((current) => [nextNote, ...current]);
      closeAllModals();
      return;
    }

    if (!selectedNoteId) {
      closeAllModals();
      return;
    }

    setTreatmentNotes((current) =>
      current.map((note) => {
        if (note.id !== selectedNoteId) {
          return note;
        }

        return {
          ...note,
          date: value.date,
          notes: value.notes,
        };
      }),
    );

    closeAllModals();
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.description}>
            Track ongoing and previous treatments, plus personal side effect
            experiences.
          </Text>
          <AppButton title="Add Treatment" onPress={openCreateTreatmentModal} />
        </View>

        <AppCard style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Treatment Overview</Text>
          <Text
            style={styles.overviewText}
          >{`Current records: ${currentTreatments.length}`}</Text>
          <Text
            style={styles.overviewText}
          >{`Previous records: ${historicalTreatments.length}`}</Text>
        </AppCard>

        <View style={styles.segmentRow}>
          {(
            [
              { id: "current", label: "Current Treatments" },
              { id: "history", label: "History" },
            ] as const
          ).map((segment) => {
            const selected = selectedView === segment.id;

            return (
              <Pressable
                key={segment.id}
                style={[
                  styles.segmentButton,
                  selected && styles.segmentButtonActive,
                ]}
                onPress={() => setSelectedView(segment.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selected && styles.segmentTextActive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {segment.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedView === "current" ? (
          <View style={styles.sectionStack}>
            {currentTreatments.length === 0 ? (
              <AppCard>
                <Text style={styles.emptyTitle}>No current treatments.</Text>
                <Text style={styles.emptyText}>
                  Add a treatment record to track ongoing care.
                </Text>
                <AppButton
                  title="Add Treatment"
                  onPress={openCreateTreatmentModal}
                />
              </AppCard>
            ) : (
              currentTreatments.map((treatment) => (
                <TreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  noteCount={getTreatmentNoteCount(treatment.id)}
                  onViewDetails={openDetails}
                />
              ))
            )}
          </View>
        ) : null}

        {selectedView === "history" ? (
          <View style={styles.sectionStack}>
            {historicalTreatments.length === 0 ? (
              <AppCard>
                <Text style={styles.emptyTitle}>No treatment history yet.</Text>
                <Text style={styles.emptyText}>
                  Completed and discontinued treatments will appear here.
                </Text>
              </AppCard>
            ) : (
              historicalTreatments.map((treatment) => (
                <TreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  noteCount={getTreatmentNoteCount(treatment.id)}
                  onViewDetails={openDetails}
                />
              ))
            )}
          </View>
        ) : null}
      </ScrollView>

      {activeModal === "details" && selectedTreatment ? (
        <TreatmentDetailsModal
          visible
          treatment={selectedTreatment}
          notes={selectedTreatmentNotes}
          onClose={closeAllModals}
          onEditTreatment={openEditTreatment}
          onEndTreatment={openEndTreatment}
          onAddNote={openAddNote}
          onEditNote={openEditNote}
        />
      ) : null}

      {activeModal === "form" ? (
        <TreatmentFormModal
          visible
          mode={formMode}
          treatmentDefinitions={treatmentDefinitions}
          initialTreatment={
            formMode === "create" || !selectedTreatment
              ? undefined
              : selectedTreatment
          }
          relatedNotes={
            formMode === "create" || !selectedTreatment
              ? []
              : selectedTreatmentNotes
          }
          onCancel={closeAllModals}
          onSave={saveTreatment}
        />
      ) : null}

      {activeModal === "note" && selectedTreatment ? (
        <TreatmentNoteModal
          visible
          mode={noteMode}
          treatmentName={selectedTreatment.name}
          treatmentStartDate={selectedTreatment.startDate}
          initialNote={
            noteMode === "edit" ? selectedNote || undefined : undefined
          }
          onCancel={() => {
            setSelectedNoteId(null);
            setActiveModal("details");
          }}
          onSave={saveNote}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  headerBlock: {
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.primaryText,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  overviewCard: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  overviewText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  segmentRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xs,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.primaryBlue,
  },
  segmentText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    textAlign: "center",
  },
  segmentTextActive: {
    color: theme.colors.background,
  },
  sectionStack: {
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
});
