import type { HealthSummaryData } from "@/constants/health/health-summaries";

type HealthDashboardData = {
  labs?: HealthSummaryData;
  imaging?: HealthSummaryData;
  medications?: HealthSummaryData;
};

// Mock Data for Health Dashboard summaries, used for testing
export const dummyHealthDashboard: HealthDashboardData = {
  labs: {
    type: "labsSummary",
    casScore: 5,
    dateAssessed: "Jan 12, 2026",
  },

  imaging: {
    type: "imagingSummary",
    images: [
      //Allow users to compare most recent image with an older image
      {
        uri: "https://images.unsplash.com/photo-1587910234573-d6fc84743bc8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
        date: "Jan 12, 2026",
      },
      {
        uri: "https://images.unsplash.com/photo-1564278692313-b2d65996fc93?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
        date: "Oct 10, 2026",
      },
    ],
  },
  medications: {
    type: "medicationSummary",
    //Allows users to see a list of their active medications and when their next dose is due
    medications: [
      {
        id: "1",
        name: "Medication A",
        nextDoseDate: "5 Days",
      },
      {
        id: "2",
        name: "Medication B",
        nextDoseDate: "Today",
      },
      {
        id: "3",
        name: "Medication C",
        nextDoseDate: "2 Days",
      },
    ],
  },
};
