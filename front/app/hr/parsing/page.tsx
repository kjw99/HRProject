import ResumeParsingClient from "@/components/hr/parsing/ResumeParsingClient";
import HrPageHero from "@/components/hr/shared/HrPageHero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이력서 AI 파싱 | HR Portal",
  description:
    "여러 개의 이력서를 한 번에 분석하고 인재 풀에 등록합니다.",
};

export default function ParsingPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col">
        <HrPageHero
          theme="indigo"
          badge={{ icon: "bot", label: "HR · 이력서 인텔리전스" }}
          title="이력서 AI 파싱"
          description="파일을 업로드하면 AI가 인적사항·경력·스킬을 추출합니다. 백그라운드 작업으로 여러 파일을 동시에 처리할 수 있습니다."
          icon="file-find"
          stats={[
            {
              label: "지원 형식",
              value: "PDF · DOCX · HWP",
              icon: "file",
            },
            {
              label: "동시 업로드",
              value: "최대 20개",
              icon: "cloud-upload",
            },
          ]}
        />

        <ResumeParsingClient />
      </div>
    </div>
  );
}
