"use client";

import React from "react";
import { CalendarEvent, Applicant } from "@/types/hr";

interface Props {
  event: CalendarEvent;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TableRow({ event, onClick, onEdit, onDelete }: Props) {
  return (
    // 💡 행 전체 클릭 이벤트 적용 및 주석 위치 수정 완료
    <tr
      onClick={onClick}
      className="hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            <i
              className={`bx ${event.type === "CODING_TEST" ? "bx-laptop" : "bx-spreadsheet"}`}
            ></i>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-[15px] group-hover:text-indigo-700 transition-colors">
              {event.title}
            </span>
            <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">
              {event.type}
            </span>
          </div>
        </div>
      </td>
      <td className="p-5">
        <div className="flex flex-col">
          <span className="text-[14px] font-black text-slate-700">
            {event.date}
          </span>
          <span className="text-[12px] font-bold text-slate-400">
            {event.startTime} - {event.endTime}
          </span>
        </div>
      </td>
      <td className="p-5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-2">
            {event.candidates.slice(0, 3).map((c: Applicant, i: number) => (
              <div
                key={i}
                title={c.name}
                className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm relative z-10 hover:z-20"
              >
                {c.name[0]}
              </div>
            ))}
          </div>
          {/* <span className="text-[13px] font-bold text-slate-600">
            {event.candidates.map((c: Applicant) => c.name).join(", ")}
          </span> */}
        </div>
      </td>
      <td className="p-5 text-center">
        <span className="px-3 py-1.5 bg-white text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm max-w-[150px] truncate inline-block">
          {event.location || "미정"}
        </span>
      </td>
      <td className="p-5 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm flex items-center justify-center transition-all"
          >
            <i className="bx bx-edit-alt text-lg"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:shadow-sm flex items-center justify-center transition-all"
          >
            <i className="bx bx-trash text-lg"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}
