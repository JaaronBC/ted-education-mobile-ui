import { Pressable, StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import type {
  MedicationLog,
  PatientMedication,
} from "@/constants/health/medications";
import { theme } from "@/constants/theme";
import {
  formatDateForDisplay,
  formatTimeForDisplay,
  groupLogsByLocalDate,
} from "@/utils/health/medication-schedule";

type MedicationHistoryProps = {
  logs: MedicationLog[];
  medications: PatientMedication[];
  selectedMedicationId: string | "all";
  onChangeSelectedMedicationId: (value: string | "all") => void;
  filterMenuOpen: boolean;
  onToggleFilterMenu: () => void;
};

export default function MedicationHistory({
  logs,
  medications,
  selectedMedicationId,
  onChangeSelectedMedicationId,
  filterMenuOpen,
  onToggleFilterMenu,
}: MedicationHistoryProps) {
  const filteredLogs =
    selectedMedicationId === "all"
      ? logs
      : logs.filter((log) => log.patientMedicationId === selectedMedicationId);

  const groupedLogs = groupLogsByLocalDate(filteredLogs);

  const selectedLabel =
    selectedMedicationId === "all"
      ? "All medications"
      : (medications.find(
          (medication) => medication.id === selectedMedicationId,
        )?.name ?? "Medication");

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Medication History</Text>
        <View style={styles.filterMenuContainer}>
          <Pressable style={styles.filterTrigger} onPress={onToggleFilterMenu}>
            <Text
              style={styles.filterTriggerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedLabel}
            </Text>
          </Pressable>

          {filterMenuOpen ? (
            <View style={styles.filterMenu}>
              <Pressable
                style={styles.filterOption}
                onPress={() => onChangeSelectedMedicationId("all")}
              >
                <Text style={styles.filterOptionText}>All medications</Text>
              </Pressable>

              {medications.map((medication) => (
                <Pressable
                  key={medication.id}
                  style={styles.filterOption}
                  onPress={() => onChangeSelectedMedicationId(medication.id)}
                >
                  <Text style={styles.filterOptionText}>{medication.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      {groupedLogs.length === 0 ? (
        <AppCard>
          <Text style={styles.emptyText}>No medication logs available.</Text>
        </AppCard>
      ) : (
        groupedLogs.map((group) => (
          <View key={group.dateKey} style={styles.group}>
            <Text style={styles.groupDate}>
              {formatDateForDisplay(group.dateKey)}
            </Text>

            {group.logs.map((log) => {
              const medication = medications.find(
                (item) => item.id === log.patientMedicationId,
              );

              const time =
                log.takenAt.length >= 16 ? log.takenAt.slice(11, 16) : "";

              return (
                <AppCard key={log.id} style={styles.logCard}>
                  <Text style={styles.logName}>
                    {medication?.name ?? "Medication"}
                  </Text>
                  <Text
                    style={styles.logMeta}
                  >{`Taken: ${time ? formatTimeForDisplay(time) : "—"}`}</Text>
                  <Text
                    style={styles.logMeta}
                  >{`Dose: ${log.dose} ${log.unit}`}</Text>
                  {log.notes ? (
                    <Text style={styles.logMeta}>{`Notes: ${log.notes}`}</Text>
                  ) : null}
                </AppCard>
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.heading,
    color: theme.colors.primaryText,
  },
  filterMenuContainer: {
    width: 170,
    maxWidth: "55%",
    alignItems: "stretch",
    flexShrink: 0,
    position: "relative",
  },
  filterTrigger: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  filterTriggerText: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
    textAlign: "center",
  },
  filterMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    width: 170,
    maxWidth: "100%",
    overflow: "hidden",
    zIndex: 20,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  filterOptionText: {
    ...theme.typography.caption,
    color: theme.colors.primaryText,
    flexShrink: 1,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  group: {
    gap: theme.spacing.xs,
  },
  groupDate: {
    ...theme.typography.subheading,
    color: theme.colors.primaryText,
  },
  logCard: {
    gap: theme.spacing.xs,
  },
  logName: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  logMeta: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
});
