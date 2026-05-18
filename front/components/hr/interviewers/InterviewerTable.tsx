import { HrInterviewer } from "@/types/interviewer";
import { InterviewerSortKey, SortOrder } from "./InterviewerClient";

interface InterviewerTableProps {
  interviewers: HrInterviewer[];
  sortKey: InterviewerSortKey;
  sortOrder: SortOrder;
  onSort: (key: InterviewerSortKey) => void;
  onEdit: (interviewer: HrInterviewer) => void;
  onDelete: (interviewer: HrInterviewer) => void;
}

export default function InterviewerTable({
  interviewers,
  sortKey,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: InterviewerTableProps) {
  const renderSortIcon = (key: InterviewerSortKey) => {
    if (sortKey !== key) {
      return <i className="bx bx-sort ml-1 text-slate-300" />;
    }

    return sortOrder === "asc" ? (
      <i className="bx bx-sort-up ml-1 text-indigo-500" />
    ) : (
      <i className="bx bx-sort-down ml-1 text-indigo-500" />
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (interviewers.length === 0) {
    return (
      <div className="flex animate-in fade-in flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/50 sm:h-[4.5rem] sm:w-[4.5rem]">
          <i className="bx bx-user-voice text-3xl text-slate-300 sm:text-4xl" />
        </div>
        <p className="text-center text-[14px] font-bold text-slate-600">
          등록된 면접관이 없습니다
        </p>
        <p className="mt-1 max-w-xs text-center text-[12px] font-medium leading-relaxed text-slate-400">
          <i className="bx bx-plus-circle mr-0.5 inline align-text-bottom text-indigo-400" />
          상단의 &apos;면접관 추가&apos;로 첫 면접관을 등록해 보세요.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 데스크톱: 그리드 테이블 */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[880px] w-full">
            <div className="sticky top-0 z-10 grid grid-cols-[1.1fr_1.5fr_1fr_100px_140px_100px] border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <button
                type="button"
                className="flex w-max cursor-pointer items-center transition-colors hover:text-slate-600"
                onClick={() => onSort("interviewerName")}
              >
                이름{renderSortIcon("interviewerName")}
              </button>
              <button
                type="button"
                className="flex w-max cursor-pointer items-center transition-colors hover:text-slate-600"
                onClick={() => onSort("interviewerEmail")}
              >
                이메일{renderSortIcon("interviewerEmail")}
              </button>
              <button
                type="button"
                className="flex w-max cursor-pointer items-center transition-colors hover:text-slate-600"
                onClick={() => onSort("positionName")}
              >
                담당 직무{renderSortIcon("positionName")}
              </button>
              <button
                type="button"
                className="flex w-max cursor-pointer items-center transition-colors hover:text-slate-600"
                onClick={() => onSort("interviewRound")}
              >
                차수{renderSortIcon("interviewRound")}
              </button>
              <button
                type="button"
                className="flex w-max cursor-pointer items-center transition-colors hover:text-slate-600"
                onClick={() => onSort("createdAt")}
              >
                생성일{renderSortIcon("createdAt")}
              </button>
              <div className="text-right">관리</div>
            </div>

            <div className="divide-y divide-slate-100">
              {interviewers.map((interviewer) => (
                <div
                  key={interviewer.interviewerId}
                  className="group grid grid-cols-[1.1fr_1.5fr_1fr_100px_140px_100px] items-center px-6 py-4 transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50">
                      <i className="bx bx-user text-sm text-indigo-500" />
                    </div>
                    <span className="truncate text-[14px] font-bold text-slate-800">
                      {interviewer.interviewerName}
                    </span>
                  </div>

                  <div className="truncate pr-4 text-[13px] font-medium text-slate-500">
                    {interviewer.interviewerEmail}
                  </div>

                  <div className="truncate pr-4 text-[13px] font-bold text-slate-600">
                    {interviewer.positionName || "-"}
                  </div>

                  <div>
                    {interviewer.interviewRound ? (
                      <span className="inline-flex min-w-12 items-center justify-center rounded-full bg-indigo-50 px-2.5 py-1 text-[12px] font-black text-indigo-600">
                        {interviewer.interviewRound}
                      </span>
                    ) : (
                      <span className="text-[13px] font-medium text-slate-400">
                        -
                      </span>
                    )}
                  </div>

                  <div className="text-[13px] font-medium text-slate-500">
                    {formatDate(interviewer.createdAt)}
                  </div>

                  <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit(interviewer)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                      title="수정"
                    >
                      <i className="bx bx-edit text-lg" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(interviewer)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                      title="삭제"
                    >
                      <i className="bx bx-trash text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일·태블릿: 카드 리스트 */}
      <ul className="flex flex-col gap-3 p-3 sm:p-4 lg:hidden">
        {interviewers.map((interviewer) => (
          <li
            key={interviewer.interviewerId}
            className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/40 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50">
                  <i className="bx bx-user text-lg text-indigo-500" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-black text-slate-900">
                      {interviewer.interviewerName}
                    </p>
                    {interviewer.interviewRound ? (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-black text-indigo-600">
                        {interviewer.interviewRound}
                      </span>
                    ) : null}
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-slate-500">
                    <i className="bx bx-envelope shrink-0 text-slate-400" />
                    <span className="truncate">{interviewer.interviewerEmail}</span>
                  </p>
                  <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-slate-600">
                    <i className="bx bx-briefcase shrink-0 text-violet-400" />
                    <span className="truncate">
                      {interviewer.positionName || "직무 미지정"}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                    <i className="bx bx-calendar text-slate-400" />
                    {formatDate(interviewer.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(interviewer)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600"
                  title="수정"
                >
                  <i className="bx bx-edit text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(interviewer)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 shadow-sm transition-all hover:border-rose-200 hover:text-rose-600"
                  title="삭제"
                >
                  <i className="bx bx-trash text-lg" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
