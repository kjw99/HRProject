"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useMemo, useState, type ReactNode } from "react";
import { RESUME_PARSE_POSITION_ALL } from "@/lib/hr/parsing.constants";
import type { ResumeParsingResultsSectionProps } from "@/types/parsing-ui";
import type { TableRowData } from "@/types/parsing";

const columnHelper = createColumnHelper<TableRowData>();

const DATA_CELL_CLASS =
  "text-sm font-semibold text-slate-800 antialiased";

function DataCell({
  children,
  className = "",
  tabular = false,
}: {
  children: ReactNode;
  className?: string;
  tabular?: boolean;
}) {
  return (
    <span
      className={`${DATA_CELL_CLASS} ${tabular ? "tabular-nums tracking-tight" : ""} ${className}`}
    >
      {children}
    </span>
  );
}

function BoolCell({ value }: { value: boolean }) {
  return (
    <span className="flex justify-center">
      {value ? (
        <i
          className="bx bx-check text-xl font-bold text-emerald-600"
          aria-label="\uD574\uB2F9"
        />
      ) : (
        <span className="text-slate-300" aria-hidden>
          {"\u2014"}
        </span>
      )}
    </span>
  );
}

export default function ResumeParsingResultsSection({
  rows,
  positionOptions,
  filterPosition,
  globalSearch,
  onFilterPositionChange,
  onGlobalSearchChange,
  onViewDetail,
  onDeleteRow,
  onDownloadExcel,
  excelFileName,
  hasExcel,
}: ResumeParsingResultsSectionProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "\uC774\uB984",
        cell: (info) => (
          <span className="font-bold text-slate-800">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("birth", {
        header: "\uC0DD\uB144\uC6D4\uC77C",
        cell: (info) => (
          <DataCell tabular>{info.getValue()}</DataCell>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "\uC5F0\uB77D\uCC98",
        cell: (info) => (
          <DataCell tabular>{info.getValue()}</DataCell>
        ),
      }),
      columnHelper.accessor("email", {
        header: "\uC774\uBA54\uC77C",
        cell: (info) => (
          <DataCell className="block max-w-[180px] truncate">
            {info.getValue()}
          </DataCell>
        ),
      }),
      columnHelper.accessor("position", {
        header: "\uC9C1\uBB34",
        cell: (info) => (
          <span className="inline-flex rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("isDuplicate", {
        header: () => (
          <span className="block text-center">{"\uC911\uBCF5"}</span>
        ),
        cell: (info) => <BoolCell value={info.getValue()} />,
      }),
      columnHelper.accessor("criteriaMet", {
        header: () => (
          <span className="block text-center">{"\uC6B0\uB300"}</span>
        ),
        cell: (info) => <BoolCell value={info.getValue()} />,
      }),
      columnHelper.display({
        id: "action",
        header: "\uAD00\uB9AC",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRow(row.original);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            title={"\uC9C0\uC6D0\uC790 \uC0AD\uC81C"}
          >
            <i className="bx bx-trash text-sm" />
            {"\uC0AD\uC81C"}
          </button>
        ),
      }),
    ],
    [onDeleteRow],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter: globalSearch, columnFilters },
    onGlobalFilterChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(globalSearch) : updater;
      onGlobalSearchChange(String(next ?? ""));
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handlePositionChange = (position: string) => {
    onFilterPositionChange(position);
    setColumnFilters(
      position === RESUME_PARSE_POSITION_ALL
        ? []
        : [{ id: "position", value: position }],
    );
  };

  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03] sm:rounded-3xl">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-black text-slate-800 sm:text-lg">
            <i className="bx bx-table text-indigo-500" />
            {"\uD30C\uC2F1 \uACB0\uACFC"}
            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">
              {rows.length}
              {"\uAC74"}
            </span>
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {
              "\uD589\uC744 \uD074\uB9AD\uD558\uBA74 \uC0C1\uC138 \uC815\uBCF4\uB97C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."
            }
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {hasExcel && onDownloadExcel ? (
            <button
              type="button"
              onClick={onDownloadExcel}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <i className="bx bx-download" />
              {excelFileName ?? "\uC5D1\uC140 \uB2E4\uC6B4\uB85C\uB4DC"}
            </button>
          ) : null}

          <select
            value={filterPosition}
            onChange={(e) => handlePositionChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            aria-label={"\uC9C1\uBB34 \uD544\uD130"}
          >
            {positionOptions.map((pos) => (
              <option key={pos} value={pos}>
                {pos === RESUME_PARSE_POSITION_ALL
                  ? "\uC804\uCCB4 \uC9C1\uBB34"
                  : pos}
              </option>
            ))}
          </select>

          <div className="relative">
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 sm:w-56"
              placeholder={"\uC774\uB984\u00B7\uC5F0\uB77D\uCC98 \uAC80\uC0C9"}
              aria-label={"\uACB0\uACFC \uAC80\uC0C9"}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50/80">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-slate-100 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm font-semibold text-slate-400"
                >
                  {
                    "\uAC80\uC0C9 \uC870\uAC74\uC5D0 \uB9DE\uB294 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
                  }
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onViewDetail(row.original)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onViewDetail(row.original);
                    }
                  }}
                  className="cursor-pointer border-b border-slate-50 transition hover:bg-indigo-50/40 focus-visible:bg-indigo-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 align-middle text-slate-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
