"use client";

import React, { useState, useRef, useEffect } from "react";

// ==========================================
// 🏷️ Types
// ==========================================
interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

export default function InterviewSession() {
  // 💡 [해결 1] 하이드레이션 에러 방지를 위한 마운트 상태 관리
  const [mounted, setMounted] = useState(false);

  // 💡 [해결 2] 초기 메시지에서 동적 시간 제거 (마운트 후 useEffect에서 설정)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-init",
      role: "ai",
      content:
        '안녕하세요! A-RECRUIT AI 면접관입니다. 만나서 반갑습니다. 오늘 면접은 약 20분간 진행되며, 편안한 마음으로 답변해 주시면 됩니다. 준비가 되셨다면 "네, 준비되었습니다" 라고 말씀해 주시거나 입력해 주세요.',
      timestamp: "", // 처음엔 비워둡니다.
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);

  // 💡 [해결 3] 마운트 시점에 첫 메시지의 시간을 설정
  useEffect(() => {
    setMounted(true);

    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "msg-init" ? { ...msg, timestamp: now } : msg,
      ),
    );

    // 카메라 접근 로직
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("카메라 접근 불가:", err));
  }, []);

  // 메시지 스크롤 로직
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  // 헬퍼 함수: 시간 생성 (클라이언트에서만 호출됨)
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isAiThinking) return;

    const newUserMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: getCurrentTime(), // 💡 함수로 분리하여 호출
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsAiThinking(true);

    try {
      const response = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "SESSION_123",
          history: messages,
          newMessage: newUserMsg.content,
        }),
      });

      if (!response.ok) throw new Error("API Not Ready");

      const data = await response.json();
      const newAiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: "ai",
        content: data.reply,
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockAiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: "ai",
        content:
          "네, 확인했습니다. 성능 최적화 경험에 대해 자세히 설명해 주시겠어요?",
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, mockAiMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // 💡 [방어 코드] 마운트 전에는 빈 화면이나 스켈레톤을 보여주어 mismatch 방지
  if (!mounted)
    return (
      <div className="w-full h-full bg-slate-50 animate-pulse rounded-[32px]" />
    );
  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-8 overflow-hidden">
      {/* 🟢 좌측: 메인 채팅 인터페이스 */}
      <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
        {/* 대화 기록 영역 */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 styled-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* 아바타 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                  msg.role === "ai"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {msg.role === "ai" ? (
                  <i className="bx bx-brain text-xl"></i>
                ) : (
                  <i className="bx bx-user text-xl"></i>
                )}
              </div>

              {/* 말풍선 */}
              <div
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}
              >
                <span className="text-[11px] font-bold text-slate-400 mb-1.5 px-1">
                  {msg.role === "ai" ? "AI 면접관" : "지원자"} • {msg.timestamp}
                </span>
                <div
                  className={`px-6 py-4 rounded-[24px] text-[15px] font-medium leading-relaxed ${
                    msg.role === "ai"
                      ? "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none"
                      : "bg-indigo-600 text-white shadow-md shadow-indigo-200 rounded-tr-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* AI가 답변을 생각 중일 때 표시되는 인디케이터 */}
          {isAiThinking && (
            <div className="flex gap-4 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white border border-indigo-700 flex items-center justify-center shadow-sm">
                <i className="bx bx-brain text-xl"></i>
              </div>
              <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-[24px] rounded-tl-none flex items-center gap-2">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 영역 */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-center"
          >
            {/* 음성 입력 버튼 (디자인) */}
            <button
              type="button"
              className="absolute left-3 w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-indigo-500 transition-colors"
            >
              <i className="bx bx-microphone text-2xl"></i>
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isAiThinking}
              placeholder={
                isAiThinking
                  ? "AI가 답변을 분석하고 있습니다..."
                  : "답변을 입력하거나 마이크로 말씀해 주세요."
              }
              className="w-full bg-slate-50 border text-slate-900 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-[20px] py-4 pl-14 pr-16 text-[15px] font-medium outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isAiThinking}
              className="absolute right-3 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md disabled:opacity-50 disabled:bg-slate-300 hover:bg-indigo-700 transition-colors"
            >
              <i className="bx bxs-send text-lg"></i>
            </button>
          </form>
        </div>
      </div>

      {/* 🟢 우측: 내 웹캠 화면 및 정보 패널 (데스크탑에서만 보임) */}
      <div className="hidden lg:flex w-[320px] shrink-0 flex-col gap-6">
        {/* 카메라 뷰어 */}
        <div className="bg-slate-900 rounded-[24px] aspect-[3/4] overflow-hidden relative shadow-lg border-4 border-white">
          <video
            ref={myVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          ></video>
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[11px] font-bold flex items-center gap-2 border border-white/10">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>{" "}
            REC
          </div>
        </div>

        {/* AI 피드백 상태창 (시각적 연출) */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex-1">
          <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2 mb-4 uppercase tracking-widest">
            <i className="bx bx-radar text-indigo-500"></i> AI 실시간 분석
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                <span>답변 명확성</span>
                <span className="text-emerald-500">Good</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                <span>직무 연관성</span>
                <span className="text-indigo-500">Analyzing...</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[60%] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤바 커스텀 CSS */}
      <style>{`
        .styled-scrollbar::-webkit-scrollbar { width: 6px; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .mirror { transform: scaleX(-1); }
      `}</style>
    </div>
  );
}
