"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type InterviewStatus = string;

export interface DeptInterviewRecord {
  id: string;
  deptName: string;
  applicantName: string;
  interviewDate: string;
  interviewTime: string;
  round: string;
  interviewer: string;
  status: InterviewStatus;
}

interface DeptInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptName: string | null;
  records: DeptInterviewRecord[];
}

const columnHelper = createColumnHelper<DeptInterviewRecord>();

export default function DeptInterviewModal({
  isOpen,
  onClose,
  deptName,
  records,
}: DeptInterviewModalProps) {
  const data = useMemo(() => {
    if (!deptName) return [];
    return records.filter((item) => item.deptName === deptName);
  }, [records, deptName]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("applicantName", {
        header: "면접자",
        cell: (info) => (
          <span className="font-black text-slate-800">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("interviewDate", {
        header: "면접일",
        cell: (info) => (
          <span className="text-slate-600 font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("interviewTime", {
        header: "면접 시간",
      }),
      columnHelper.accessor("round", {
        header: "차수",
      }),
      columnHelper.accessor("interviewer", {
        header: "면접관",
      }),
      columnHelper.accessor("status", {
        header: "상태",
        cell: (info) => {
          const status = info.getValue();
          const style =
            status === "완료"
              ? "bg-emerald-100 text-emerald-700"
              : status === "진행중"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-600";
          return (
            <span className={`rounded-md px-2 py-1 text-xs font-bold ${style}`}>
              {status}
            </span>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-indigo-600">
              {deptName ?? "부서"}
            </div>
            <h2 className="text-lg font-black text-slate-800">면접 세부 현황</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="whitespace-nowrap px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap px-6 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-sm font-semibold text-slate-400"
                    >
                      해당 직무/부서에 배정된 오늘 면접자가 없습니다.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
