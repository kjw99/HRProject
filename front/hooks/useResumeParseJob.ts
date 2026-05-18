"use client";

import { useEffect } from "react";
import {
  useResumeParseJobContext,
  type ResumeParseJobContextValue,
} from "@/components/hr/parsing/ResumeParseJobProvider";
import type { ParsingResponse } from "@/types/parsing";

export type UseResumeParseJobResult = ResumeParseJobContextValue;

export function useResumeParseJob(
  onSucceeded?: (result: ParsingResponse) => void,
): UseResumeParseJobResult {
  const ctx = useResumeParseJobContext();

  useEffect(() => {
    if (!onSucceeded) return;
    const pending = ctx.consumePendingResult();
    if (pending) onSucceeded(pending);
    return ctx.registerOnSucceeded(onSucceeded);
  }, [ctx, onSucceeded]);

  return ctx;
}
