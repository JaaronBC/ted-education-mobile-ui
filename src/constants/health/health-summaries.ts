export type HealthSummaryData =
  | {
      type: "text";
      value: string | number;
      description?: string;
    }
  | {
      type: "image";
      uri: string;
      description?: string;
    }
  | {
      type: "imageComparison";
      title: string;
      images: {
        uri: string;
        date: string;
        label: string;
      }[];
      description?: string;
    };
