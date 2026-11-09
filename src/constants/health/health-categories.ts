import type { Href } from "expo-router";
import type { AppIconName } from "@/components/ui/app-icon";
import type { HealthSummaryData } from "@/constants/health/health-summaries";
import { dummyHealthDashboard } from "@/mockdata/health-dashboard-data";

export type HealthCategory = {
  id: "labs" | "imaging" | "medications" | "treatments" | "records";
  title: string;
  description: string;
  icon: AppIconName;
  route: Href;
  summary?: HealthSummaryData;
};

export const healthCategories: HealthCategory[] = [
  {
    id: "labs",
    title: "Labs",
    description: "Review your laboratory results",
    icon: "Labs",
    route: "/health/labs",
    summary: dummyHealthDashboard.labs,
  },
  {
    id: "imaging",
    title: "Imaging",
    description: "View your imaging reports",
    icon: "Imaging",
    route: "/health/imaging",
    summary: dummyHealthDashboard.imaging,
  },
  {
    id: "medications",
    title: "Medications",
    description: "Review your medications",
    icon: "Medications",
    route: "/health/medications",
    summary: dummyHealthDashboard.medications,
  },
  {
    id: "treatments",
    title: "Treatment History",
    description: "Review previous and ongoing treatments.",
    icon: "Treatments",
    route: "/health/treatments",
  },
  {
    id: "records",
    title: "Medical Records",
    description: "Access your medical documents",
    icon: "Records",
    route: "/health/records",
  },
];
