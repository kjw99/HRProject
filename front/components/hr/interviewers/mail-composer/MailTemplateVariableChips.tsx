"use client";

import { getMailTemplateVariableMeta } from "@/lib/hr/mail-template-variable-meta";

interface MailTemplateVariableChipsProps {
  keys: string[];
  missingKeys: string[];
  resolvedValues: Record<string, string | number>;
  onSelectKey: (key: string) => void;
}

export default function MailTemplateVariableChips({
  keys,
  missingKeys,
  resolvedValues,
  onSelectKey,
}: MailTemplateVariableChipsProps) {
  if (keys.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[10px] font-bold text-slate-500">
        변수를 클릭해 값을 입력하거나 자동 채우기
      </p>
      <div className="flex flex-wrap gap-1.5">
        {keys.map((key) => {
          const isMissing = missingKeys.includes(key);
          const meta = getMailTemplateVariableMeta(key);
          const resolved = resolvedValues[key];
          const hasValue =
            resolved !== undefined &&
            resolved !== null &&
            resolved !== "" &&
            !String(resolved).startsWith("{");

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectKey(key)}
              title={`${meta.label} — 클릭하여 값 설정`}
              className={`group inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-1 text-left text-[10px] font-bold transition ${
                isMissing
                  ? "bg-amber-100 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-200/90"
                  : hasValue
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                    : "bg-white text-slate-600 ring-1 ring-slate-200/80 hover:bg-indigo-50 hover:text-indigo-700 hover:ring-indigo-200"
              }`}
            >
              <code className="shrink-0">{`{${key}}`}</code>
              {hasValue ? (
                <span className="truncate font-semibold opacity-80">
                  · {String(resolved)}
                </span>
              ) : (
                <i className="bx bx-plus-circle shrink-0 text-xs opacity-60 group-hover:opacity-100" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
