import HrPageHero from "@/components/hr/shared/HrPageHero";
import type { HrQuickLink } from "@/types/hr-ui";

interface HrQuestionsPageHeroProps {
  departmentCount: number;
}

const QUICK_LINKS: readonly HrQuickLink[] = [
  { href: "/hr", label: "대시보드", icon: "grid-alt" },
  { href: "/hr/ai-gen", label: "AI 질문 생성", icon: "brain" },
  { href: "/hr/positions", label: "부서 관리", icon: "buildings" },
];

export default function HrQuestionsPageHero({
  departmentCount,
}: HrQuestionsPageHeroProps) {
  return (
    <HrPageHero
      id="hr-questions-page-title"
      theme="indigo"
      badge={{ icon: "list-ul", label: "HR · 질문 라이브러리" }}
      icon="message-dots"
      title="질문 조회"
      description={
        <>
          <i className="bx bx-info-circle mr-1 inline-block align-text-bottom text-indigo-500" />
          부서(직무)를 선택하면 저장된 면접 질문을 확인할 수 있습니다. 목록은
          스크롤 시 순차적으로 불러옵니다.
        </>
      }
      quickLinks={QUICK_LINKS}
      stats={[
        {
          label: "선택 가능 부서",
          icon: "buildings",
          value: (
            <>
              {departmentCount}
              <span className="ml-0.5 text-xs font-bold text-slate-400 sm:text-sm">
                개
              </span>
            </>
          ),
        },
      ]}
    />
  );
}
