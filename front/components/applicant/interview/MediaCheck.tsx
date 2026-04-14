"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MediaCheck() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error("미디어 장치 접근 실패:", err);
      }
    }
    getMedia();
  }, []);

  return (
    <div className="space-y-6">
      {/* 카메라 프리뷰 박스 */}
      <div className="aspect-video bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl relative border-4 border-white">
        {!isCameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <i className="bx bx-loader-alt animate-spin text-4xl"></i>
            <p className="text-[14px] font-bold">카메라를 연결 중입니다...</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
        />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-[12px] font-bold flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
              Mic Active
            </div>
          </div>
        </div>
      </div>

      {/* 장비 설정 컨트롤 */}
      <div className="flex gap-4">
        <button className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <i className="bx bx-cog"></i> 설정 변경
        </button>
        <button
          onClick={() => router.push("/applicant/interview/session_001")}
          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[16px] shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
        >
          면접 시작하기
        </button>
      </div>
    </div>
  );
}
