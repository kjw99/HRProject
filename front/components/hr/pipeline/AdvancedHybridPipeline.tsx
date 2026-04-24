"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DetailModal from './DetailModal';

// 1. 타입 정의
type Status = '분석중' | '분석 완료' | '1차 면접' | '2차 면접' | '최종 면접' | '합격' | '불합격';
type FilterGroup = '전체' | '서류 분석' | '면접 진행' | '최종 합격' | '불합격';

export interface Applicant {
    id: string;
    name: string;
    position: string;
    status: Status;
    appliedDate: string;
    score: number;
}


export default function AdvancedHybridPipeline({ data }: { data: Applicant[] }) {
    const [applicants, setApplicants] = useState<Applicant[]>(data);
    const [currentFilter, setCurrentFilter] = useState<FilterGroup>('전체');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
    const [selectedDetailName, setSelectedDetailName] = useState("");
    // 3. 통합 필터링 로직 (탭 + 검색)
    const filteredApplicants = useMemo(() => {
        return applicants.filter(app => {
            // A. 탭(포스트잇) 필터 조건
            const matchesTab =
                currentFilter === '전체' ||
                (currentFilter === '서류 분석' && app.status.includes('분석')) ||
                (currentFilter === '면접 진행' && app.status.includes('면접')) ||
                (currentFilter === '최종 합격' && app.status === '합격') ||
                (currentFilter === '불합격' && app.status === '불합격');

            // B. 검색어 필터 조건 (이름 또는 직무)
            const matchesSearch =
                app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.position.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesTab && matchesSearch;
        });
    }, [applicants, currentFilter, searchTerm]);

    // 4. 이벤트 핸들러
    const handleBulkUpdate = (newStatus: Status) => {
        setApplicants(prev => prev.map(app =>
            selectedIds.has(app.id) ? { ...app, status: newStatus } : app
        ));
        setSelectedIds(new Set()); // 업데이트 후 선택 해제
    };

    const toggleSelect = (id: string) => {
        const newIds = new Set(selectedIds);
        if (newIds.has(id)) newIds.delete(id);
        else newIds.add(id);
        setSelectedIds(newIds);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredApplicants.length) {
            setSelectedIds(new Set()); // 전체 해제
        } else {
            setSelectedIds(new Set(filteredApplicants.map(a => a.id))); // 전체 선택
        }
    };

    // 포스트잇 설정 데이터
    const postItConfig: { label: FilterGroup; bgColor: string; rotation: string }[] = [
        { label: '전체', bgColor: 'bg-[#FEF9C3]', rotation: '-rotate-2' },
        { label: '서류 분석', bgColor: 'bg-[#DBEAFE]', rotation: 'rotate-1' },
        { label: '면접 진행', bgColor: 'bg-[#FCE7F3]', rotation: '-rotate-1' },
        { label: '최종 합격', bgColor: 'bg-[#DCFCE7]', rotation: 'rotate-2' },
        { label: '불합격', bgColor: 'bg-[#FEE2E2]', rotation: '-rotate-2' },
    ];

    // 모달 열기 핸들러
    const handleOpenDetail = (app: Applicant) => {
        setSelectedDetailId(app.id);
        setSelectedDetailName(app.name);
        setIsModalOpen(true);
    };

    return (
        <div className="relative min-h-screen bg-[#F8F9FB] p-6 md:p-10 pb-32 font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto">

                {/* ---------------- 상단 헤더 & 검색바 ---------------- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recruitment Board</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">지원자 현황을 관리하고 전형을 이동하세요.</p>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <input
                            type="text"
                            placeholder="이름 또는 직무 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-5 pr-12 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                        />
                        <i className="bx bx-search absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                </div>

                {/* ---------------- 📝 포스트잇 탭 영역 ---------------- */}
                <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-6 pl-2 min-w-max">
                        {postItConfig.map((item) => {
                            const isSelected = currentFilter === item.label;
                            const count = applicants.filter(a => {
                                if (item.label === '전체') return true;
                                if (item.label === '서류 분석') return a.status.includes('분석');
                                if (item.label === '면접 진행') return a.status.includes('면접');
                                if (item.label === '최종 합격') return a.status === '합격';
                                if (item.label === '불합격') return a.status === '불합격';
                            }).length;

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => setCurrentFilter(item.label)}
                                    className={`
                    relative w-32 h-32 p-4 flex flex-col justify-between transition-all duration-300
                    shadow-[4px_4px_15px_rgba(0,0,0,0.08)] cursor-pointer outline-none flex-shrink-0
                    ${item.bgColor}
                    ${isSelected ? 'scale-110 z-10 shadow-[8px_8px_25px_rgba(0,0,0,0.15)] ring-2 ring-slate-900/10' : `hover:scale-105 hover:-translate-y-1 ${item.rotation}`}
                  `}
                                    style={{ borderRadius: '2px 16px 16px 24px' }}
                                >
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800/15 rounded-full shadow-inner" />
                                    <span className="text-[13px] font-black text-slate-800 mt-4 leading-tight">{item.label}</span>
                                    <div className="flex justify-end">
                                        <span className="text-2xl font-black text-slate-900/50">{count}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ---------------- 📊 엑셀 데이터 그리드 영역 ---------------- */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-200/80 shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="p-4 w-14 text-center">
                                        <input
                                            type="checkbox"
                                            className="size-4 rounded accent-indigo-600 cursor-pointer"
                                            checked={filteredApplicants.length > 0 && selectedIds.size === filteredApplicants.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest w-[15%]">지원자</th>
                                    <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest w-[25%]">지원 직무</th>
                                    <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest w-[15%]">AI 평가</th>
                                    <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest w-[25%]">현재 상태</th>
                                    <th className="p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest w-[20%]">지원일</th>
                                    <th className="p-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest w-[10%]">상세보기</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredApplicants.map((app) => (
                                        <motion.tr
                                            key={app.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`border-b border-slate-50 transition-colors ${selectedIds.has(app.id) ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'}`}
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="size-4 rounded accent-indigo-600 cursor-pointer"
                                                    checked={selectedIds.has(app.id)}
                                                    onChange={() => toggleSelect(app.id)}
                                                />
                                            </td>
                                            <td className="p-4 font-extrabold text-slate-900">{app.name}</td>
                                            <td className="p-4 text-xs font-bold text-slate-500">{app.position}</td>
                                            <td className="p-4">
                                                {app.score > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-black">
                                                        <i className='bx bxs-zap'></i> {app.score}점
                                                    </span>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => setApplicants(prev => prev.map(a => a.id === app.id ? { ...a, status: e.target.value as Status } : a))}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border-none outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all ${app.status === '합격' ? 'bg-emerald-50 text-emerald-700' :
                                                        app.status === '불합격' ? 'bg-rose-50 text-rose-700' :
                                                            app.status.includes('면접') ? 'bg-indigo-50 text-indigo-700' :
                                                                'bg-white text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <option>분석중</option>
                                                    <option>분석 완료</option>
                                                    <option>1차 면접</option>
                                                    <option>2차 면접</option>
                                                    <option>최종 면접</option>
                                                    <option>합격</option>
                                                    <option>불합격</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-[11px] font-medium text-slate-400">{app.appliedDate}</td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 행 선택 이벤트 방지
                                                        handleOpenDetail(app);
                                                    }}
                                                    className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center shadow-sm"
                                                    title="자세히 보기"
                                                >
                                                    <i className='bx bx-search-alt-2 text-lg'></i>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {filteredApplicants.length === 0 && (
                            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                                <i className='bx bx-folder-open text-4xl mb-2 opacity-50'></i>
                                <p className="font-bold">조건에 맞는 지원자가 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------------- 🚀 하단 벌크 액션 바 (Floating Controller) ---------------- */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, x: "-50%" }}
                        animate={{ y: 0, opacity: 1, x: "-50%" }}
                        exit={{ y: 100, opacity: 0, x: "-50%" }}
                        className="fixed bottom-8 left-1/2 z-50 flex items-center gap-4 md:gap-6 bg-slate-900 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md w-max max-w-[95vw] overflow-x-auto scrollbar-hide"
                    >
                        <div className="flex items-center gap-3 border-r border-white/20 pr-4 md:pr-6 flex-shrink-0">
                            <span className="bg-indigo-500 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black">{selectedIds.size}</span>
                            <span className="text-sm font-bold hidden md:inline-block">선택됨</span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                            <span className="text-[10px] md:text-[11px] font-black text-white/40 uppercase tracking-widest hidden sm:inline-block">일괄 변경</span>
                            {['1차 면접', '2차 면접', '최종 면접', '합격', '불합격'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleBulkUpdate(status as Status)}
                                    className="px-3 md:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-slate-900 text-[11px] md:text-xs font-bold transition-all whitespace-nowrap"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => setSelectedIds(new Set())} className="ml-auto md:ml-2 text-white/40 hover:text-rose-400 transition-colors flex-shrink-0">
                            <i className="bx bx-x text-2xl" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <DetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                applicantId={selectedDetailId}
                applicantName={selectedDetailName}
            />
        </div>
    );
}
