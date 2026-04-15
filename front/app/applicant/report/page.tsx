import type { Metadata } from "next";
import { fetchReportData } from '@/lib/axios';
import {
    ReportSkeleton,
    ReportSummary,
    CompetencyRadarChart,
    StrengthWeakness,
    DetailedFeedback
} from '@/components/applicant/report/ReportComponents';
import { CandidateReport } from '@/types/report';

export const metadata: Metadata = {
    title: 'AI 역량 분석 리포트 | A-RECRUIT',
};

export default async function ApplicantReportPage() {
    try {
        // 💡 서버 사이드에서 렌더링 전 데이터를 미리 Fetching 합니다.
        const reportData = await fetchReportData();

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 상단 요약 배너 */}
                <ReportSummary data={reportData} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 좌측: 레이더 차트 (이 내부만 클라이언트 컴포넌트로 동작) */}
                    <div className="lg:col-span-1">
                        <CompetencyRadarChart competencies={reportData.competencies} />
                    </div>

                    {/* 우측: 강점/약점 분석 */}
                    <div className="lg:col-span-2">
                        <StrengthWeakness
                            strengths={reportData.strengths}
                            weaknesses={reportData.weaknesses}
                        />
                    </div>
                </div>

                <div className="h-px w-full bg-slate-200/60 my-4"></div>

                {/* 하단: 문항별 상세 피드백 */}
                <DetailedFeedback feedbacks={reportData.feedbacks} />

            </div>
        );
    } catch (error) {
        // 💡 에러 발생 시 보여줄 서버 사이드 에러 UI
        return (
            <div className="bg-rose-50 p-12 rounded-[32px] border border-rose-100 text-center space-y-4 shadow-sm mt-10">
                <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className='bx bx-error text-4xl'></i>
                </div>
                <h2 className="text-xl font-black text-rose-700">리포트 발급 지연</h2>
                <p className="text-rose-600 font-medium">
                    데이터를 불러오는 중 문제가 발생했습니다.<br />잠시 후 다시 시도해 주세요.
                </p>
            </div>
        );
    }
}