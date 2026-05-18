import type { AdminQuickActionCard } from "@/types/admin-ui";
import type { AdminOperationalMetric } from "@/types/admin-ui";

export const ADMIN_HOME_UI = {
  hero: {
    badge: "Admin Overview",
    title: "관리자 운영 허브",
    description:
      "시스템 계정과 접근 정책은 이 영역에서 관리하고, 채용 운영은 HR 화면으로 연결합니다.",
  },
  adminSection: {
    title: "Admin 전용 작업",
    description:
      "플랫폼 공통 규칙 — 강조된 다크 카드로 HR 영역과 구분합니다.",
  },
  hrSection: {
    title: "HR 운영 연결",
    description:
      "채용 운영 화면 — 라이트 카드와 에메랄드 포인트로 Admin과 대비합니다.",
  },
} as const;

export const ADMIN_ACTION_CARDS: readonly AdminQuickActionCard[] = [
  {
    title: "사용자 관리",
    description:
      "관리자와 HR 계정을 생성하고 비밀번호 재설정까지 처리합니다.",
    href: "/admin/users",
    icon: "user",
    tone: "from-indigo-600 via-violet-600 to-fuchsia-600",
    ctaLabel: "Admin 작업 열기",
    variant: "admin",
  },
  {
    title: "접근 제어 규칙",
    description: "운영 중인 라우트의 접근 정책과 안내 문구를 정리합니다.",
    href: "/admin/routes",
    icon: "shield-quarter",
    tone: "from-slate-800 via-slate-900 to-indigo-950",
    ctaLabel: "정책 화면 열기",
    variant: "admin",
  },
];

export const ADMIN_HR_HANDOFF_CARDS: readonly AdminQuickActionCard[] = [
  {
    title: "지원자 운영",
    description: "지원자 정보 수정, 메일 발송, 전형 상태 확인 흐름입니다.",
    href: "/hr/applicants",
    icon: "group",
    tone: "",
    ctaLabel: "HR 화면 이동",
    variant: "hr-handoff",
  },
  {
    title: "면접관 커뮤니케이션",
    description: "면접관 초대 링크 생성과 초대 메일 발송 화면입니다.",
    href: "/hr/interviewers/communication",
    icon: "send",
    tone: "",
    ctaLabel: "HR 화면 이동",
    variant: "hr-handoff",
  },
  {
    title: "면접 일정",
    description: "면접 슬롯 생성과 예약 흐름을 다루는 HR 운영 화면입니다.",
    href: "/hr/schedule",
    icon: "calendar",
    tone: "",
    ctaLabel: "HR 화면 이동",
    variant: "hr-handoff",
  },
];

export const ADMIN_METRIC_LINKS: readonly Omit<AdminOperationalMetric, "value">[] =
  [
    {
      id: "users",
      label: "등록 사용자",
      hint: "계정 목록에서 상세 관리",
      href: "/admin/users",
      icon: "group",
    },
    {
      id: "routes",
      label: "접근 정책",
      hint: "라우트별 권한 점검",
      href: "/admin/routes",
      icon: "shield-quarter",
    },
    {
      id: "reset",
      label: "비밀번호 재설정",
      hint: "사용자 상세에서 처리",
      href: "/admin/users",
      icon: "key",
    },
  ];
