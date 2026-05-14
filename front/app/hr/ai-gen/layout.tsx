import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 면접 질문 생성 | HR Portal",
  description:
    "부서·지원자를 선택해 맞춤형 심층 면접 질문을 생성합니다. (HR)",
};

/**
 * `/interviewer` 전용 레이아웃(상단 Interviewer Header)은 사용하지 않습니다.
 * 상위 `app/hr/layout.tsx`의 HrClientWrapper(사이드바·HR 헤더)만 적용됩니다.
 */
export default function HrAiGenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
