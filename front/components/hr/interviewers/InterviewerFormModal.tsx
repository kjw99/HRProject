import { FormEvent, useEffect, useRef, useState } from "react";
import { checkEmailAvailability } from "@/lib/common/emailCheck";
import {
  HrInterviewer,
  InterviewerPayload,
  InterviewRound,
} from "@/types/interviewer";
import { Position } from "@/types/position";

/** 이메일 가용성 확인 전 대기(UX: 입력 멈춘 뒤 자동 검사) */
const EMAIL_CHECK_DEBOUNCE_MS = 750;

const isWellFormedEmail = (value: string): boolean => {
  const v = value.trim();
  if (!v || v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

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

  type EmailGate =
    | { status: "idle" }
    | { status: "debouncing" }
    | { status: "checking" }
    | { status: "unchanged" }
    | { status: "result"; available: boolean; message: string };

  const [emailGate, setEmailGate] = useState<EmailGate>({ status: "idle" });
  const emailRef = useRef(email);

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(initialData?.interviewerName ?? "");
    setEmail(initialData?.interviewerEmail ?? "");
    setPositionId(initialData?.positionId ?? "");
    setInterviewRound((initialData?.interviewRound as InterviewRound) ?? "");
    setEmailGate({ status: "idle" });
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = email.trim();

    if (!trimmed || !isWellFormedEmail(trimmed)) {
      setEmailGate({ status: "idle" });
      return;
    }

    const initialEmail = initialData?.interviewerEmail?.trim().toLowerCase();
    if (
      initialData &&
      initialEmail === trimmed.toLowerCase()
    ) {
      setEmailGate({
        status: "unchanged",
      });
      return;
    }

    setEmailGate({ status: "debouncing" });
    const timer = window.setTimeout(async () => {
      if (emailRef.current.trim() !== trimmed) return;

      setEmailGate({ status: "checking" });
      try {
        const res = await checkEmailAvailability(trimmed);
        if (emailRef.current.trim() !== trimmed) return;
        setEmailGate({
          status: "result",
          available: res.available,
          message: res.message,
        });
      } catch {
        if (emailRef.current.trim() !== trimmed) return;
        setEmailGate({
          status: "result",
          available: false,
          message: "이메일 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
      }
    }, EMAIL_CHECK_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [email, initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const selectsOkForCreate =
    initialData != null ||
    (interviewRound !== "" &&
      (positions.length === 0 || positionId !== ""));

  const inputsFilled =
    Boolean(trimmedName) &&
    Boolean(trimmedEmail) &&
    isWellFormedEmail(trimmedEmail) &&
    selectsOkForCreate;

  const emailUsable =
    emailGate.status === "unchanged" ||
    (emailGate.status === "result" && emailGate.available);

  const emailCheckPending =
    emailGate.status === "debouncing" || emailGate.status === "checking";

  const canSubmit =
    inputsFilled && emailUsable && !emailCheckPending && !isSaving;

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
              이메일은 입력 후 잠시 뒤 자동으로 사용 가능 여부가 확인됩니다. 추가
              시에는 면접 차수(및 직무 목록이 있으면 담당 직무)까지 선택해 주세요.
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
                autoComplete="email"
                aria-invalid={
                  emailGate.status === "result" && !emailGate.available
                    ? true
                    : undefined
                }
                aria-describedby="interviewer-email-hint"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 transition-all ${
                  emailGate.status === "result" && !emailGate.available
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/20"
                    : emailUsable && trimmedEmail
                      ? "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-500/15"
                      : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20"
                }`}
              />
              <p
                id="interviewer-email-hint"
                className="mt-1.5 min-h-[1.25rem] text-[11px] font-semibold leading-snug"
              >
                {emailCheckPending ? (
                  <span className="inline-flex items-center gap-1.5 text-indigo-600">
                    <i className="bx bx-loader-alt bx-spin text-sm" aria-hidden />
                    이메일 사용 가능 여부 확인 중…
                  </span>
                ) : emailGate.status === "unchanged" ? (
                  <span className="text-slate-500">
                    현재 등록된 이메일입니다. 변경 시 중복 여부를 다시 확인합니다.
                  </span>
                ) : emailGate.status === "result" ? (
                  <span
                    className={
                      emailGate.available ? "text-emerald-600" : "text-rose-600"
                    }
                  >
                    {emailGate.message}
                  </span>
                ) : trimmedEmail && !isWellFormedEmail(trimmedEmail) ? (
                  <span className="text-rose-600">
                    올바른 이메일 형식을 입력해 주세요.
                  </span>
                ) : null}
              </p>
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
              title={
                !canSubmit && !isSaving
                  ? initialData
                    ? "이름을 입력하고, 이메일 사용 가능 여부 확인이 끝날 때까지 기다려 주세요."
                    : "이름·이메일(사용 가능 확인 완료)·담당 직무·면접 차수를 입력해 주세요."
                  : undefined
              }
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-black transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
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
