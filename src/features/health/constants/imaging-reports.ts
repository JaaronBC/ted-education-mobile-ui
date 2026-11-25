export type ImagingReport = {
  id: string;
  name: string;
  reportDate: string;
  location: string;
  fileName: string;
  fileUri: string;
  notes?: string;
};

export type ImagingSortOrder = "newest" | "oldest";

export function isValidImagingDate(value: string): boolean {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp);
}

export function formatImagingDate(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function sortImagingReports(
  reports: ImagingReport[],
  order: ImagingSortOrder,
): ImagingReport[] {
  const next = [...reports];

  next.sort((left, right) => {
    const leftTime = new Date(left.reportDate).getTime();
    const rightTime = new Date(right.reportDate).getTime();

    return order === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });

  return next;
}

export function getMostRecentImagingDate(
  reports: ImagingReport[],
): string | null {
  if (reports.length === 0) {
    return null;
  }

  const newest = sortImagingReports(reports, "newest")[0];
  return newest.reportDate;
}
