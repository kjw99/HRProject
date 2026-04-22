import InterviewerForm from "@/components/interview/InterviewerForm";

export default function InterviewerPopupPage() {
    return (
        // 팝업창 꽉 차게 배경을 깔고 중앙 정렬
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <InterviewerForm />
        </main>
    );
}