/*
 Define the types for health summary data and 
data passed to the HealthSummaryCard component
*/

export type HealthSummaryData =
  | {
      type: "labsSummary";
      thyroidState: string;
      antibodyStatus: string;
      audiograms: number;
      orbitalImagingReports: number;
      availableLabs: {
        testName: string;
        status: string;
      }[];
    }
  | {
      type: "imagingSummary";
      report: {
        uri: string;
        reportType: string;
        date: string;
      }[];
    }
  | {
      type: "medicationSummary";
      medications: {
        id: string;
        name: string;
        nextDoseDate: string;
      }[];
    };
