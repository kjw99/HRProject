"use client";

import { Document } from "@/types/hr";
import { useRef, useState } from "react";
import DocumentItem from "./DocumentItem";

export default function KnowledgeBase() {
  const [docs, setDocs] = useState<Document[]>([
    { id: "default_1", name: "2024_마이다스아이티_핵심가치.pdf", size: "1.2 MB", status: "vectorized", progress: 100 },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newDocId = Date.now().toString();
    const newDoc: Document = { id: newDocId, name: file.name, size: (file.size / 1024 / 1024).toFixed(1) + " MB", status: "uploading", progress: 20 };
    setDocs((prev) => [newDoc, ...prev]);
    
    // ... API upload logic omitted for brevity (same as before)
    setTimeout(() => {
      setDocs((prev) => prev.map((d) => d.id === newDocId ? { ...d, status: "vectorized", progress: 100 } : d));
    }, 2000); // Mocking upload
  };

  return (
    <div className="bg-white p-8 lg:p-10 rounded-4xl border border-slate-200/60 shadow-sm flex flex-col h-full">
      <div className="mb-8">
        <h3 className="text-[20px] font-black text-slate-900 flex items-center gap-3 mb-2">
          <i className="bx bx-library text-2xl text-indigo-500"></i> RAG 지식 베이스
        </h3>
        <p className="text-[14px] text-slate-500 font-medium">
          사내 규정, 인재상, 직무 기술서(JD)를 업로드하여 AI의 배경지식을 확장하세요.
        </p>
      </div>

      {/* 깔끔한 드래그 앤 드롭 영역 */}
      <label className="group relative border border-dashed border-slate-300 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 rounded-[24px] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer mb-8">
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
        <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-4 text-indigo-500 group-hover:scale-110 group-hover:text-indigo-600 transition-transform">
          <i className="bx bx-cloud-upload text-[32px]"></i>
        </div>
        <h4 className="font-bold text-slate-700 text-[16px]">파일을 여기로 드래그하거나 클릭하세요</h4>
        <p className="text-[13px] text-slate-400 mt-2 font-medium">지원 형식: PDF, DOCX, TXT (최대 50MB)</p>
      </label>

      {/* 파일 리스트 영역 */}
      <div className="flex-1 space-y-4">
        <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-widest px-1">
          업로드된 문서 ({docs.length})
        </h4>
        <div className="space-y-2 overflow-y-auto max-h-75 styled-scrollbar pr-2">
          {docs.map((doc) => (
            <DocumentItem key={doc.id} doc={doc} onRemove={() => setDocs(prev => prev.filter(d => d.id !== doc.id))} />
          ))}
        </div>
      </div>
    </div>
  );
}