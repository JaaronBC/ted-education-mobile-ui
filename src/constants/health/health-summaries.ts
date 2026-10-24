/*
 Define the types for health summary data and 
data passed to the HealthSummaryCard component
*/
export type HealthSummaryData =
  | {
      type: "labsSummary";
      casScore: number;
      increased: number;
    }
  | {
      type: "imagingSummary";
      images: {
        uri: string;
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
