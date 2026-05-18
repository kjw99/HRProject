'use client';

import React from 'react';
import { TableRowData } from '@/types/parsing';

interface ResumeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: TableRowData | null;
}

export default function ResumeDetailModal({ isOpen, onClose, data }: ResumeDetailModalProps) {
    if (!isOpen || !data) return null;

    const { raw } = data;
    const aiProfile = raw.record.aiProfile;
    const candidate = raw.record.candidate;
    const match = raw.record.positionMatch;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            {/* 모달 컨테이너 (스크롤 가능하도록 높이 제한) */}
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* 💡 헤더 영역 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <i className="bx bx-user text-xl"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                {data.name}
                                <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md">
                                    {aiProfile.target_position || '직무 미상'}
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">{raw.filename}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <i className="bx bx-x text-2xl"></i>
                    </button>
                </div>

                {/* 💡 본문 영역 (스크롤) */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 좌측단 (인적사항 및 매칭 결과) */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* 매칭 결과 카드 */}
                            <div className={`p-4 rounded-2xl border ${match.status === 'matched' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                <h3 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 
                                    ${match.status === 'matched' ? 'text-emerald-600' : 'text-rose-600'}">
                                    <i className={`bx ${match.status === 'matched' ? 'bx-check-circle' : 'bx-error-circle'} text-base`}></i>
                                    직무 매칭 결과
                                </h3>
                                <p className="text-sm font-bold text-slate-700 mb-1">{match.matchedPositionName || match.rawPosition || '매칭된 직무 없음'}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{match.reason}</p>
                            </div>

                            {/* 인적사항 카드 */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">기본 인적사항</h3>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex flex-col gap-1">
                                        <span className="text-slate-400 text-xs font-bold"><i className="bx bx-envelope"></i> 이메일</span>
                                        <span className="font-medium text-slate-700">{candidate.email || '미기재'}</span>
                                    </li>
                                    <li className="flex flex-col gap-1">
                                        <span className="text-slate-400 text-xs font-bold"><i className="bx bx-phone"></i> 연락처</span>
                                        <span className="font-medium text-slate-700">{candidate.phone || '미기재'}</span>
                                    </li>
                                    <li className="flex flex-col gap-1">
                                        <span className="text-slate-400 text-xs font-bold"><i className="bx bx-calendar"></i> 생년월일</span>
                                        <span className="font-medium text-slate-700">{candidate.dateOfBirth || '미기재'}</span>
                                    </li>
                                    <li className="flex flex-col gap-1">
                                        <span className="text-slate-400 text-xs font-bold"><i className="bx bx-map"></i> 주소</span>
                                        <span className="font-medium text-slate-700 leading-tight">{candidate.address || '미기재'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 우측단 (AI 분석 요약 및 스킬) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* AI 핵심 요약 */}
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                                <h3 className="text-xs font-black uppercase text-indigo-600 tracking-widest mb-2 flex items-center gap-1.5">
                                    <i className="bx bx-bot text-base"></i> AI 핵심 요약
                                </h3>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {aiProfile.candidate_summary?.core_summary || raw.record.resume.summary}
                                </p>
                            </div>

                            {/* 보유 스킬 */}
                            <div>
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">보유 스킬 및 역량</h3>
                                <div className="flex flex-wrap gap-2">
                                    {aiProfile.skills.tools?.map((tool, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{tool}</span>
                                    ))}
                                    {aiProfile.skills.databases?.map((db, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">{db}</span>
                                    ))}
                                    {aiProfile.skills.other?.map((other, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">{other}</span>
                                    ))}
                                    {(!aiProfile.skills.tools?.length && !aiProfile.skills.other?.length) && (
                                        <span className="text-sm text-slate-400">추출된 스킬이 없습니다.</span>
                                    )}
                                </div>
                            </div>

                            {/* 면접관 추천 질문 */}
                            {aiProfile.recommended_question_topics && aiProfile.recommended_question_topics.length > 0 && (
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-1.5">
                                        <i className="bx bx-message-rounded-dots text-base"></i> AI 면접 질문 추천
                                    </h3>
                                    <ul className="space-y-2">
                                        {aiProfile.recommended_question_topics.map((q, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-slate-600">
                                                <span className="text-indigo-400 font-black">Q.</span>
                                                <span className="font-medium">{q}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* 💡 푸터 (액션 버튼) */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                        닫기
                    </button>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                        <i className="bx bx-user-plus"></i> 인재 풀에 등록
                    </button>
                </div>

            </div>
        </div>
    );
}