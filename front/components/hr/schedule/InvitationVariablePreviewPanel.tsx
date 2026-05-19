"use client";

import { memo, useMemo } from "react";
import type { TemplateVariablesMap } from "@/types/invitationPreview";

export interface InvitationVariablePreviewPanelProps {
  variables: TemplateVariablesMap | null;
}

function InvitationVariablePreviewPanelImpl({
  variables,
}: InvitationVariablePreviewPanelProps) {
  /**
   * JSON.stringify는 비싸므로 variables가 바뀌지 않으면 재계산하지 않도록 useMemo.
   * 부모가 customVariablesText/draft 변경 시에만 새 객체를 내려주므로 안정적.
   */
  const serialized = useMemo(
    () =>
      variables
        ? JSON.stringify(variables, null, 2)
        : "추가 변수 JSON을 확인해주세요.",
    [variables],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">
        Variable Preview
      </p>
      <h2 className="mt-1 text-lg font-black text-slate-900">
        첫 번째 수신자 기준 렌더 변수
      </h2>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        템플릿에는 아래 키들을 사용할 수 있습니다.
      </p>
      <pre className="mt-4 max-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs font-semibold leading-6 text-slate-100">
        {serialized}
      </pre>
    </div>
  );
}

export const InvitationVariablePreviewPanel = memo(
  InvitationVariablePreviewPanelImpl,
);
