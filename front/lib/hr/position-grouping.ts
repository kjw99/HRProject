import type { Position } from "@/types/position";

export type PositionCategoryId =
  | "development"
  | "design"
  | "data"
  | "product"
  | "marketing"
  | "sales"
  | "hr"
  | "finance"
  | "operations"
  | "manufacturing"
  | "other";

export interface PositionCategoryMeta {
  id: PositionCategoryId;
  label: string;
  icon: string;
  keywords: string[];
}

/** 표시 순서: 유사 직무가 인접하도록 배치 */
export const POSITION_CATEGORIES: PositionCategoryMeta[] = [
  {
    id: "development",
    label: "개발 · IT",
    icon: "bx-code-alt",
    keywords: [
      "개발",
      "developer",
      "dev",
      "백엔드",
      "backend",
      "프론트",
      "frontend",
      "front-end",
      "풀스택",
      "fullstack",
      "full-stack",
      "임베디드",
      "embedded",
      "s/w",
      "sw",
      "소프트웨어",
      "software",
      "프로그래",
      "program",
      "시스템개발",
      "웹개발",
      "앱개발",
      "ios",
      "android",
      "react",
      "node",
      "java",
      "python",
      "인프라",
      "infra",
      "devops",
      "클라우드",
      "cloud",
      "네트워크",
      "network",
      "보안",
      "security",
      "it",
      "정보",
      "테크",
      "tech",
      "r&d",
      "연구개발",
    ],
  },
  {
    id: "data",
    label: "데이터 · AI",
    icon: "bx-line-chart",
    keywords: [
      "데이터",
      "data",
      "ai",
      "ml",
      "머신러닝",
      "machinelearning",
      "딥러닝",
      "deeplearning",
      "nlp",
      "llm",
      "분석",
      "analyst",
      "analytics",
      "bi",
      "scientist",
    ],
  },
  {
    id: "design",
    label: "디자인 · UX",
    icon: "bx-palette",
    keywords: [
      "디자인",
      "design",
      "ux",
      "ui",
      "그래픽",
      "graphic",
      "영상",
      "모션",
      "편집",
      "아트",
      "art",
      "크리에이티브",
      "creative",
    ],
  },
  {
    id: "product",
    label: "기획 · PM",
    icon: "bx-bulb",
    keywords: [
      "기획",
      "planner",
      "planning",
      "pm",
      "product",
      "프로덕트",
      "서비스기획",
      "사업기획",
      "전략기획",
    ],
  },
  {
    id: "marketing",
    label: "마케팅 · 홍보",
    icon: "bx-megaphone",
    keywords: [
      "마케팅",
      "marketing",
      "홍보",
      "pr",
      "브랜드",
      "brand",
      "콘텐츠",
      "content",
      "퍼포먼스",
      "performance",
      "그로스",
      "growth",
      "커뮤니케이션",
    ],
  },
  {
    id: "sales",
    label: "영업 · 사업",
    icon: "bx-trending-up",
    keywords: [
      "영업",
      "sales",
      "사업",
      "business",
      "bd",
      "account",
      "해외영업",
      "국내영업",
      "무역",
      "trade",
    ],
  },
  {
    id: "hr",
    label: "인사 · 채용",
    icon: "bx-user-check",
    keywords: [
      "인사",
      "hr",
      "humanresource",
      "채용",
      "recruit",
      "talent",
      "조직",
      "organization",
      "노무",
      "labor",
    ],
  },
  {
    id: "finance",
    label: "재무 · 회계",
    icon: "bx-calculator",
    keywords: [
      "재무",
      "finance",
      "회계",
      "accounting",
      "accountant",
      "세무",
      "tax",
      "경리",
      "자금",
    ],
  },
  {
    id: "manufacturing",
    label: "생산 · 제조",
    icon: "bx-cog",
    keywords: [
      "생산",
      "제조",
      "manufacturing",
      "공정",
      "품질",
      "quality",
      "qc",
      "qa",
      "설비",
      "기계",
      "mechanical",
      "전기",
      "electrical",
      "전자",
      "hardware",
      "하드웨어",
      "물류",
      "logistics",
      "구매",
      "procurement",
      "자재",
    ],
  },
  {
    id: "operations",
    label: "경영지원 · 운영",
    icon: "bx-buildings",
    keywords: [
      "경영",
      "운영",
      "operation",
      "ops",
      "총무",
      "admin",
      "법무",
      "legal",
      "compliance",
      "cs",
      "고객",
      "상담",
      "support",
      "서비스",
      "service",
      "md",
      "유통",
      "retail",
      "매장",
      "store",
    ],
  },
];

const CATEGORY_ORDER = new Map(
  POSITION_CATEGORIES.map((category, index) => [category.id, index]),
);

function normalizePositionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[·・/\\_|,.-]/g, "")
    .replace(/&/g, "and");
}

export function classifyPositionCategory(positionName: string): PositionCategoryId {
  const normalized = normalizePositionName(positionName);
  if (!normalized) return "other";

  let bestId: PositionCategoryId = "other";
  let bestScore = 0;

  for (const category of POSITION_CATEGORIES) {
    let score = 0;
    for (const keyword of category.keywords) {
      const normalizedKeyword = normalizePositionName(keyword);
      if (!normalizedKeyword) continue;
      if (normalized.includes(normalizedKeyword)) {
        score += normalizedKeyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = category.id;
    }
  }

  return bestId;
}

export function getPositionCategoryMeta(
  categoryId: PositionCategoryId,
): PositionCategoryMeta {
  return (
    POSITION_CATEGORIES.find((category) => category.id === categoryId) ??
    POSITION_CATEGORIES[POSITION_CATEGORIES.length - 1]
  );
}

export interface PositionDisplayGroup {
  id: PositionCategoryId;
  label: string;
  icon: string;
  positions: Position[];
}

function comparePositions(
  a: Position,
  b: Position,
  sortKey: "positionName" | "createdAt",
  sortOrder: "asc" | "desc",
): number {
  if (sortKey === "positionName") {
    const compared = a.positionName.localeCompare(b.positionName, "ko");
    return sortOrder === "asc" ? compared : -compared;
  }

  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
}

/** 검색·정렬 후 카테고리별로 묶어 반환 (빈 그룹 제외) */
export function buildPositionDisplayGroups(
  positions: Position[],
  sortKey: "positionName" | "createdAt",
  sortOrder: "asc" | "desc",
): PositionDisplayGroup[] {
  const buckets = new Map<PositionCategoryId, Position[]>();

  for (const position of positions) {
    const categoryId = classifyPositionCategory(position.positionName);
    const list = buckets.get(categoryId) ?? [];
    list.push(position);
    buckets.set(categoryId, list);
  }

  return POSITION_CATEGORIES.filter((category) => buckets.has(category.id))
    .map((category) => {
      const items = [...(buckets.get(category.id) ?? [])].sort((a, b) =>
        comparePositions(a, b, sortKey, sortOrder),
      );
      return {
        id: category.id,
        label: category.label,
        icon: category.icon,
        positions: items,
      };
    })
    .sort(
      (a, b) =>
        (CATEGORY_ORDER.get(a.id) ?? 99) - (CATEGORY_ORDER.get(b.id) ?? 99),
    );
}
