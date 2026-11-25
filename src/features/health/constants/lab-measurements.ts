export type LabMeasurementId =
  "tsh" | "freeT4" | "freeT3" | "trab" | "tsi" | "tpo" | "selenium";

export type LabReferenceRange = {
  low?: number;
  high?: number;
};

export type LabMeasurementResult = {
  value: number;
  unit: string;
  referenceRange?: LabReferenceRange | null;
};

export type LabReport = {
  id: string;
  collectedAt: string;
  pdfFileName: string;
  measurements: Record<LabMeasurementId, LabMeasurementResult | null>;
};

export type LabRangeStatus =
  | "within-range"
  | "above-range"
  | "below-range"
  | "not-reported"
  | "reference-range-unavailable";

export type LabMeasurementDefinition = {
  id: LabMeasurementId;
  name: string;
  shortName: string;
  defaultUnit: string;
};

export const labMeasurementDefinitions: LabMeasurementDefinition[] = [
  {
    id: "tsh",
    name: "Thyroid Stimulating Hormone",
    shortName: "TSH",
    defaultUnit: "mIU/L",
  },
  {
    id: "freeT4",
    name: "Free T4",
    shortName: "Free T4",
    defaultUnit: "ng/dL",
  },
  {
    id: "freeT3",
    name: "Free T3",
    shortName: "Free T3",
    defaultUnit: "pg/mL",
  },
  {
    id: "trab",
    name: "Thyroid Receptor Antibodies",
    shortName: "TRAb",
    defaultUnit: "IU/L",
  },
  {
    id: "tsi",
    name: "Thyroid Stimulating Immunoglobulin",
    shortName: "TSI",
    defaultUnit: "%",
  },
  {
    id: "tpo",
    name: "Thyroid Peroxidase",
    shortName: "TPO",
    defaultUnit: "IU/mL",
  },
  {
    id: "selenium",
    name: "Selenium",
    shortName: "Selenium",
    defaultUnit: "mcg/L",
  },
];

export const labMeasurementIds: LabMeasurementId[] =
  labMeasurementDefinitions.map((measurement) => measurement.id);

export function getMeasurementDefinition(id: LabMeasurementId) {
  return (
    labMeasurementDefinitions.find((measurement) => measurement.id === id) ??
    labMeasurementDefinitions[0]
  );
}

export function getRangeStatus(
  result: LabMeasurementResult | null,
): LabRangeStatus {
  if (!result) {
    return "not-reported";
  }

  const range = result.referenceRange;

  if (!range || (range.low === undefined && range.high === undefined)) {
    return "reference-range-unavailable";
  }

  if (range.low !== undefined && result.value < range.low) {
    return "below-range";
  }

  if (range.high !== undefined && result.value > range.high) {
    return "above-range";
  }

  return "within-range";
}

export function getRangeStatusLabel(status: LabRangeStatus): string {
  switch (status) {
    case "within-range":
      return "Within range";
    case "above-range":
      return "Above range";
    case "below-range":
      return "Below range";
    case "not-reported":
      return "Not reported";
    case "reference-range-unavailable":
      return "Reference range unavailable";
  }
}

export function formatReferenceRange(range?: LabReferenceRange | null): string {
  if (!range || (range.low === undefined && range.high === undefined)) {
    return "Not reported";
  }

  if (range.low !== undefined && range.high !== undefined) {
    return `${range.low} - ${range.high}`;
  }

  if (range.low !== undefined) {
    return `≥ ${range.low}`;
  }

  return `≤ ${range.high}`;
}

export function sortReportsByCollectionDate(
  reports: LabReport[],
  order: "asc" | "desc",
): LabReport[] {
  const next = [...reports];

  next.sort((left, right) => {
    const leftTs = new Date(left.collectedAt).getTime();
    const rightTs = new Date(right.collectedAt).getTime();

    return order === "asc" ? leftTs - rightTs : rightTs - leftTs;
  });

  return next;
}

export function formatCollectionDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function countReportedMeasurements(report: LabReport): number {
  return labMeasurementIds.reduce((count, id) => {
    return report.measurements[id] ? count + 1 : count;
  }, 0);
}

export type LabTrendPoint = {
  reportId: string;
  collectedAt: string;
  value: number;
  unit: string;
  referenceRange: LabReferenceRange | null | undefined;
};

export function getMeasurementTrend(
  reports: LabReport[],
  measurementId: LabMeasurementId,
): LabTrendPoint[] {
  const chronological = sortReportsByCollectionDate(reports, "asc");

  return chronological
    .map((report) => {
      const result = report.measurements[measurementId];

      if (!result) {
        return null;
      }

      return {
        reportId: report.id,
        collectedAt: report.collectedAt,
        value: result.value,
        unit: result.unit,
        referenceRange: result.referenceRange,
      };
    })
    .filter((point): point is LabTrendPoint => point !== null);
}

export function getSharedTrendUnit(points: LabTrendPoint[]): string | null {
  if (points.length === 0) {
    return null;
  }

  const units = new Set(points.map((point) => point.unit));

  if (units.size !== 1) {
    return null;
  }

  return points[0].unit;
}

export function getSharedReferenceRange(
  points: LabTrendPoint[],
): LabReferenceRange | null {
  if (points.length === 0) {
    return null;
  }

  const first = points[0].referenceRange;

  if (!first || (first.low === undefined && first.high === undefined)) {
    return null;
  }

  const shared = points.every((point) => {
    const range = point.referenceRange;

    if (!range) {
      return false;
    }

    return range.low === first.low && range.high === first.high;
  });

  return shared ? first : null;
}
