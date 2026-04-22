// app/interview/page.tsx
import InterviewerForm from "@/components/interview/InterviewerForm";
import IntervieweeForm from "@/components/interview/IntervieweeForm";
import OpenPopupButtons from "@/components/interview/OpenPopupButtons";

// SSR 데이터 페칭 시뮬레이션 함수
async function getAvailableSlots() {
    // 실제 환경에서는 await db.query(...) 등이 들어갑니다.
    return [
        { id: "1", date: "4월 28일 (화)", time: "14:00" },
        { id: "2", date: "4월 28일 (화)", time: "16:30" },
        { id: "3", date: "4월 29일 (수)", time: "10:00" },
    ];
}

export default async function InterviewPage() {
    // 서버에서 데이터를 미리 가져옴 (SSR)
    const slots = await getAvailableSlots();

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 gap-12 sm:flex-row sm:items-start sm:pt-20">

            <OpenPopupButtons />

        </main>
    );
}