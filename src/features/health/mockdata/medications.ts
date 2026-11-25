import type {
  MedicationLog,
  PatientMedication,
} from "@/features/health/constants/medications";
import {
  buildScheduledOccurrenceId,
  combineLocalDateAndTime,
  toLocalDateKey,
} from "@/features/health/utils/medication-schedule";

function addDays(base: Date, delta: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + delta);
  return next;
}

function findMostRecentWeekdayDate(base: Date, weekday: number): string {
  const current = new Date(base);

  while (current.getDay() !== weekday) {
    current.setDate(current.getDate() - 1);
  }

  return toLocalDateKey(current);
}

const now = new Date();
const todayKey = toLocalDateKey(now);
const yesterdayKey = toLocalDateKey(addDays(now, -1));
const weekAgoKey = toLocalDateKey(addDays(now, -7));
const twoWeeksAgoKey = toLocalDateKey(addDays(now, -14));
const mostRecentMondayKey = findMostRecentWeekdayDate(now, 1);

const levothyroxineTodayOccurrenceId = buildScheduledOccurrenceId(
  "pm-levothyroxine",
  todayKey,
  "08:00",
);

export const mockPatientMedications: PatientMedication[] = [
  {
    id: "pm-levothyroxine",
    medicationId: "levothyroxine",
    name: "Levothyroxine",
    brandName: "Synthroid",
    dose: 100,
    unit: "mcg",
    schedule: {
      type: "daily",
      times: ["08:00"],
    },
    startDate: twoWeeksAgoKey,
    remindersEnabled: true,
    isActive: true,
    notes: "Take on an empty stomach.",
  },
  {
    id: "pm-methimazole",
    medicationId: "methimazole",
    name: "Methimazole",
    brandName: "Tapazole",
    dose: 5,
    unit: "mg",
    schedule: {
      type: "daily",
      times: ["08:00", "18:00"],
    },
    startDate: weekAgoKey,
    remindersEnabled: false,
    isActive: true,
  },
  {
    id: "pm-ptu-weekly",
    medicationId: "propylthiouracil",
    name: "Propylthiouracil",
    brandName: "PTU",
    dose: 50,
    unit: "mg",
    schedule: {
      type: "weekly",
      days: [1],
      times: ["09:00"],
    },
    startDate: twoWeeksAgoKey,
    remindersEnabled: true,
    isActive: true,
    notes: "Weekly check-in medication for mockup flow.",
  },
  {
    id: "pm-artificial-tears",
    name: "Artificial Tears",
    dose: 1,
    unit: "mL",
    schedule: {
      type: "as-needed",
    },
    startDate: weekAgoKey,
    remindersEnabled: false,
    isActive: true,
    notes: "Use when eyes feel dry.",
  },
  {
    id: "pm-liothyronine-inactive",
    medicationId: "liothyronine",
    name: "Liothyronine",
    brandName: "Cytomel",
    dose: 5,
    unit: "mcg",
    schedule: {
      type: "daily",
      times: ["07:30"],
    },
    startDate: toLocalDateKey(addDays(now, -40)),
    endDate: weekAgoKey,
    remindersEnabled: false,
    isActive: false,
    notes: "Inactive example with preserved history.",
  },
];

export const mockMedicationLogs: MedicationLog[] = [
  {
    id: "log-levothyroxine-today",
    patientMedicationId: "pm-levothyroxine",
    scheduledOccurrenceId: levothyroxineTodayOccurrenceId,
    scheduledAt: combineLocalDateAndTime(todayKey, "08:00"),
    takenAt: combineLocalDateAndTime(todayKey, "08:05"),
    dose: 100,
    unit: "mcg",
    notes: "Taken with water.",
  },
  {
    id: "log-methimazole-yesterday",
    patientMedicationId: "pm-methimazole",
    scheduledOccurrenceId: buildScheduledOccurrenceId(
      "pm-methimazole",
      yesterdayKey,
      "18:00",
    ),
    scheduledAt: combineLocalDateAndTime(yesterdayKey, "18:00"),
    takenAt: combineLocalDateAndTime(yesterdayKey, "18:10"),
    dose: 5,
    unit: "mg",
  },
  {
    id: "log-liothyronine-old",
    patientMedicationId: "pm-liothyronine-inactive",
    scheduledOccurrenceId: buildScheduledOccurrenceId(
      "pm-liothyronine-inactive",
      mostRecentMondayKey,
      "07:30",
    ),
    scheduledAt: combineLocalDateAndTime(mostRecentMondayKey, "07:30"),
    takenAt: combineLocalDateAndTime(mostRecentMondayKey, "07:40"),
    dose: 5,
    unit: "mcg",
    notes: "Historical log should remain after deactivation.",
  },
];
