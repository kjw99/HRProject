"use client";

import React from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function TableFilter({ value, onChange }: Props) {
  return (
    <div className="relative w-full md:max-w-md group">
      {/* 돋보기 아이콘 */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        <i className="bx bx-search text-xl"></i>
      </div>

      {/* 검색 입력란 */}
      <input
        type="text"
        placeholder="면접명 또는 지원자 이름으로 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-[14px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
      />

      {/* 검색어 삭제 버튼 (입력값이 있을 때만 노출) */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
        >
          <i className="bx bx-x text-lg"></i>
        </button>
      )}
    </div>
  );
}
