"use client";

import React, { useState, useEffect } from "react";
import { UpcomingInterview } from "./Q4UpcomingInterviews";
import { InterviewerInput } from "@/types/hr";
import { assignInterviewers } from "@/lib/hr/interview.client";
// import { assignInterviewers, InterviewerInput } from '@/lib/api/interview.client';

interface AssignInterviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewData: UpcomingInterview | null;
}

// 💡 1. 이메일 자동 완성을 위한 도메인 리스트
const EMAIL_DOMAINS = ["gmail.com", "naver.com", "daum.net", "kakao.com"];

export default function AssignInterviewerModal({
  isOpen,
  onClose,
  interviewData,
}: AssignInterviewerModalProps) {
  const [interviewers, setInterviewers] = useState<InterviewerInput[]>([
    { name: "", email: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 💡 2. 이메일 자동완성 및 키보드 조작을 위한 상태
  const [debouncedEmails, setDebouncedEmails] = useState<string[]>([]);
  const [focusedEmailIndex, setFocusedEmailIndex] = useState<number | null>(
    null,
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // 디바운스 처리 (1초 후 검사)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmails(interviewers.map((inv) => inv.email));
    }, 1000);
    return () => clearTimeout(timer);
  }, [interviewers]);

  // 모달 초기화
  useEffect(() => {
    if (isOpen) {
      setInterviewers([{ name: "", email: "" }]);
      setErrorMsg("");
      setFocusedEmailIndex(null);
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // 이메일 정규식 검사
  const isValidEmailFormat = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isOpen || !interviewData) return null;

  /* -----------------------------------------------------------
       폼 핸들러
    ----------------------------------------------------------- */
  const handleAddInterviewer = () => {
    if (interviewers.length >= 3) return;
    setInterviewers((prev) => [...prev, { name: "", email: "" }]);
  };

  const handleRemoveInterviewer = (indexToRemove: number) => {
    setInterviewers((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInputChange = (
    index: number,
    field: keyof InterviewerInput,
    value: string,
  ) => {
    // 💡 3. 이메일을 타이핑하면 하이라이트 인덱스 초기화
    if (field === "email") setHighlightedIndex(-1);

    setInterviewers((prev) => {
      const newArray = [...prev];
      newArray[index][field] = value;
      return newArray;
    });
  };

  /* -----------------------------------------------------------
       API 전송 핸들러
    ----------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const hasEmptyField = interviewers.some(
      (inv) => !inv.name.trim() || !inv.email.trim(),
    );
    if (hasEmptyField) {
      setErrorMsg("모든 면접관의 이름과 이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await assignInterviewers({
        interviewId: interviewData.id,
        interviewers: interviewers,
      });
      alert(res.message);
      onClose();
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* 💡 모달 너비 확장 (max-w-md -> max-w-lg) 한 행에 Input 2개가 예쁘게 들어가도록 조절 */}
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 상단 헤더 */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between">
          <div>
            <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
              {interviewData.team}
            </span>
            <h2 className="text-lg font-black text-slate-800">
              {interviewData.round} 면접관 할당
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-bold flex items-center gap-1">
              <i className="bx bx-user-badge"></i> 면접자{" "}
              {interviewData.intervieweeCount}명 대기 중
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>

        {/* 중간: 입력 폼 영역 */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200"
        >
          <div className="space-y-4">
            {interviewers.map((interviewer, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl relative group hover:bg-slate-50 transition-colors"
              >
                {/* 삭제 버튼 */}
                {interviewers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInterviewer(idx)}
                    className="absolute right-3 top-3 text-slate-300 hover:text-rose-500 transition-colors p-1"
                  >
                    <i className="bx bx-trash text-lg"></i>
                  </button>
                )}

                <div className="mb-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                    면접관 #{idx + 1}
                  </span>
                </div>

                {/* 한 행에 배치 및 반응형 */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-4">
                  {/* 이름 Input */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      이름
                    </label>
                    <div className="relative">
                      <i className="bx bx-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
                      <input
                        type="text"
                        placeholder="예: 홍길동"
                        value={interviewer.name}
                        onChange={(e) =>
                          handleInputChange(idx, "name", e.target.value)
                        }
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* 이메일 Input (자동완성 & 키보드 조작 적용) */}
                  <div className="relative">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      이메일 주소
                    </label>

                    {(() => {
                      const currentEmail = interviewer.email;
                      const debouncedEmail = debouncedEmails[idx];
                      const isTyping = currentEmail !== debouncedEmail;
                      const hasValue = currentEmail.length > 0;
                      const isValid = isValidEmailFormat(currentEmail);

                      const showSuccess = hasValue && !isTyping && isValid;
                      const showError = hasValue && !isTyping && !isValid;

                      const hasAtSymbol = currentEmail.includes("@");
                      const [localPart, domainPart] = currentEmail.split("@");

                      const suggestions =
                        hasAtSymbol && focusedEmailIndex === idx
                          ? EMAIL_DOMAINS.filter((domain) =>
                              domain.startsWith(domainPart || ""),
                            ).map((domain) => `${localPart}@${domain}`)
                          : [];

                      // 💡 4. 키보드 이벤트 핸들러
                      const handleKeyDown = (
                        e: React.KeyboardEvent<HTMLInputElement>,
                      ) => {
                        if (suggestions.length === 0) return;

                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setHighlightedIndex((prev) =>
                            prev < suggestions.length - 1 ? prev + 1 : prev,
                          );
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setHighlightedIndex((prev) =>
                            prev > 0 ? prev - 1 : 0,
                          );
                        } else if (e.key === "Enter") {
                          if (
                            highlightedIndex >= 0 &&
                            highlightedIndex < suggestions.length
                          ) {
                            e.preventDefault();
                            handleInputChange(
                              idx,
                              "email",
                              suggestions[highlightedIndex],
                            );
                            setFocusedEmailIndex(null);
                          }
                        } else if (e.key === "Escape") {
                          setFocusedEmailIndex(null);
                        }
                      };

                      return (
                        <div className="relative">
                          <i
                            className={`bx bx-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-base transition-colors ${showError ? "text-rose-400" : "text-slate-400"}`}
                          ></i>

                          <input
                            type="email"
                            placeholder="hong@company.com"
                            value={currentEmail}
                            onChange={(e) =>
                              handleInputChange(idx, "email", e.target.value)
                            }
                            onFocus={() => {
                              setFocusedEmailIndex(idx);
                              setHighlightedIndex(-1); // 💡 5. 포커스 시 하이라이트 초기화
                            }}
                            onBlur={() => setFocusedEmailIndex(null)}
                            onKeyDown={handleKeyDown} // 💡 6. 이벤트 연결
                            className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all shadow-sm placeholder:text-slate-300
                                                            ${
                                                              showError
                                                                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-600 bg-rose-50/30"
                                                                : showSuccess
                                                                  ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                                                  : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                                            }`}
                          />

                          {showSuccess && (
                            <i className="bx bx-check-circle absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-lg animate-in zoom-in"></i>
                          )}
                          {showError && (
                            <i className="bx bx-error-circle absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500 text-lg animate-in zoom-in"></i>
                          )}

                          {showError && (
                            <p className="absolute -bottom-5 left-1 text-[10px] font-bold text-rose-500 animate-in fade-in slide-in-from-top-1">
                              올바른 이메일 형식이 아닙니다.
                            </p>
                          )}

                          {/* 💡 7. 자동완성 목록 및 하이라이트 적용 */}
                          {suggestions.length > 0 && (
                            <ul className="absolute z-20 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] py-1.5 animate-in fade-in zoom-in-95 duration-100">
                              {suggestions.map(
                                (suggestionEmail, suggestionIdx) => {
                                  const isHighlighted =
                                    highlightedIndex === suggestionIdx;

                                  return (
                                    <li key={suggestionEmail}>
                                      <button
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleInputChange(
                                            idx,
                                            "email",
                                            suggestionEmail,
                                          );
                                          setFocusedEmailIndex(null);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors
                                                                                ${
                                                                                  isHighlighted
                                                                                    ? "bg-indigo-50 text-indigo-600"
                                                                                    : "text-slate-600 hover:bg-slate-50"
                                                                                }`}
                                      >
                                        <span
                                          className={
                                            isHighlighted
                                              ? "text-indigo-400"
                                              : "text-slate-400"
                                          }
                                        >
                                          {localPart}@
                                        </span>
                                        <span className="font-bold">
                                          {suggestionEmail.split("@")[1]}
                                        </span>
                                      </button>
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 동적 추가 버튼 */}
          {interviewers.length < 3 && (
            <button
              type="button"
              onClick={handleAddInterviewer}
              className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm font-bold hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <i className="bx bx-plus text-base"></i>
              </div>
              면접관 추가하기 ({interviewers.length}/3)
            </button>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-2 text-rose-600">
              <i className="bx bx-error-circle text-lg shrink-0 mt-0.5"></i>
              <p className="text-sm font-bold">{errorMsg}</p>
            </div>
          )}

          {/* 하단 생성 버튼 */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-black transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <i className="bx bx-loader-alt bx-spin text-lg"></i>
              ) : (
                <i className="bx bx-check text-lg"></i>
              )}
              {isLoading ? "할당 중..." : "면접관 할당"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
