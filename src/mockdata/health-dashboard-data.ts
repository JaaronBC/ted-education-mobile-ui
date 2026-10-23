import type { HealthSummaryData } from "@/constants/health/health-summaries";

export const dummyHealthDashboard: Record<string, HealthSummaryData> = {
  labs: {
    type: "text",
    value: "3 results",
    description: "Most recent results available",
  },

  imaging: {
    type: "imageComparison",
    images: [
      {
        uri: "https://reactnative.dev/img/tiny_logo.png",
        date: "Jan 12, 2026",
        label: "Older image",
      },
      {
        uri: "https://reactnative.dev/img/tiny_logo.png",
        date: "Oct 10, 2026",
        label: "Latest image",
      },
    ],
  },
  medications: {
    type: "text",
    value: "5 medications",
    description: "Most recent medications available",
  },
};
