import type { ReactNode } from "react";

/** Boxicons 클래스 접미사 (예: "grid-alt" → bx-grid-alt) */
export type BoxIconName = string;

export type HrPageHeroTheme = "indigo" | "amber" | "emerald" | "sky";

export interface HrQuickLink {
  href: string;
  label: string;
  icon: BoxIconName;
}

export interface HrStatItem {
  label: string;
  value: ReactNode;
  icon?: BoxIconName;
  hint?: string;
}

export interface HrPageHeroProps {
  id?: string;
  theme?: HrPageHeroTheme;
  badge: { icon: BoxIconName; label: string };
  title: string;
  description: ReactNode;
  icon: BoxIconName;
  quickLinks?: readonly HrQuickLink[];
  stats?: readonly HrStatItem[];
}

export type HrModalSize = "sm" | "md" | "lg" | "xl";

export type HrModalTheme = "indigo" | "amber" | "emerald";

export interface HrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  eyebrowIcon?: BoxIconName;
  theme?: HrModalTheme;
  size?: HrModalSize;
  zIndex?: number;
  children: ReactNode;
  footer?: ReactNode;
}

export type CriteriaFilter = "ALL" | "HAS" | "NONE";
