import type {
  MedicationLog,
  MedicationSchedule,
  PatientMedication,
} from "@/constants/health/medications";

export type ScheduledOccurrence = {
  id: string;
  patientMedicationId: string;
  scheduledAt: string;
  dose: number;
  unit: string;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return toLocalDateKey(parsed) === value;
}

export function isValidTimeKey(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function combineLocalDateAndTime(
  dateKey: string,
  timeKey: string,
): string {
  return `${dateKey}T${timeKey}:00`;
}

export function formatDateForDisplay(dateKey: string): string {
  const parsed = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return dateKey;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTimeForDisplay(timeKey: string): string {
  if (!isValidTimeKey(timeKey)) {
    return timeKey;
  }

  const [hourText, minuteText] = timeKey.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function buildScheduledOccurrenceId(
  patientMedicationId: string,
  localDate: string,
  time: string,
): string {
  return `${patientMedicationId}__${localDate}__${time}`;
}

function isMedicationActiveOnDate(
  medication: PatientMedication,
  localDate: string,
): boolean {
  if (!medication.isActive) {
    return false;
  }

  if (localDate < medication.startDate) {
    return false;
  }

  if (medication.endDate && localDate > medication.endDate) {
    return false;
  }

  return true;
}

function hasScheduleForLocalDate(
  schedule: MedicationSchedule,
  localDate: string,
): boolean {
  if (schedule.type === "daily") {
    return true;
  }

  if (schedule.type === "weekly") {
    const weekday = new Date(`${localDate}T00:00:00`).getDay();
    return schedule.days.includes(weekday);
  }

  return false;
}

function getScheduleTimes(schedule: MedicationSchedule): string[] {
  if (schedule.type === "daily" || schedule.type === "weekly") {
    return schedule.times;
  }

  return [];
}

export function getScheduledOccurrencesForDate(
  medications: PatientMedication[],
  localDate: string,
): ScheduledOccurrence[] {
  const occurrences: ScheduledOccurrence[] = [];

  for (const medication of medications) {
    if (!isMedicationActiveOnDate(medication, localDate)) {
      continue;
    }

    if (!hasScheduleForLocalDate(medication.schedule, localDate)) {
      continue;
    }

    const times = getScheduleTimes(medication.schedule);

    for (const time of times) {
      if (!isValidTimeKey(time)) {
        continue;
      }

      const scheduledAt = combineLocalDateAndTime(localDate, time);

      occurrences.push({
        id: buildScheduledOccurrenceId(medication.id, localDate, time),
        patientMedicationId: medication.id,
        scheduledAt,
        dose: medication.dose,
        unit: medication.unit,
      });
    }
  }

  occurrences.sort((left, right) => {
    return left.scheduledAt.localeCompare(right.scheduledAt);
  });

  return occurrences;
}

export function hasLogForOccurrence(
  logs: MedicationLog[],
  occurrenceId: string,
): boolean {
  return logs.some((log) => log.scheduledOccurrenceId === occurrenceId);
}

export function getTodayOverview(
  medications: PatientMedication[],
  logs: MedicationLog[],
  today: Date,
): {
  activeMedicationCount: number;
  scheduledCount: number;
  takenCount: number;
  progressRatio: number;
} {
  const localDate = toLocalDateKey(today);
  const occurrences = getScheduledOccurrencesForDate(medications, localDate);

  const takenCount = occurrences.reduce((count, occurrence) => {
    return hasLogForOccurrence(logs, occurrence.id) ? count + 1 : count;
  }, 0);

  const scheduledCount = occurrences.length;
  const activeMedicationCount = medications.filter(
    (medication) => medication.isActive,
  ).length;

  const progressRatio =
    scheduledCount === 0 ? 0 : Math.min(1, takenCount / scheduledCount);

  return {
    activeMedicationCount,
    scheduledCount,
    takenCount,
    progressRatio,
  };
}

export function groupLogsByLocalDate(
  logs: MedicationLog[],
): { dateKey: string; logs: MedicationLog[] }[] {
  const map = new Map<string, MedicationLog[]>();

  for (const log of logs) {
    const date = new Date(log.takenAt);
    const dateKey = Number.isNaN(date.getTime())
      ? log.takenAt.slice(0, 10)
      : toLocalDateKey(date);

    const group = map.get(dateKey) ?? [];
    group.push(log);
    map.set(dateKey, group);
  }

  const groups = [...map.entries()].map(([dateKey, groupLogs]) => {
    groupLogs.sort((left, right) => right.takenAt.localeCompare(left.takenAt));

    return {
      dateKey,
      logs: groupLogs,
    };
  });

  groups.sort((left, right) => right.dateKey.localeCompare(left.dateKey));

  return groups;
}

export function getCandidateOccurrencesForMedicationDate(
  medications: PatientMedication[],
  patientMedicationId: string,
  localDate: string,
): ScheduledOccurrence[] {
  const occurrences = getScheduledOccurrencesForDate(medications, localDate);
  return occurrences.filter(
    (occurrence) => occurrence.patientMedicationId === patientMedicationId,
  );
}
