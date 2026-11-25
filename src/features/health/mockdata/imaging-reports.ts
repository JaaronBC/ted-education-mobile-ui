import type { ImagingReport } from "@/features/health/constants/imaging-reports";

export const mockImagingReports: ImagingReport[] = [
  {
    id: "imaging-2026-11-18-ct-orbits",
    name: "CT Orbits",
    reportDate: "2026-11-18",
    location: "Queen's Medical Center",
    fileName: "ct-orbits-2026-11-18.pdf",
    fileUri: "mock://imaging/ct-orbits-2026-11-18.pdf",
    notes: "Follow-up scan after treatment adjustment.",
  },
  {
    id: "imaging-2026-08-24-mri-orbits",
    name: "MRI Orbits",
    reportDate: "2026-08-24",
    location: "Straub Medical Center",
    fileName: "mri-orbits-2026-08-24.pdf",
    fileUri: "mock://imaging/mri-orbits-2026-08-24.pdf",
    notes: "Initial baseline MRI for comparison.",
  },
  {
    id: "imaging-2026-05-12-ct-orbits",
    name: "CT Orbits",
    reportDate: "2026-05-12",
    location: "Queen's Medical Center",
    fileName: "ct-orbits-2026-05-12.pdf",
    fileUri: "mock://imaging/ct-orbits-2026-05-12.pdf",
  },
];
