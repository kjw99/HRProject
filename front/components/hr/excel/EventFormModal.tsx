"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarEvent, PassedApplicant } from "@/types/hr";

interface Props {
  mode: "CREATE" | "EDIT";
  initialData?: CalendarEvent | null;
  selectedDate: Date;
  applicants: PassedApplicant[];
  onClose: () => void;
  onSuccess: (event: CalendarEvent) => void;
}

export default function EventFormModal({
  mode,
  initialData,
  selectedDate,
  applicants,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [startTime, setStartTime] = useState(initialData?.startTime || "14:00");
  const [endTime, setEndTime] = useState(initialData?.endTime || "15:00");
  // 💡 장소(Location) 상태 추가
  const [location, setLocation] = useState(initialData?.location || "");
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>(
    initialData?.candidates?.map((c) => c.id) || [],
  );

  const handleSubmit = async () => {
    const eventData: CalendarEvent = {
      id: initialData?.id || Math.random().toString(),
      title,
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime,
      endTime,
      location, // 💡 장소 데이터 포함
      type: "INTERVIEW",
      candidates: applicants.filter((a) => selectedApplicants.includes(a.id)),
    };

    onSuccess(eventData);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-[20px] font-black text-slate-900">
            {mode === "CREATE" ? "새 일정 등록" : "일정 수정"}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 border border-transparent hover:border-slate-200 transition-all"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
              Interview Title
            </label>
            <input
              type="text"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 ring-indigo-500 outline-none font-bold transition-all"
              placeholder="예: 백엔드 1차 기술 면접"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                Start Time
              </label>
              <input
                type="time"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:bg-white focus:ring-2 ring-indigo-500 transition-all"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                End Time
              </label>
              <input
                type="time"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:bg-white focus:ring-2 ring-indigo-500 transition-all"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* 💡 장소(Location) 입력란 UI 추가 */}
          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
              Location / Link
            </label>
            <div className="relative">
              <i className="bx bx-map absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
              <input
                type="text"
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 ring-indigo-500 outline-none font-bold transition-all"
                placeholder="화상 링크 또는 오프라인 장소"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
              Select Candidates
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {applicants.map((app) => (
                <label
                  key={app.id}
                  htmlFor={`app-${app.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedApplicants.includes(app.id)
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id={`app-${app.id}`}
                      type="checkbox"
                      className="hidden"
                      checked={selectedApplicants.includes(app.id)}
                      onChange={() =>
                        setSelectedApplicants((prev) =>
                          prev.includes(app.id)
                            ? prev.filter((id) => id !== app.id)
                            : [...prev, app.id],
                        )
                      }
                    />
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedApplicants.includes(app.id) ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white border-slate-300"}`}
                    >
                      {selectedApplicants.includes(app.id) && (
                        <i className="bx bx-check text-sm"></i>
                      )}
                    </div>
                    <span className="text-[14px] font-bold text-slate-700">
                      {app.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-white text-slate-400 px-2 py-1 rounded-md border border-slate-100 font-bold">
                    {app.position}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-indigo-600 text-white rounded-[22px] font-black text-[15px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4"
          >
            {mode === "CREATE" ? "일정 저장하기" : "수정 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
