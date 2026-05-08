'use client';

import React, { useState, useMemo } from 'react';
import { parseResumes } from '@/lib/hr/parsing.client';
import { ParsingItem, TableRowData } from '@/types/parsing';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    ColumnFiltersState,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<TableRowData>();

export default function ResumeParsingClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<TableRowData[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [filterPosition, setFilterPosition] = useState<string>('ALL');
    // 컴포넌트 상단 상태 영역에 추가
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 필터링할 직무 목록 (추후 API로 받아오거나 확장이 가능하도록 배열로 분리)
    const [POSITIONS, setPOSITIONS] = useState<string[]>(['ALL', '마케팅', '개발', '디자인', '기획', '영업', '인사', '재무', '기타']);

    // 필터링 input이 변경될 때마다 테이블이 자동으로 필터링되도록 useMemo로 설정
    const [globalSearch, setGlobalSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // 직무 필터 변경 시 columnFilters 상태를 업데이트하는 로직
    const handlePositionFilter = (pos: string) => {
        setFilterPosition(pos);
        if (pos === 'ALL') {
            // '전체' 선택 시 직무 필터 제거
            setColumnFilters([]);
        } else {
            // 특정 직무 선택 시 해당 컬럼(position)에 필터 적용
            setColumnFilters([{ id: 'position', value: pos }]);
        }
    };
    /* -----------------------------------------------------------
       1. 파일 핸들링 (Drop & Delete)
    ----------------------------------------------------------- */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    /* -----------------------------------------------------------
       2. 파싱 실행 (단일 bulk 요청)
    ----------------------------------------------------------- */
    const startParsing = async () => {
        if (files.length === 0) return;
        setIsParsing(true);
        try {
            const data = await parseResumes(files);

            // 데이터 평탄화 및 중복 의심 로직 (이름/생년월일/연락처 기준)
            const mapped = data.items.map((item, idx) => {
                const c = item.record.candidate;
                return {
                    id: `${c.name}-${idx}`,
                    name: c.name,
                    birth: c.dateOfBirth,
                    phone: c.phone,
                    email: c.email || '-',
                    position: item.record.aiProfile.target_position || '미지정',
                    channel: '파일 업로드',
                    // 임시 중복 체크 (결과 내에서 동일인이 있는지 검사)
                    isDuplicate: data.items.some((other, oi) =>
                        oi !== idx &&
                        other.record.candidate.name === c.name &&
                        other.record.candidate.phone === c.phone
                    ),
                    criteriaMet: c.meetsPreferredCriteria.length > 0,
                    raw: item
                };
            });
            setResults(mapped);
        } catch (error) {
            alert('파싱 중 오류가 발생했습니다.');
        } finally {
            setIsParsing(false);
        }
    };

    /* -----------------------------------------------------------
       3. TanStack Table 설정
    ----------------------------------------------------------- */
    const columns = [
        columnHelper.accessor('name', { header: '이름', cell: info => <b className="text-slate-800">{info.getValue()}</b> }),
        columnHelper.accessor('birth', { header: '생년월일' }),
        columnHelper.accessor('phone', { header: '연락처' }),
        columnHelper.accessor('email', { header: '이메일' }),
        columnHelper.accessor('position', {
            header: '지원 직무',
            cell: info => <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold">{info.getValue()}</span>
        }),
        columnHelper.accessor('isDuplicate', {
            header: '중복 의심',
            cell: info => info.getValue() ? <span className="text-rose-500 font-black italic">! 중복</span> : <span className="text-slate-300">-</span>
        }),
        columnHelper.accessor('criteriaMet', {
            header: '우대 조건',
            cell: info => info.getValue() ? <i className="bx bxs-check-circle text-emerald-500 text-lg"></i> : <i className="bx bx-circle text-slate-200 text-lg"></i>
        }),
        columnHelper.display({
            id: 'action',
            header: '상세',
            cell: () => <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><i className="bx bx-search-alt text-lg text-slate-400"></i></button>
        })
    ];

    const table = useReactTable({
        data: results,
        columns,
        state: {
            globalFilter: globalSearch, // 텍스트 검색 연결
            columnFilters: columnFilters, // 직무 드롭다운 필터 연결
        },
        onGlobalFilterChange: setGlobalSearch,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // 필터링 기능 활성화
        // 💡 팁: 글로벌 필터가 특정 컬럼만 검색하게 하고 싶다면 아래 옵션을 추가하세요.
        // globalFilterFn: 'includesString', 
    });

    return (
        <div className="space-y-6">
            {/* 상단: 업로드 영역 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors group relative">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".doc,.docx,.hwp,.md,.pdf,.ppt,.pptx,.txt"
                    />
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <i className="bx bx-cloud-upload text-3xl text-indigo-500"></i>
                    </div>
                    <p className="text-slate-700 font-bold">이력서 파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-xs text-slate-400 mt-2">PDF, DOCX, HWP, TXT (최대 20개)</p>
                </div>

                {/* 파일 리스트 */}
                {files.length > 0 && (
                    <div className="mt-6 space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">대기 중인 파일 ({files.length})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <i className="bx bxs-file-pdf text-2xl text-rose-500"></i>
                                        <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                                    </div>
                                    <button onClick={() => removeFile(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <i className="bx bx-trash text-lg"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={startParsing}
                            disabled={isParsing}
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isParsing ? <i className="bx bx-loader-alt bx-spin text-xl"></i> : <i className="bx bx-wand text-xl"></i>}
                            {isParsing ? 'AI 분석 중...' : '이력서 데이터 추출 시작'}
                        </button>
                    </div>
                )}
            </div>

            {/* 하단: 결과 테이블 */}
            {results.length > 0 && (
                <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                    {/* 테이블 헤더 & 필터 */}
                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* 💡 좌측: 타이틀 및 뱃지 영역 */}
                        <div className="flex items-center gap-4">
                            <h3 className="font-black text-slate-800">파싱 결과</h3>
                            {results.some(r => r.isDuplicate) && (
                                <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black animate-pulse whitespace-nowrap">
                                    중복 의심 데이터 포함
                                </span>
                            )}
                        </div>

                        {/* 💡 우측: 컨트롤 패널 (검색 Input + 직무 필터 드롭다운) */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

                            {/* 2. 기존 커스텀 드롭다운 필터 */}
                            <div className="relative shrink-0">
                                {/* 트리거 버튼 */}
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all focus:outline-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <i className="bx bx-filter-alt text-lg text-slate-400"></i>
                                        <span>{filterPosition === 'ALL' ? '전체 직무 보기' : filterPosition}</span>
                                    </div>
                                    <i className={`bx bx-chevron-down text-lg text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}></i>
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {isFilterOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsFilterOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] z-20 py-2 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                            {POSITIONS.map(pos => (
                                                <button
                                                    key={pos}
                                                    onClick={() => {
                                                        handlePositionFilter(pos); // 💡 수정된 필터 핸들러 호출
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group
                                                                ${filterPosition === pos
                                                            ? 'bg-indigo-50/50 text-indigo-600 font-black'
                                                            : 'text-slate-600 hover:bg-slate-50 font-medium'
                                                        }`}
                                                >
                                                    <span>{pos === 'ALL' ? '전체 직무' : pos}</span>
                                                    {filterPosition === pos && (
                                                        <i className="bx bx-check text-xl text-indigo-600 animate-in zoom-in"></i>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 1. 검색 Input 영역 */}
                            <div className="relative w-full sm:w-64 shrink-0">
                                <i className="bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                                <input
                                    type="text"
                                    placeholder="이름, 연락처 검색..."
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                                />
                                {/* 검색어가 있을 때만 나타나는 초기화(X) 버튼 */}
                                {globalSearch && (
                                    <button
                                        onClick={() => setGlobalSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        <i className="bx bx-x-circle text-lg"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id} className="bg-slate-50/50">
                                        {hg.headers.map(h => (
                                            <th key={h.id} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none">
                                        {row.getVisibleCells().map(c => (
                                            <td key={c.id} className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                {flexRender(c.column.columnDef.cell, c.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}