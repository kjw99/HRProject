"use client";

export interface TemplateVariablePreviewItem {
  key: string;
  value: string;
  description?: string;
}

interface TemplateVariablesPreviewProps {
  title?: string;
  variables: readonly TemplateVariablePreviewItem[];
  className?: string;
  onSelectKey?: (key: string) => void;
}

export default function TemplateVariablesPreview({
  title = "템플릿 변수 프리뷰",
  variables,
  className = "",
  onSelectKey,
}: TemplateVariablesPreviewProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-4 ${className}`.trim()}
    >
      <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        <i className="bx bx-code-alt text-base text-indigo-500" />
        {title}
        {onSelectKey ? (
          <span className="normal-case tracking-normal text-slate-400">
            · 클릭하여 수정
          </span>
        ) : null}
      </p>
      <ul className="mt-3 space-y-2">
        {variables.map((item) => {
          const isEmpty =
            !item.value || item.value === "—" || item.value.startsWith("(");

          const inner = (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="text-xs font-black text-indigo-700">
                  {`{${item.key}}`}
                </code>
                <span
                  className={`max-w-[55%] truncate text-right text-xs font-semibold ${
                    isEmpty ? "text-amber-600" : "text-slate-600"
                  }`}
                >
                  {item.value || "—"}
                </span>
              </div>
              {item.description ? (
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  {item.description}
                </p>
              ) : null}
            </>
          );

          if (!onSelectKey) {
            return (
              <li
                key={item.key}
                className="rounded-lg border border-slate-200/80 bg-white px-3 py-2.5"
              >
                {inner}
              </li>
            );
          }

          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onSelectKey(item.key)}
                className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                {inner}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
