import type { Href } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import type { HealthSummaryData } from "@/constants/health/health-summaries";
import {
  ClipboardList,
  FileText,
  FlaskConical,
  Pill,
  Scan,
} from "lucide-react-native";
import { dummyHealthDashboard } from "@/mockdata/health-dashboard-data";

export type HealthCategory = {
  title: string;
  description: string;
  icon: LucideIcon;
  route: Href;
  summary?: HealthSummaryData;
};

export const healthCategories: HealthCategory[] = [
  {
    title: "Labs",
    description: "Review your laboratory results",
    icon: FlaskConical,
    route: "/health/labs",
    summary: dummyHealthDashboard.labs,
  },
  {
    title: "Imaging",
    description: "View your imaging reports",
    icon: Scan,
    route: "/health/imaging",
    summary: dummyHealthDashboard.imaging,
  },
  {
    title: "Medications",
    description: "Review your medications",
    icon: Pill,
    route: "/health/medications",
    summary: dummyHealthDashboard.medications,
  },
  {
    title: "Treatment History",
    description: "Review previous and ongoing treatments.",
    icon: ClipboardList,
    route: "/health/treatments",
  },
  {
    title: "Medical Records",
    description: "Access your medical documents",
    icon: FileText,
    route: "/health/records",
  },
];
