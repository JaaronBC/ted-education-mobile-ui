import type { LabReport } from "@/constants/health/lab-measurements";

export const mockLabReports: LabReport[] = [
  {
    id: "lab-2026-11-10",
    collectedAt: "2026-11-10",
    pdfFileName: "thyroid-followup-2026-11-10.pdf",
    measurements: {
      tsh: {
        value: 1.8,
        unit: "mIU/L",
        referenceRange: { low: 0.4, high: 4.0 },
      },
      freeT4: {
        value: 1.1,
        unit: "ng/dL",
        referenceRange: { low: 0.8, high: 1.8 },
      },
      freeT3: { value: 3.1, unit: "pg/mL", referenceRange: null },
      trab: { value: 1.4, unit: "IU/L", referenceRange: { high: 1.75 } },
      tsi: { value: 132, unit: "%", referenceRange: { high: 140 } },
      tpo: { value: 84, unit: "IU/mL", referenceRange: { high: 35 } },
      selenium: {
        value: 95,
        unit: "mcg/L",
        referenceRange: { low: 70, high: 150 },
      },
    },
  },
  {
    id: "lab-2026-08-18",
    collectedAt: "2026-08-18",
    pdfFileName: "thyroid-followup-2026-08-18.pdf",
    measurements: {
      tsh: {
        value: 0.22,
        unit: "mIU/L",
        referenceRange: { low: 0.4, high: 4.0 },
      },
      freeT4: {
        value: 1.9,
        unit: "ng/dL",
        referenceRange: { low: 0.8, high: 1.8 },
      },
      freeT3: {
        value: 4.6,
        unit: "pg/mL",
        referenceRange: { low: 2.3, high: 4.2 },
      },
      trab: { value: 2.3, unit: "IU/L", referenceRange: { high: 1.75 } },
      tsi: null,
      tpo: { value: 110, unit: "IU/mL", referenceRange: { high: 35 } },
      selenium: {
        value: 64,
        unit: "mcg/L",
        referenceRange: { low: 70, high: 150 },
      },
    },
  },
  {
    id: "lab-2026-05-20",
    collectedAt: "2026-05-20",
    pdfFileName: "endocrine-panel-2026-05-20.pdf",
    measurements: {
      tsh: {
        value: 0.5,
        unit: "mIU/L",
        referenceRange: { low: 0.3, high: 4.2 },
      },
      freeT4: {
        value: 1.6,
        unit: "ng/dL",
        referenceRange: { low: 0.8, high: 1.8 },
      },
      freeT3: null,
      trab: { value: 1.7, unit: "IU/L", referenceRange: { high: 1.75 } },
      tsi: { value: 148, unit: "%", referenceRange: { high: 140 } },
      tpo: null,
      selenium: {
        value: 88,
        unit: "mcg/L",
        referenceRange: { low: 70, high: 150 },
      },
    },
  },
  {
    id: "lab-2026-02-05",
    collectedAt: "2026-02-05",
    pdfFileName: "initial-thyroid-labs-2026-02-05.pdf",
    measurements: {
      tsh: {
        value: 3.9,
        unit: "mIU/L",
        referenceRange: { low: 0.3, high: 4.2 },
      },
      freeT4: {
        value: 0.9,
        unit: "ng/dL",
        referenceRange: { low: 0.8, high: 1.8 },
      },
      freeT3: {
        value: 2.4,
        unit: "pg/mL",
        referenceRange: { low: 2.3, high: 4.2 },
      },
      trab: null,
      tsi: { value: 121, unit: "%", referenceRange: { high: 140 } },
      tpo: { value: 36, unit: "IU/mL", referenceRange: { high: 35 } },
      selenium: null,
    },
  },
];

export const mockReviewDraft = {
  pdfFileName: "uploaded-lab-report-draft.pdf",
  collectedAt: "2026-11-22",
  measurements: {
    tsh: { value: "1.6", unit: "mIU/L", low: "0.4", high: "4.0" },
    freeT4: { value: "1.2", unit: "ng/dL", low: "0.8", high: "1.8" },
    freeT3: { value: "", unit: "pg/mL", low: "", high: "" },
    trab: { value: "1.5", unit: "IU/L", low: "", high: "1.75" },
    tsi: { value: "", unit: "%", low: "", high: "140" },
    tpo: { value: "90", unit: "IU/mL", low: "", high: "35" },
    selenium: { value: "102", unit: "mcg/L", low: "70", high: "150" },
  },
} as const;
