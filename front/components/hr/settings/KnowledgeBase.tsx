"use client";

import React, { useState, useRef } from "react";

// ==========================================
// 🏷️ [Types] 문서 상태 정의
// ==========================================
interface Document {
  id: string;
  name: string;
  size: string;
  status: "vectorized" | "uploading" | "error";
  progress: number;
}

export default function KnowledgeBase() {
  // 1. 상태 관리
  const [docs, setDocs] = useState<Document[]>([
    {
      id: "default_1",
      name: "2024_마이다스아이티_핵심가치.pdf",
      size: "1.2 MB",
      status: "vectorized",
      progress: 100,
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. 파일 업로드 핸들러 (FastAPI 연동)
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 새로운 문서 객체 생성 (업로드 중 상태)
    const newDocId = Date.now().toString();
    const newDoc: Document = {
      id: newDocId,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      status: "uploading",
      progress: 20, // 초기 진행률 시각화
    };

    setDocs((prev) => [newDoc, ...prev]);

    // 실제 백엔드 전송을 위한 FormData 구성
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🚀 백엔드 API 호출
      const response = await fetch(
        "http://localhost:8000/api/knowledge/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Upload failed");

      // 성공 시 상태 업데이트
      setDocs((prev) =>
        prev.map((d) =>
          d.id === newDocId ? { ...d, status: "vectorized", progress: 100 } : d,
        ),
      );
    } catch (err) {
      console.error("Upload Error:", err);
      // 에러 발생 시 상태 업데이트
      setDocs((prev) =>
        prev.map((d) =>
          d.id === newDocId ? { ...d, status: "error", progress: 0 } : d,
        ),
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 3. 문서 삭제
  const removeDoc = (id: string) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[32px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h3 className="text-[20px] sm:text-[22px] font-black text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0">
              <i className="bx bx-data text-[26px]"></i>
            </div>
            RAG 지식 베이스
          </h3>
          <p className="text-[13px] sm:text-[14px] text-slate-500 font-medium mt-3 leading-relaxed">
            에이전트가 참고할 사내 규정, 인재상, 직무 기술서(JD)를 업로드하세요.
            <br />
            AI가 실시간으로 임베딩하여 질문 생성에 반영합니다.
          </p>
        </div>
      </div>

      {/* 4. 드래그 앤 드롭 / 클릭 업로드 영역 */}
      <label className="relative group overflow-hidden border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-[28px] p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer mb-8">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.docx,.txt"
        />
        <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

        <div className="w-20 h-20 bg-white border border-slate-100 shadow-md rounded-[20px] flex items-center justify-center mb-5 group-hover:-translate-y-2 transition-transform duration-300">
          <i className="bx bx-cloud-upload text-[40px] text-blue-500"></i>
        </div>
        <h4 className="font-black text-slate-800 text-[16px] sm:text-[18px]">
          클릭하거나 파일을 여기로 드래그하세요
        </h4>
        <p className="text-[12px] text-slate-400 mt-2 font-bold bg-white px-4 py-1.5 rounded-full border border-slate-100 mt-4 shadow-sm">
          지원 형식: PDF, DOCX, TXT (최대 50MB)
        </p>
      </label>

      {/* 5. 파일 리스트 영역 */}
      <div className="flex-1 space-y-4">
        <h4 className="font-black text-slate-700 text-[12px] uppercase tracking-widest flex items-center gap-2 mb-4">
          <i className="bx bx-folder text-lg text-slate-400"></i> 임베딩 완료
          문서 ({docs.filter((d) => d.status === "vectorized").length})
        </h4>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[400px] pr-2 styled-scrollbar">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-4 sm:p-5 transition-all rounded-[20px] border shadow-sm group ${
                doc.status === "error"
                  ? "bg-red-50/50 border-red-100"
                  : "bg-slate-50 hover:bg-white border-slate-200/60"
              }`}
            >
              <div className="flex items-center gap-4 overflow-hidden flex-1">
                {/* 아이콘: 상태에 따라 변화 */}
                <div
                  className={`w-12 h-12 rounded-[14px] border flex items-center justify-center shadow-sm shrink-0 transition-all ${
                    doc.status === "uploading"
                      ? "bg-blue-50 border-blue-100"
                      : doc.status === "error"
                        ? "bg-white border-red-200"
                        : "bg-white border-slate-200"
                  }`}
                >
                  {doc.status === "uploading" ? (
                    <i className="bx bx-loader-alt bx-spin text-blue-500 text-[24px]"></i>
                  ) : doc.status === "error" ? (
                    <i className="bx bx-error text-red-500 text-[24px]"></i>
                  ) : (
                    <i className="bx bxs-file-pdf text-red-500 text-[24px]"></i>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-bold text-[14px] truncate ${doc.status === "error" ? "text-red-700" : "text-slate-800"}`}
                    >
                      {doc.name}
                    </p>
                  </div>

                  {/* 업로드 중일 때 진행률 바 표시 */}
                  {doc.status === "uploading" ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${doc.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-blue-500">
                        {doc.progress}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${doc.status === "error" ? "bg-red-400" : "bg-emerald-500"}`}
                      ></span>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {doc.status === "error"
                          ? "Embedding Failed"
                          : `Vectorized • ${doc.size}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <button
                onClick={() => removeDoc(doc.id)}
                className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all shrink-0 ml-4 group-hover:scale-110 active:scale-95"
              >
                <i className="bx bx-trash text-[20px]"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
