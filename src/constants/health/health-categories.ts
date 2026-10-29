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
  id: "labs" | "imaging" | "medications" | "treatments" | "records";
  title: string;
  description: string;
  icon: LucideIcon;
  route: Href;
  summary?: HealthSummaryData;
};

export const healthCategories: HealthCategory[] = [
  {
    id: "labs",
    title: "Labs",
    description: "Review your laboratory results",
    icon: FlaskConical,
    route: "/health/labs",
    summary: dummyHealthDashboard.labs,
  },
  {
    id: "imaging",
    title: "Imaging",
    description: "View your imaging reports",
    icon: Scan,
    route: "/health/imaging",
    summary: dummyHealthDashboard.imaging,
  },
  {
    id: "medications",
    title: "Medications",
    description: "Review your medications",
    icon: Pill,
    route: "/health/medications",
    summary: dummyHealthDashboard.medications,
  },
  {
    id: "treatments",
    title: "Treatment History",
    description: "Review previous and ongoing treatments.",
    icon: ClipboardList,
    route: "/health/treatments",
  },
  {
    id: "records",
    title: "Medical Records",
    description: "Access your medical documents",
    icon: FileText,
    route: "/health/records",
  },
];
