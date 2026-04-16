"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/types/hr";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

export default function Playground({ tone, techWeight, prompt }: { tone: string, techWeight: number, prompt: string }) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'system', content: '설정된 페르소나를 바탕으로 모의 테스트를 시작합니다.' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // prompt state는 SettingsClient에서 관리하며, Playground로 prop으로 전달받도록 변경
  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const isTech = techWeight >= 70;
      const aiResponse = isTech 
        ? (tone === 'strict' ? "제시해주신 기술 스택 도입 과정에서 마주친 치명적인 오류와 이를 해결하기 위해 아키텍처 관점에서 내린 결단은 무엇이었습니까?" : "해당 프로젝트에서 기술적 어려움은 없으셨나요? 트러블슈팅 사례를 공유해주세요.")
        : "팀원들과의 협업 과정에서 의견 충돌이 발생했을 때, 본인만의 조율 방식이 있다면 사례와 함께 말씀해주시겠어요?";
      
      setMessages(prev => [...prev, { role: 'agent', content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <style>{`.styled-scrollbar::-webkit-scrollbar { width: 5px; } .styled-scrollbar::-webkit-scrollbar-track { background: transparent; } .styled-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; } .styled-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; } .dark-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }`}</style>
      
      <div className="flex justify-center items-center h-full w-full">
        {/* 모던한 스마트폰/채팅 위젯 디자인 (불필요한 테두리 최소화) */}
        <div className="w-full h-[600px] lg:h-[760px] bg-slate-900 rounded-[32px] flex flex-col overflow-hidden shadow-2xl relative border border-slate-800">
          
          {/* Header */}
          <div className="pt-6 pb-5 px-6 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center z-10 shrink-0">
            <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Playground
            </h3>
            <div className="flex gap-2">
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">{tone}</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Tech {techWeight}%</span>
            </div>
          </div>

          {/* Chat Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B1120] dark-scrollbar scroll-smooth">
            {messages.map((msg, idx) => <ChatMessage key={idx} msg={msg} />)}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 shrink-0 border-t border-slate-800">
            <div className="relative flex items-end gap-3 bg-slate-800/50 p-2 rounded-[20px] border border-slate-700/50 focus-within:border-indigo-500/50 transition-colors">
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} 
                placeholder="답변을 입력해보세요..." 
                className="w-full bg-transparent text-slate-200 text-[14px] px-3 py-2.5 outline-none resize-none max-h-[120px] min-h-[44px] placeholder-slate-500 dark-scrollbar" 
                rows={1} 
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping} 
                className="w-11 h-11 rounded-[14px] bg-indigo-500 text-white flex items-center justify-center shrink-0 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors"
              >
                <i className='bx bx-send text-xl'></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}