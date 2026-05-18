import type { BoxIconName } from "./hr-ui";

export interface AdminOperationalMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  href: string;
  icon: BoxIconName;
}

export interface AdminQuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: BoxIconName;
  tone: string;
  ctaLabel: string;
  variant: "admin" | "hr-handoff";
}

export interface AdminHomeOverviewProps {
  initialUserCount: number;
}

export interface AdminHomeMetricsProps {
  initialUserCount: number;
}
