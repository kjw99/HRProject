// components/interview/InterviewerForm.tsx
"use client";

import { useState } from "react";

export default function InterviewerForm() {
    const [selectedDate, setSelectedDate] = useState("2026-04-28");
    const [slots, setSlots] = useState<string[]>([]);
    const [timeInput, setTimeInput] = useState("14:00");

    const handleAddSlot = () => {
        if (!slots.includes(timeInput)) {
            setSlots([...slots, timeInput].sort());
        }
    };

    const handleRemoveSlot = (time: string) => {
        setSlots(slots.filter((s) => s !== time));
    };

    const handleSave = () => {
        // 1. API 호출 로직: 생성된 슬롯들을 서버로 전송 (Axios, Fetch 등)
        // ...

        // 2. 사용자에게 완료 알림 보여주기
        alert(`${selectedDate}의 면접 시간 ${slots.length}개가 저장되었습니다.`);

        // 3. 알림창의 '확인'을 누르면 팝업창 즉시 종료
        window.close();
    };

    return (
        <div className="w-full max-w-[380px] rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">면접 시간 설정</h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">면접관용</span>
            </div>

            <div className="space-y-5">
                {/* 날짜 선택 */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600">날짜 선택</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                </div>

                {/* 시간대 추가 */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600">시간대 추가</label>
                    <div className="flex gap-2">
                        <input
                            type="time"
                            value={timeInput}
                            onChange={(e) => setTimeInput(e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        />
                        <button
                            onClick={handleAddSlot}
                            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-95"
                        >
                            추가
                        </button>
                    </div>
                </div>

                {/* 생성된 슬롯 리스트 */}
                <div className="min-h-[80px] rounded-xl border border-dashed border-gray-200 p-4">
                    {slots.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 mt-2">추가된 시간대가 없습니다.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {slots.map((time) => (
                                <div key={time} className="flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
                                    <i className='bx bx-time-five'></i>
                                    {time}
                                    <button onClick={() => handleRemoveSlot(time)} className="ml-1 text-indigo-400 hover:text-indigo-900">
                                        <i className='bx bx-x'></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={slots.length === 0}
                    className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-[15px] font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                    스케줄 확정하기
                </button>
            </div>
        </div>
    );
}