"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarEvent,
  PassedApplicant,
} from "@/types/hr";
import TableRow from "./TableRow";
import TableFilter from "./TableFilter";
import EventDetailModal from "../calendar/EventDetailModal"; // 💡 상세 팝업 임포트
import { deleteCalendarEvent } from "@/lib/axios";
import EventFormModal from "./EventFormModal";

interface Props {
  initialEvents: CalendarEvent[];
  passedApplicants: PassedApplicant[];
}

export default function ScheduleTable({
  initialEvents,
  passedApplicants,
}: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");

  // 생성/수정 모달 상태
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "CREATE" | "EDIT";
    data: CalendarEvent | null;
  }>({
    isOpen: false,
    mode: "CREATE",
    data: null,
  });

  // 💡 상세 보기 모달 상태 추가
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    data: CalendarEvent | null;
  }>({
    isOpen: false,
    data: null,
  });

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return events.filter((event) => {
      const matchTitle = event.title.toLowerCase().includes(term);
      const matchCandidate = event.candidates.some((c) =>
        c.name.toLowerCase().includes(term),
      );
      return matchTitle || matchCandidate;
    });
  }, [events, searchTerm]);

  const handleDelete = async (id: string) => {
    if (confirm("해당 일정을 영구적으로 삭제하시겠습니까?")) {
      await deleteCalendarEvent(id);
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 바 (기존과 동일) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
        <TableFilter value={searchTerm} onChange={setSearchTerm} />
        <button
          onClick={() =>
            setFormModal({ isOpen: true, mode: "CREATE", data: null })
          }
          className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[14px] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <i className="bx bx-plus-circle text-xl"></i> 신규 일정 등록
        </button>
      </div>

      {/* 테이블 그리드 */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Interview Info
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Schedule
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Candidates
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                  Location
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEvents.map((event) => (
                <TableRow
                  key={event.id}
                  event={event}
                  onClick={() => setDetailModal({ isOpen: true, data: event })} // 💡 행 클릭 시 상세 모달 오픈
                  onEdit={() =>
                    setFormModal({ isOpen: true, mode: "EDIT", data: event })
                  }
                  onDelete={() => handleDelete(event.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💡 상세 보기 모달 연결 */}
      {detailModal.isOpen && detailModal.data && (
        <EventDetailModal
          event={detailModal.data}
          onClose={() => setDetailModal({ isOpen: false, data: null })}
        />
      )}

      {/* 생성/수정 폼 모달 연결 */}
      {formModal.isOpen && (
        <EventFormModal
          mode={formModal.mode}
          initialData={formModal.data}
          selectedDate={
            formModal.data ? new Date(formModal.data.date) : new Date()
          }
          applicants={passedApplicants}
          onClose={() => setFormModal({ ...formModal, isOpen: false })}
          onSuccess={(data) => {
            if (formModal.mode === "CREATE") setEvents([...events, data]);
            else setEvents(events.map((e) => (e.id === data.id ? data : e)));
            setFormModal({ ...formModal, isOpen: false });
          }}
        />
      )}
    </div>
  );
}
