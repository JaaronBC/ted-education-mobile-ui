export type TreatmentDefinition = {
  id: string;
  name: string;
};

export type TreatmentStatus = "ongoing" | "completed" | "discontinued";

export type PatientTreatment = {
  id: string;
  treatmentId?: string;
  name: string;
  startDate: string;
  endDate?: string;
  expectedEndDate?: string;
  status: TreatmentStatus;
};

export type TreatmentNote = {
  id: string;
  patientTreatmentId: string;
  date: string;
  notes: string;
};

export const treatmentDefinitions: TreatmentDefinition[] = [
  {
    id: "teprotumumab",
    name: "Teprotumumab",
  },
  {
    id: "veligrotug",
    name: "Veligrotug",
  },
  {
    id: "iv-steroids",
    name: "IV steroids",
  },
  {
    id: "oral-steroids",
    name: "Oral steroids",
  },
  {
    id: "orbital-radiation",
    name: "Orbital Radiation",
  },
  {
    id: "radioactive-iodine",
    name: "Radioactive Iodine",
  },
  {
    id: "satralizumab",
    name: "Satralizumab",
  },
];

export const treatmentStatusOptions: { id: TreatmentStatus; label: string }[] =
  [
    { id: "ongoing", label: "Ongoing" },
    { id: "completed", label: "Completed" },
    { id: "discontinued", label: "Discontinued" },
  ];

export function getTreatmentStatusLabel(status: TreatmentStatus): string {
  const found = treatmentStatusOptions.find((option) => option.id === status);
  return found ? found.label : status;
}
