export type MedicationDefinition = {
  id: string;
  name: string;
  brandNames: string[];
  category: "thyroid-hormone" | "antithyroid";
};

export type MedicationSchedule =
  | {
      type: "daily";
      times: string[];
    }
  | {
      type: "weekly";
      days: number[];
      times: string[];
    }
  | {
      type: "as-needed";
    }
  | {
      type: "custom";
      instructions: string;
    };

export type PatientMedication = {
  id: string;
  medicationId?: string;
  name: string;
  brandName?: string;
  dose: number;
  unit: string;
  schedule: MedicationSchedule;
  startDate: string;
  endDate?: string;
  remindersEnabled: boolean;
  isActive: boolean;
  notes?: string;
};

export type MedicationLog = {
  id: string;
  patientMedicationId: string;
  scheduledOccurrenceId?: string;
  scheduledAt?: string;
  takenAt: string;
  dose: number;
  unit: string;
  notes?: string;
};

export type ScheduledMedicationDose = {
  id: string;
  patientMedicationId: string;
  scheduledAt: string;
  dose: number;
  unit: string;
};

export const medicationDefinitions: MedicationDefinition[] = [
  {
    id: "levothyroxine",
    name: "Levothyroxine",
    brandNames: ["Synthroid", "Levoxyl", "Unithroid", "Tirosint"],
    category: "thyroid-hormone",
  },
  {
    id: "liothyronine",
    name: "Liothyronine",
    brandNames: ["Cytomel", "Triostat"],
    category: "thyroid-hormone",
  },
  {
    id: "liotrix",
    name: "Liotrix",
    brandNames: ["Thyrolar"],
    category: "thyroid-hormone",
  },
  {
    id: "desiccated-thyroid",
    name: "Desiccated Thyroid",
    brandNames: [],
    category: "thyroid-hormone",
  },
  {
    id: "methimazole",
    name: "Methimazole",
    brandNames: ["Tapazole"],
    category: "antithyroid",
  },
  {
    id: "propylthiouracil",
    name: "Propylthiouracil",
    brandNames: ["PTU"],
    category: "antithyroid",
  },
];

export const medicationCategories = [
  { id: "thyroid-hormone", label: "Thyroid hormone medications" },
  { id: "antithyroid", label: "Antithyroid medications" },
] as const;

export const doseUnits = ["mcg", "mg", "mL", "Tablet(s)", "Other"] as const;

export type DoseUnitOption = (typeof doseUnits)[number];

export const frequencyOptions = [
  { id: "once-daily", label: "Once daily" },
  { id: "twice-daily", label: "Twice daily" },
  { id: "three-daily", label: "Three times daily" },
  { id: "weekly", label: "Weekly" },
  { id: "as-needed", label: "As needed" },
  { id: "custom", label: "Custom" },
] as const;

export type FrequencyOptionId = (typeof frequencyOptions)[number]["id"];

export const weekdayOptions = [
  { id: 0, label: "Sunday" },
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
];

export function formatScheduleSummary(schedule: MedicationSchedule): string {
  if (schedule.type === "daily") {
    if (schedule.times.length === 1) {
      return `Daily at ${schedule.times[0]}`;
    }

    return `${schedule.times.length} times daily (${schedule.times.join(", ")})`;
  }

  if (schedule.type === "weekly") {
    const dayText = schedule.days
      .map((day) => weekdayOptions.find((option) => option.id === day)?.label)
      .filter((label): label is string => Boolean(label))
      .join(", ");

    return `Weekly on ${dayText || "selected day"} at ${schedule.times.join(", ")}`;
  }

  if (schedule.type === "as-needed") {
    return "As needed";
  }

  return `Custom: ${schedule.instructions}`;
}
