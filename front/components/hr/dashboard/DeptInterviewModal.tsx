'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';

// 💡 1. 인터페이스 정의
export interface IntervieweeRecord {
    id: string;
    applicantName: string;
    interviewDate: string;
    interviewTime: string;
    round: string;
    interviewer: string;
    status: '완료' | '진행중' | '대기';
}

interface DeptInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    deptName: string | null;
}

const columnHelper = createColumnHelper<IntervieweeRecord>();

export default function DeptInterviewModal({ isOpen, onClose, deptName }: DeptInterviewModalProps) {
    const [data, setData] = useState<IntervieweeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 💡 2. 모달이 열릴 때 해당 부서의 가짜(Mock) 데이터를 비동기로 불러오는 로직
    useEffect(() => {
        if (!isOpen || !deptName) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // API 통신 시뮬레이션 (0.8초 지연)
                await new Promise(resolve => setTimeout(resolve, 800));

                const mockData: IntervieweeRecord[] = Array.from({ length: 6 }).map((_, idx) => {
                    const statuses: ('완료' | '진행중' | '대기')[] = ['완료', '진행중', '대기', '대기', '완료', '진행중'];
                    const rounds = ['1차 실무', '1차 실무', '2차 컬쳐핏', '최종 임원', '1차 실무', '2차 컬쳐핏'];
                    
                    return {
                        id: `INT-${Date.now()}-${idx}`,
                        applicantName: `김지원${idx + 1}`,
                        interviewDate: `2026-05-${String(20 + idx).padStart(2, '0')}`,
                        interviewTime: `${10 + (idx % 5)}:00 ~ ${11 + (idx % 5)}:00`,
                        round: rounds[idx % rounds.length],
                        interviewer: idx % 3 === 0 ? '미배정' : `박면접${idx + 1} 책임`,
                        status: statuses[idx % statuses.length],
                    };
                });
                setData(mockData);
            } catch (error) {
                console.error("데이터 로드 실패", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen, deptName]);

    // 💡 3. 테이블 컬럼 정의
    const columns = useMemo(() => [
        columnHelper.accessor('applicantName', {
            header: '면접자',
            cell: info => <span className="font-black text-slate-800">{info.getValue()}</span>
        }),
        columnHelper.accessor('interviewDate', {
            header: '면접일자',
            cell: info => <span className="text-slate-600 font-medium">{info.getValue()}</span>
        }),
        columnHelper.accessor('interviewTime', {
            header: '선택한 면접 시간',
            cell: info => (
                <span className="flex items-center gap-1.5 text-slate-600">
                    <i className="bx bx-time-five text-slate-400"></i>
                    <span className="font-bold">{info.getValue()}</span>
                </span>
            )
        }),
        columnHelper.accessor('round', {
            header: '회차',
            cell: info => <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{info.getValue()}</span>
        }),
        columnHelper.accessor('interviewer', {
            header: '면접관',
            cell: info => {
                const val = info.getValue();
                return val === '미배정' 
                    ? <span className="text-rose-500 font-bold text-xs bg-rose-50 px-2 py-1 rounded-md">{val}</span>
                    : <span className="text-slate-700 font-medium">{val}</span>;
            }
        }),
        columnHelper.accessor('status', {
            header: '상태',
            cell: info => {
                const status = info.getValue();
                let style = '';
                let icon = '';
                if (status === '완료') {
                    style = 'bg-slate-100 text-slate-500';
                    icon = 'bx-check-double';
                } else if (status === '진행중') {
                    style = 'bg-indigo-50 text-indigo-600 border border-indigo-100';
                    icon = 'bx-loader-alt bx-spin';
                } else {
                    style = 'bg-amber-50 text-amber-600 border border-amber-100';
                    icon = 'bx-time';
                }
                return (
                    <span className={`flex items-center w-fit gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black tracking-widest ${style}`}>
                        <i className={`bx ${icon} text-sm`}></i> {status}
                    </span>
                );
            }
        }),
    ], []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 h-[85vh]">
                
                {/* 💡 헤더 */}
                <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <i className="bx bx-list-check text-2xl"></i>
                        </div>
                        <div>
                            <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md mb-1">
                                {deptName}
                            </span>
                            <h2 className="text-lg font-black text-slate-800">면접 세부 현황</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <i className="bx bx-x text-2xl"></i>
                    </button>
                </div>

                {/* 💡 테이블 본문 영역 (스크롤 허용) */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200 p-6">
                    <div className="bg-white border border-slate-200 rounded-[20px] shadow-sm overflow-hidden relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg font-bold text-sm">
                                    <i className="bx bx-loader-alt bx-spin text-xl"></i> 데이터 불러오는 중...
                                </div>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    {table.getHeaderGroups().map(hg => (
                                        <tr key={hg.id} className="bg-slate-50 border-b border-slate-200">
                                            {hg.headers.map(h => (
                                                <th key={h.id} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            {row.getVisibleCells().map(c => (
                                                <td key={c.id} className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {flexRender(c.column.columnDef.cell, c.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {table.getRowModel().rows.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                                데이터가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 💡 차후 '예약 완료 현황' 컴포넌트가 들어갈 자리 */}
                    <div className="mt-8 border-t border-slate-200 pt-8">
                        <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 font-bold text-sm">
                            <i className="bx bx-pie-chart-alt-2 text-xl mr-2"></i> 예약 완료 현황 대시보드 예정 공간
                        </div>
                    </div>
                </div>

                {/* 💡 푸터 */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}