// components/interview/IntervieweeForm.tsx
"use client";

import { useState } from "react";

// SSR에서 넘겨받을 데이터 타입 정의 (모듈화)
interface IntervieweeFormProps {
    availableSlots: { id: string; date: string; time: string }[];
}

export default function IntervieweeForm({ availableSlots }: IntervieweeFormProps) {
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = () => {
        if (!selectedSlotId) return;
        setIsSubmitting(true);
        // API 통신 시뮬레이션
        setTimeout(() => {
            alert("면접 예약이 확정되었습니다!");
            setIsSubmitting(false);
            window.close();

        }, 1500);

    };


    return (
        <div className="w-full max-w-[380px] rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">면접 시간 선택</h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">지원자용</span>
            </div>
            <p className="mb-6 text-sm text-gray-500">참석 가능한 시간대를 하나 선택해주세요.</p>

            {/* 슬롯 선택 리스트 */}
            <div className="mb-6 flex flex-col gap-3">
                {availableSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                        <label
                            key={slot.id}
                            className={`
                group relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all duration-200
                ${isSelected ? "border-indigo-600 bg-indigo-50/50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}
              `}
                        >
                            <input
                                type="radio"
                                name="interviewSlot"
                                className="peer sr-only"
                                onChange={() => setSelectedSlotId(slot.id)}
                            />
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold ${isSelected ? "text-indigo-900" : "text-gray-900"}`}>
                                    {slot.date}
                                </span>
                                <span className={`text-lg font-black tracking-tight mt-0.5 ${isSelected ? "text-indigo-600" : "text-gray-500"}`}>
                                    {slot.time}
                                </span>
                            </div>

                            {/* 커스텀 라디오 버튼 UI */}
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-gray-300 group-hover:border-indigo-300"}`}>
                                {isSelected && <i className='bx bx-check text-white text-sm'></i>}
                            </div>
                        </label>
                    );
                })}
            </div>

            <button
                onClick={handleConfirm}
                disabled={!selectedSlotId || isSubmitting}
                className="w-full rounded-xl bg-gray-900 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-gray-900/20 transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
                {isSubmitting ? <i className='bx bx-loader-alt bx-spin text-xl'></i> : "예약 확정하기"}
            </button>
        </div>
    );
}