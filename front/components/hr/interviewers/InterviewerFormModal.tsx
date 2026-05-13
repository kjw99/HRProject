import { FormEvent, useEffect, useState } from "react";
import {
  HrInterviewer,
  InterviewerPayload,
  InterviewRound,
} from "@/types/interviewer";
import { Position } from "@/types/position";

interface InterviewerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: InterviewerPayload) => Promise<void>;
  initialData: HrInterviewer | null;
  positions: Position[];
}

const INTERVIEW_ROUNDS: InterviewRound[] = ["1차", "2차", "3차"];

export default function InterviewerFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  positions,
}: InterviewerFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [positionId, setPositionId] = useState<number | "">("");
  const [interviewRound, setInterviewRound] = useState<InterviewRound | "">("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(initialData?.interviewerName ?? "");
    setEmail(initialData?.interviewerEmail ?? "");
    setPositionId(initialData?.positionId ?? "");
    setInterviewRound((initialData?.interviewRound as InterviewRound) ?? "");
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canSubmit = Boolean(name.trim() && email.trim() && !isSaving);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    await onSave({
      interviewerName: name.trim(),
      interviewerEmail: email.trim(),
      positionId: positionId === "" ? null : positionId,
      interviewRound: interviewRound === "" ? null : interviewRound,
    });
    setIsSaving(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
              <i
                className={`bx ${initialData ? "bx-edit" : "bx-plus-circle"} text-indigo-600 text-xl`}
              ></i>
              {initialData ? "면접관 수정" : "면접관 추가"}
            </h2>
            <p className="text-[11px] font-bold text-slate-500 mt-1">
              이름, 이메일, 담당 직무와 면접 차수를 입력해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                이름
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="interviewer@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                담당 직무
              </label>
              <select
                value={positionId}
                onChange={(e) =>
                  setPositionId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">미지정</option>
                {positions.map((position) => (
                  <option key={position.positionId} value={position.positionId}>
                    {position.positionName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                면접 차수
              </label>
              <select
                value={interviewRound}
                onChange={(e) =>
                  setInterviewRound(e.target.value as InterviewRound | "")
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">미지정</option>
                {INTERVIEW_ROUNDS.map((round) => (
                  <option key={round} value={round}>
                    {round}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
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
