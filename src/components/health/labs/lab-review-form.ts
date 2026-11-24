import {
  labMeasurementDefinitions,
  type LabMeasurementId,
  type LabMeasurementResult,
  type LabReport,
} from "@/constants/health/lab-measurements";

export type LabReviewMeasurementDraft = {
  value: string;
  unit: string;
  low: string;
  high: string;
};

export type LabReviewDraftInput = {
  pdfFileName: string;
  collectedAt: string;
  measurements: Record<LabMeasurementId, LabReviewMeasurementDraft>;
};

export type LabReviewFormState = {
  pdfFileName: string;
  collectedAt: string;
  confirmed: boolean;
  measurements: Record<LabMeasurementId, LabReviewMeasurementDraft>;
};

export type LabReviewFieldErrors = {
  value?: string;
  unit?: string;
  low?: string;
  high?: string;
  range?: string;
};

export type LabReviewValidationErrors = {
  collectionDate?: string;
  measurements: Partial<Record<LabMeasurementId, LabReviewFieldErrors>>;
};

type NumericParse =
  { kind: "missing" } | { kind: "invalid" } | { kind: "value"; value: number };

function parseNumericInput(raw: string): NumericParse {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return { kind: "missing" };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return { kind: "invalid" };
  }

  return { kind: "value", value: parsed };
}

function isValidCollectionDate(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return false;
  }

  const timestamp = new Date(trimmed).getTime();

  return Number.isFinite(timestamp);
}

export function createReviewFormFromDraft(
  draft: LabReviewDraftInput,
): LabReviewFormState {
  const measurements = labMeasurementDefinitions.reduce(
    (result, measurement) => {
      result[measurement.id] = {
        ...draft.measurements[measurement.id],
      };

      return result;
    },
    {} as Record<LabMeasurementId, LabReviewMeasurementDraft>,
  );

  return {
    pdfFileName: draft.pdfFileName,
    collectedAt: draft.collectedAt,
    confirmed: false,
    measurements,
  };
}

export type BuildReportResult =
  | {
      ok: true;
      report: LabReport;
    }
  | {
      ok: false;
      errors: LabReviewValidationErrors;
    };

export function buildValidatedLabReport(
  form: LabReviewFormState,
): BuildReportResult {
  const measurementErrors: Partial<
    Record<LabMeasurementId, LabReviewFieldErrors>
  > = {};

  const measurements = {} as Record<
    LabMeasurementId,
    LabMeasurementResult | null
  >;

  for (const measurement of labMeasurementDefinitions) {
    const fields = form.measurements[measurement.id];
    const valueParse = parseNumericInput(fields.value);

    if (valueParse.kind === "missing") {
      measurements[measurement.id] = null;
      continue;
    }

    if (valueParse.kind === "invalid") {
      measurementErrors[measurement.id] = {
        ...(measurementErrors[measurement.id] ?? {}),
        value: "Enter a valid numeric result or leave it blank.",
      };
      continue;
    }

    const unit = fields.unit.trim();

    if (unit.length === 0) {
      measurementErrors[measurement.id] = {
        ...(measurementErrors[measurement.id] ?? {}),
        unit: "Unit is required when a value is recorded.",
      };
    }

    const lowParse = parseNumericInput(fields.low);
    const highParse = parseNumericInput(fields.high);

    if (lowParse.kind === "invalid") {
      measurementErrors[measurement.id] = {
        ...(measurementErrors[measurement.id] ?? {}),
        low: "Enter a valid number or leave blank.",
      };
    }

    if (highParse.kind === "invalid") {
      measurementErrors[measurement.id] = {
        ...(measurementErrors[measurement.id] ?? {}),
        high: "Enter a valid number or leave blank.",
      };
    }

    if (
      lowParse.kind === "value" &&
      highParse.kind === "value" &&
      lowParse.value > highParse.value
    ) {
      measurementErrors[measurement.id] = {
        ...(measurementErrors[measurement.id] ?? {}),
        range: "Reference low cannot be greater than reference high.",
      };
    }

    const hasMeasurementErrors = Boolean(measurementErrors[measurement.id]);

    if (hasMeasurementErrors) {
      continue;
    }

    const referenceRange =
      lowParse.kind === "missing" && highParse.kind === "missing"
        ? null
        : {
            ...(lowParse.kind === "value" ? { low: lowParse.value } : {}),
            ...(highParse.kind === "value" ? { high: highParse.value } : {}),
          };

    measurements[measurement.id] = {
      value: valueParse.value,
      unit,
      referenceRange,
    };
  }

  const errors: LabReviewValidationErrors = {
    measurements: measurementErrors,
  };

  if (!isValidCollectionDate(form.collectedAt)) {
    errors.collectionDate = "Enter a valid collection date (YYYY-MM-DD).";
  }

  const hasMeasurementErrors = Object.keys(measurementErrors).length > 0;
  const hasDateError = Boolean(errors.collectionDate);

  if (hasMeasurementErrors || hasDateError) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    report: {
      id: `lab-${Date.now()}`,
      pdfFileName: form.pdfFileName,
      collectedAt: form.collectedAt.trim(),
      measurements,
    },
  };
}
