import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MedicationCard from "@/components/health/medications/medication-card";
import MedicationDoseCard from "@/components/health/medications/medication-dose-card";
import MedicationFormModal from "@/components/health/medications/medication-form-modal";
import MedicationHistory from "@/components/health/medications/medication-history";
import MedicationLogModal from "@/components/health/medications/medication-log-modal";
import AppButton from "@/components/ui/app-button";
import AppCard from "@/components/ui/app-card";
import ScreenContainer from "@/components/ui/screen-container";
import {
  medicationDefinitions,
  type MedicationLog,
  type PatientMedication,
} from "@/constants/health/medications";
import { theme } from "@/constants/theme";
import {
  mockMedicationLogs,
  mockPatientMedications,
} from "@/mockdata/medications";
import {
  getCandidateOccurrencesForMedicationDate,
  getScheduledOccurrencesForDate,
  getTodayOverview,
  hasLogForOccurrence,
  toLocalDateKey,
} from "@/utils/health/medication-schedule";

type MedicationsView = "today" | "my-medications" | "history";

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<PatientMedication[]>(
    mockPatientMedications,
  );
  const [logs, setLogs] = useState<MedicationLog[]>(mockMedicationLogs);
  const [selectedView, setSelectedView] = useState<MedicationsView>("today");
  const [historyFilterMedicationId, setHistoryFilterMedicationId] = useState<
    string | "all"
  >("all");
  const [historyFilterOpen, setHistoryFilterOpen] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | null
  >(null);

  const [logModalVisible, setLogModalVisible] = useState(false);

  const todayKey = toLocalDateKey(new Date());

  const todayOccurrences = useMemo(
    () => getScheduledOccurrencesForDate(medications, todayKey),
    [medications, todayKey],
  );

  const overview = useMemo(
    () => getTodayOverview(medications, logs, new Date()),
    [medications, logs],
  );

  const selectedMedication = useMemo(() => {
    if (!selectedMedicationId) {
      return null;
    }

    return medications.find((item) => item.id === selectedMedicationId) ?? null;
  }, [medications, selectedMedicationId]);

  const activeMedications = medications.filter((item) => item.isActive);
  const inactiveMedications = medications.filter((item) => !item.isActive);

  function openCreateMedication() {
    setFormMode("create");
    setSelectedMedicationId(null);
    setFormVisible(true);
  }

  function openEditMedication(medicationId: string) {
    setFormMode("edit");
    setSelectedMedicationId(medicationId);
    setFormVisible(true);
  }

  function openManualLog(medicationId: string) {
    setSelectedMedicationId(medicationId);
    setLogModalVisible(true);
  }

  function saveMedication(nextMedication: PatientMedication) {
    if (formMode === "edit") {
      setMedications((current) =>
        current.map((item) =>
          item.id === nextMedication.id ? nextMedication : item,
        ),
      );
      setFormVisible(false);
      return;
    }

    setMedications((current) => [nextMedication, ...current]);
    setFormVisible(false);
  }

  function saveManualLog(nextLog: MedicationLog) {
    setLogs((current) => [nextLog, ...current]);
    setLogModalVisible(false);
  }

  function markOccurrenceTaken(occurrenceId: string) {
    const occurrence = todayOccurrences.find(
      (item) => item.id === occurrenceId,
    );

    if (!occurrence) {
      return;
    }

    if (hasLogForOccurrence(logs, occurrenceId)) {
      return;
    }

    const nextLog: MedicationLog = {
      id: `log-${Date.now()}`,
      patientMedicationId: occurrence.patientMedicationId,
      scheduledOccurrenceId: occurrence.id,
      scheduledAt: occurrence.scheduledAt,
      takenAt: new Date().toISOString(),
      dose: occurrence.dose,
      unit: occurrence.unit,
    };

    setLogs((current) => [nextLog, ...current]);
  }

  function undoOccurrenceTaken(occurrenceId: string) {
    setLogs((current) =>
      current.filter((log) => log.scheduledOccurrenceId !== occurrenceId),
    );
  }

  function toggleReminder(medicationId: string) {
    setMedications((current) =>
      current.map((item) => {
        if (item.id !== medicationId) {
          return item;
        }

        const supportsReminders =
          item.schedule.type === "daily" || item.schedule.type === "weekly";

        if (!supportsReminders) {
          return item;
        }

        return {
          ...item,
          remindersEnabled: !item.remindersEnabled,
        };
      }),
    );
  }

  function deactivateMedication(medicationId: string) {
    setMedications((current) =>
      current.map((item) =>
        item.id === medicationId ? { ...item, isActive: false } : item,
      ),
    );
  }

  function reactivateMedication(medicationId: string) {
    setMedications((current) =>
      current.map((item) =>
        item.id === medicationId ? { ...item, isActive: true } : item,
      ),
    );
  }

  const progressPercent = Math.round(overview.progressRatio * 100);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.description}>
            Manage medications, track doses, and configure reminders.
          </Text>
          <AppButton title="Add Medication" onPress={openCreateMedication} />
        </View>

        <AppCard style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Medication Overview</Text>
          <Text
            style={styles.overviewText}
          >{`Active medications: ${overview.activeMedicationCount}`}</Text>
          <Text
            style={styles.overviewText}
          >{`Taken today: ${overview.takenCount} of ${overview.scheduledCount}`}</Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(0, Math.min(100, progressPercent))}%` },
              ]}
            />
          </View>
          <Text
            style={styles.progressLabel}
          >{`${progressPercent}% of scheduled doses recorded`}</Text>
        </AppCard>

        <View style={styles.segmentRow}>
          {(
            [
              { id: "today", label: "Today" },
              { id: "my-medications", label: "My Medications" },
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
                onPress={() => {
                  setSelectedView(segment.id);
                  setHistoryFilterOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={[
                    styles.segmentText,
                    selected && styles.segmentTextActive,
                  ]}
                >
                  {segment.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedView === "today" ? (
          <View style={styles.sectionStack}>
            {todayOccurrences.length === 0 ? (
              <AppCard>
                <Text style={styles.emptyTitle}>No scheduled doses today.</Text>
                <Text style={styles.emptyText}>
                  Add medications or adjust schedules to populate today&apos;s
                  view.
                </Text>
              </AppCard>
            ) : (
              todayOccurrences.map((occurrence) => {
                const medication = medications.find(
                  (item) => item.id === occurrence.patientMedicationId,
                );

                if (!medication) {
                  return null;
                }

                return (
                  <MedicationDoseCard
                    key={occurrence.id}
                    medication={medication}
                    scheduledOccurrenceId={occurrence.id}
                    scheduledAt={occurrence.scheduledAt}
                    isTaken={hasLogForOccurrence(logs, occurrence.id)}
                    onMarkTaken={markOccurrenceTaken}
                    onUndoTaken={undoOccurrenceTaken}
                  />
                );
              })
            )}
          </View>
        ) : null}

        {selectedView === "my-medications" ? (
          <View style={styles.sectionStack}>
            {activeMedications.length === 0 ? (
              <AppCard>
                <Text style={styles.emptyTitle}>No active medications.</Text>
                <Text style={styles.emptyText}>
                  Add a medication to start tracking doses.
                </Text>
                <AppButton
                  title="Add Medication"
                  onPress={openCreateMedication}
                />
              </AppCard>
            ) : (
              activeMedications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onEdit={openEditMedication}
                  onManualLog={openManualLog}
                  onToggleReminder={toggleReminder}
                  onDeactivate={deactivateMedication}
                  onReactivate={reactivateMedication}
                />
              ))
            )}

            {inactiveMedications.length > 0 ? (
              <View style={styles.sectionStack}>
                <Text style={styles.sectionTitle}>Inactive Medications</Text>
                {inactiveMedications.map((medication) => (
                  <MedicationCard
                    key={medication.id}
                    medication={medication}
                    onEdit={openEditMedication}
                    onManualLog={openManualLog}
                    onToggleReminder={toggleReminder}
                    onDeactivate={deactivateMedication}
                    onReactivate={reactivateMedication}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {selectedView === "history" ? (
          <MedicationHistory
            logs={logs}
            medications={medications}
            selectedMedicationId={historyFilterMedicationId}
            onChangeSelectedMedicationId={(value) => {
              setHistoryFilterMedicationId(value);
              setHistoryFilterOpen(false);
            }}
            filterMenuOpen={historyFilterOpen}
            onToggleFilterMenu={() =>
              setHistoryFilterOpen((current) => !current)
            }
          />
        ) : null}
      </ScrollView>

      {formVisible ? (
        <MedicationFormModal
          key={formMode === "edit" ? `edit-${selectedMedicationId}` : "create"}
          visible={formVisible}
          mode={formMode}
          medicationDefinitions={medicationDefinitions}
          initialMedication={
            formMode === "edit" && selectedMedication
              ? selectedMedication
              : undefined
          }
          onCancel={() => setFormVisible(false)}
          onSave={saveMedication}
        />
      ) : null}

      {logModalVisible && selectedMedication ? (
        <MedicationLogModal
          visible={logModalVisible}
          medication={selectedMedication}
          existingLogs={logs}
          scheduledOccurrences={getCandidateOccurrencesForMedicationDate(
            medications,
            selectedMedication.id,
            todayKey,
          )}
          onCancel={() => setLogModalVisible(false)}
          onSave={saveManualLog}
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
  progressTrack: {
    height: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
    marginTop: theme.spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success,
  },
  progressLabel: {
    ...theme.typography.caption,
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
    borderRadius: theme.borderRadius.full,
    minHeight: 40,
    paddingHorizontal: theme.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
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
