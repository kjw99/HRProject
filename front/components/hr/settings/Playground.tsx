'use client';

import React, { useState, useRef, useEffect } from 'react';

interface PlaygroundProps {
  tone: string;
  techWeight: number;
}

interface Message {
  role: 'system' | 'user' | 'agent';
  content: string;
}

export default function Playground({ tone, techWeight }: PlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: '설정된 페르소나와 가중치를 기반으로 모의 테스트를 시작합니다.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 전체 화면 스크롤 문제를 방지하기 위해 컨테이너의 스크롤을 직접 제어합니다.
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      let aiResponse = "";
      if (techWeight >= 70) {
        aiResponse = tone === 'strict'
          ? "제시해주신 기술 스택 도입 과정에서 마주친 치명적인 오류와 이를 해결하기 위해 아키텍처 관점에서 내린 결단은 무엇이었습니까?"
          : "해당 프로젝트에서 기술적 어려움은 없으셨나요? 트러블슈팅 사례를 공유해주세요.";
      } else {
        aiResponse = "팀원들과의 협업 과정에서 의견 충돌이 발생했을 때, 본인만의 조율 방식이 있다면 사례와 함께 말씀해주시겠어요?";
      }

      setMessages(prev => [...prev, { role: 'agent', content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* 커스텀 스크롤바 디자인 주입 */}
      <style>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155; /* slate-700 */
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569; /* slate-600 */
        }
        .styled-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #334155 transparent;
        }
      `}</style>

      <div className="flex justify-center items-center h-full w-full py-4 lg:sticky lg:top-24">

        {/* 📱 스마트폰 외곽선 (Bezel & Body) 
            모바일: 테두리 없이 꽉 찬 화면 레이아웃
            데스크탑(lg): 기존의 폰 목업 디자인 적용
        */}
        <div className="w-full max-w-md lg:w-[360px] h-[650px] lg:h-[740px] bg-slate-900 rounded-[32px] lg:rounded-[50px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-4 lg:border-[12px] border-slate-900 lg:border-slate-950 relative ring-1 ring-slate-800/50 transition-all duration-300">

          {/* 다이내믹 아일랜드 (Notch) - 모바일 화면에서는 숨김 처리 */}
          <div className="hidden lg:flex absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[28px] bg-slate-950 rounded-b-[20px] z-50 justify-center items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800/50 shadow-inner"></div>
            <div className="w-3 h-3 rounded-full bg-[#0a0a0a] shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-900/40"></div>
            </div>
          </div>

          {/* Playground Header */}
          <div className="pt-6 lg:pt-10 pb-4 px-5 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center z-10 backdrop-blur-md shrink-0">
            <h3 className="text-[14px] font-black text-white flex items-center gap-2">
              <i className='bx bx-terminal text-emerald-400'></i>
              사전 테스트
            </h3>
            <div className="flex gap-1.5">
              <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-2 py-1 rounded-md border border-slate-700 uppercase">
                {tone}
              </span>
              <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-2 py-1 rounded-md border border-slate-700 uppercase">
                Tech {techWeight}%
              </span>
            </div>
          </div>

          {/* Chat Area (스크롤 컨테이너) */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1120] styled-scrollbar relative scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'system' && (
                  <div className="w-full text-center my-2">
                    <span className="bg-slate-800/80 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700/50 shadow-sm backdrop-blur-sm">
                      {msg.content}
                    </span>
                  </div>
                )}

                {msg.role === 'agent' && (
                  <div className="flex gap-2.5 max-w-[90%]">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                      <i className='bx bx-bot text-lg'></i>
                    </div>
                    <div className="bg-slate-800 text-slate-200 p-3.5 rounded-[20px] rounded-tl-none border border-slate-700 text-[13px] leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="bg-emerald-500 text-white p-3.5 rounded-[20px] rounded-tr-none text-[13px] leading-relaxed shadow-md max-w-[85%]">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%] animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <i className='bx bx-bot text-lg'></i>
                </div>
                <div className="bg-slate-800 p-3.5 rounded-[20px] rounded-tl-none border border-slate-700 flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area (하단 홈 바 포함) */}
          <div className="p-3 border-t border-slate-800 bg-slate-900 pb-4 lg:pb-8 relative shrink-0">
            <div className="relative flex items-end gap-2 bg-slate-800 p-1.5 rounded-[20px] border border-slate-700 focus-within:border-emerald-500/50 transition-colors shadow-inner">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="가상의 지원자 상황을 입력하세요..."
                className="w-full bg-transparent text-slate-200 text-[13px] px-3 py-2 outline-none resize-none max-h-[100px] min-h-[40px] placeholder-slate-500 styled-scrollbar"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-[16px] bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-sm"
              >
                <i className='bx bx-send text-xl'></i>
              </button>
            </div>

            {/* 하단 홈 바 (Home Indicator) - 모바일 환경에서는 숨김 */}
            <div className="hidden lg:block absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-slate-600/50 rounded-full"></div>
          </div>

        </div>
      </div>
    </>
  );
}