"use client";

export interface ScheduleActionsSidebarProps {
  isLoading: boolean;
  onRefresh: () => void;
  onStartCreateSchedule: () => void;
  onOpenInvitationModal: () => void;
}

export function ScheduleActionsSidebar({
  isLoading,
  onRefresh,
  onStartCreateSchedule,
  onOpenInvitationModal,
}: ScheduleActionsSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-black/4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Quick actions
        </p>
        <h2 className="mt-1 text-lg font-black text-slate-900">일정 운영</h2>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
          일정 생성은 우측 에디터 패널로 바로 연결하고, 예약 초대만 별도 모달로
          엽니다.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={onStartCreateSchedule}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.99]"
          >
            <i className="bx bx-calendar-plus text-lg" />
            면접 일정 생성
          </button>
          <button
            type="button"
            onClick={onOpenInvitationModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <i className="bx bx-envelope text-lg" />
            예약 초대 링크
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <i
              className={`bx bx-refresh text-lg ${isLoading ? "animate-spin" : ""}`}
            />
            목록 새로고침
          </button>
        </div>
      </div>
    </aside>
  );
}
