import IntervieweeForm from "@/components/interview/IntervieweeForm";

// 임시 데이터 (실제로는 DB나 API에서 가져옴)
const mockSlots = [
    { id: "1", date: "4월 28일 (화)", time: "14:00" },
    { id: "2", date: "4월 28일 (화)", time: "16:30" },
    { id: "3", date: "4월 29일 (수)", time: "10:00" },
];

export default function IntervieweePopupPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <IntervieweeForm availableSlots={mockSlots} />
        </main>
    );
}