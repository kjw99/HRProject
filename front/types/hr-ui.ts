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

export type HrModalActionVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

export interface HrModalAction {
  label: string;
  onClick: () => void;
  icon?: BoxIconName;
  variant?: HrModalActionVariant;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}

export interface HrModalFooterProps {
  actions: readonly HrModalAction[];
  align?: "end" | "stretch";
}

export interface HrSidebarMenuItem {
  name: string;
  path: string;
  icon: string;
}

export interface HrSidebarMenuGroup {
  id: string;
  title: string;
  items: readonly HrSidebarMenuItem[];
}

export type BookingInviteStatus = "active" | "revoked" | "expired";

export type HrStatusBadgeTone = "emerald" | "rose" | "amber" | "slate" | "indigo";

export interface HrStatusBadgeProps {
  label: string;
  icon?: BoxIconName;
  tone?: HrStatusBadgeTone;
  className?: string;
}

export interface HrInfoSectionProps {
  title: string;
  eyebrow?: string;
  eyebrowIcon?: BoxIconName;
  children: ReactNode;
  className?: string;
}

export interface HrSuccessBannerProps {
  title: string;
  description?: ReactNode;
  icon?: BoxIconName;
  tone?: "indigo" | "emerald";
  className?: string;
}
