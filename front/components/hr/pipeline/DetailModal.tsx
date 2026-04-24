"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicantId: string | null;
    applicantName: string; // 헤더 표시용
}

// 백엔드에서 받아올 상세 데이터 타입
interface ApplicantDetail {
    email: string;
    phone: string;
    education: string;
    portfolio: string;
    aiSummary: string;
}

export default function DetailModal({ isOpen, onClose, applicantId, applicantName }: DetailModalProps) {
    const [detailData, setDetailData] = useState<ApplicantDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 💡 핵심: 모달이 열리고 applicantId가 있을 때 백엔드 데이터 호출
    useEffect(() => {
        if (isOpen && applicantId) {
            setIsLoading(true);
            setDetailData(null); // 이전 데이터 초기화

            // API 호출 시뮬레이션 (실제로는 axios.get(`/api/applicants/${applicantId}`) 등이 들어감)
            const fetchDetail = setTimeout(() => {
                setDetailData({
                    email: 'applicant@midasit.com',
                    phone: '010-1234-5678',
                    education: '한국대학교 소프트웨어공학과',
                    portfolio: 'https://github.com/awesome-dev',
                    aiSummary: '이 지원자는 직무 적합도가 매우 높으며, 특히 이전 프로젝트에서 보여준 문제 해결 능력이 당사의 인재상과 완벽히 일치합니다. 면접 시 리더십 경험에 대한 심층 질문을 권장합니다.',
                });
                setIsLoading(false);
            }, 800); // 0.8초 로딩 대기

            return () => clearTimeout(fetchDetail);
        }
    }, [isOpen, applicantId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
                    {/* 1. 배경 오버레이 (클릭 시 닫힘) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
                    />

                    {/* 2. 모달 컨테이너 (Figma Style) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">지원자 상세 정보</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    <span className="font-bold text-indigo-600">{applicantName}</span>님의 상세 프로필
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
                                <i className='bx bx-x text-2xl'></i>
                            </button>
                        </div>

                        {/* 바디 (데이터 표시 영역) */}
                        <div className="p-6 bg-slate-50/50">
                            {isLoading || !detailData ? (
                                // 로딩 중 UI (Skeleton)
                                <div className="space-y-6 animate-pulse">
                                    <div className="h-24 bg-indigo-50 rounded-2xl w-full"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-12 bg-slate-100 rounded-xl"></div>
                                        <div className="h-12 bg-slate-100 rounded-xl"></div>
                                        <div className="h-12 bg-slate-100 rounded-xl"></div>
                                        <div className="h-12 bg-slate-100 rounded-xl"></div>
                                    </div>
                                </div>
                            ) : (
                                // 데이터 로드 완료 UI
                                <div className="space-y-6">
                                    {/* AI 요약 리포트 박스 */}
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 relative overflow-hidden">
                                        <i className='bx bxs-bot absolute -right-2 -bottom-4 text-6xl text-indigo-500/10'></i>
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <i className='bx bxs-zap'></i> AI 분석 요약
                                        </h4>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                            {detailData.aiSummary}
                                        </p>
                                    </div>

                                    {/* 상세 정보 그리드 */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">연락처</span>
                                            <span className="text-sm font-bold text-slate-800">{detailData.phone}</span>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">이메일</span>
                                            <span className="text-sm font-bold text-slate-800 break-all">{detailData.email}</span>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm col-span-2">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">학력 사항</span>
                                            <span className="text-sm font-bold text-slate-800">{detailData.education}</span>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm col-span-2">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">포트폴리오</span>
                                            <a href={detailData.portfolio} target="_blank" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                                {detailData.portfolio} <i className='bx bx-link-external'></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 푸터 */}
                        <div className="p-4 border-t border-slate-100 flex justify-end bg-white">
                            <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                닫기
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}