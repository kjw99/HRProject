import React, { useState, useEffect } from "react";
import { Position } from "@/types/position";

interface PositionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (positionName: string) => Promise<void>;
  initialData: Position | null;
}

export default function PositionFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PositionFormModalProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 모달이 열릴 때 데이터 초기화 (수정일 경우 기존 이름 세팅)
  useEffect(() => {
    if (isOpen) {
      setName(initialData ? initialData.positionName : "");
    }
  }, [isOpen, initialData]);

  // ESC 키 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    await onSave(name);
    setIsSaving(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
              <i
                className={`bx ${initialData ? "bx-edit" : "bx-plus-circle"} text-indigo-600 text-xl`}
              ></i>
              {initialData ? "직무 수정" : "새 직무 추가"}
            </h2>
            <p className="text-[11px] font-bold text-slate-500 mt-1">
              직무(Position) 이름을 입력해주세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
            직무명
          </label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 프론트엔드 개발자"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />

          <div className="flex gap-2 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSaving}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-black transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSaving ? (
                <i className="bx bx-loader-alt bx-spin text-lg" />
              ) : (
                "저장하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
