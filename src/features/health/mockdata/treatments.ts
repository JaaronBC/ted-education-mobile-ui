import type {
  PatientTreatment,
  TreatmentNote,
} from "@/features/health/constants/treatments";

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, delta: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + delta);
  return next;
}

const now = new Date();
const fiveDaysAgo = toLocalDateKey(addDays(now, -5));
const threeWeeksAgo = toLocalDateKey(addDays(now, -21));
const twoMonthsAgo = toLocalDateKey(addDays(now, -60));
const threeMonthsAgo = toLocalDateKey(addDays(now, -90));
const fourMonthsAgo = toLocalDateKey(addDays(now, -120));
const sixMonthsAgo = toLocalDateKey(addDays(now, -180));
const eightMonthsAgo = toLocalDateKey(addDays(now, -240));
const tenMonthsAgo = toLocalDateKey(addDays(now, -300));
const oneYearAgo = toLocalDateKey(addDays(now, -365));
const inTwoWeeks = toLocalDateKey(addDays(now, 14));

export const mockPatientTreatments: PatientTreatment[] = [
  {
    id: "pt-tepezza-current",
    treatmentId: "teprotumumab",
    name: "Teprotumumab",
    startDate: threeWeeksAgo,
    expectedEndDate: inTwoWeeks,
    status: "ongoing",
  },
  {
    id: "pt-oral-steroids-current",
    treatmentId: "oral-steroids",
    name: "Oral steroids",
    startDate: fiveDaysAgo,
    status: "ongoing",
  },
  {
    id: "pt-iv-steroids-completed",
    treatmentId: "iv-steroids",
    name: "IV steroids",
    startDate: fourMonthsAgo,
    endDate: threeMonthsAgo,
    status: "completed",
  },
  {
    id: "pt-radioactive-iodine-discontinued",
    treatmentId: "radioactive-iodine",
    name: "Radioactive Iodine",
    startDate: tenMonthsAgo,
    endDate: eightMonthsAgo,
    status: "discontinued",
  },
  {
    id: "pt-tepezza-old-course",
    treatmentId: "teprotumumab",
    name: "Teprotumumab",
    startDate: oneYearAgo,
    endDate: sixMonthsAgo,
    status: "completed",
  },
  {
    id: "pt-custom-no-notes",
    name: "Occupational vision therapy",
    startDate: twoMonthsAgo,
    endDate: threeWeeksAgo,
    status: "completed",
  },
];

export const mockTreatmentNotes: TreatmentNote[] = [
  {
    id: "note-tepezza-current-1",
    patientTreatmentId: "pt-tepezza-current",
    date: toLocalDateKey(addDays(now, -16)),
    notes: "Mild pressure sensation around the eyes after infusion day.",
  },
  {
    id: "note-tepezza-current-2",
    patientTreatmentId: "pt-tepezza-current",
    date: toLocalDateKey(addDays(now, -10)),
    notes: "Noticed occasional muscle cramps in the evening.",
  },
  {
    id: "note-oral-current-1",
    patientTreatmentId: "pt-oral-steroids-current",
    date: toLocalDateKey(addDays(now, -2)),
    notes: "Difficulty sleeping on the first two nights.",
  },
  {
    id: "note-iv-completed-1",
    patientTreatmentId: "pt-iv-steroids-completed",
    date: toLocalDateKey(addDays(now, -110)),
    notes: "Felt jittery after treatment sessions.",
  },
  {
    id: "note-iv-completed-2",
    patientTreatmentId: "pt-iv-steroids-completed",
    date: toLocalDateKey(addDays(now, -95)),
    notes: "Symptoms settled a few days after the final session.",
  },
  {
    id: "note-radioactive-discontinued-1",
    patientTreatmentId: "pt-radioactive-iodine-discontinued",
    date: toLocalDateKey(addDays(now, -220)),
    notes: "Stopped after discussing side effects with care team.",
  },
  {
    id: "note-tepezza-old-course-post-end",
    patientTreatmentId: "pt-tepezza-old-course",
    date: toLocalDateKey(addDays(now, -170)),
    notes: "Eye dryness continued for a few weeks after treatment ended.",
  },
];
