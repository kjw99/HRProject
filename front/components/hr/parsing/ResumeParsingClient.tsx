'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
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
import ResumeDetailModal from './ResumeDetailModal';

// --- Types & Interfaces ---
interface FileUploadProps {
    files: File[];
    onDrop: (acceptedFiles: File[]) => void;
    onRemove: (index: number) => void;
    onStart: () => void;
    isParsing: boolean;
}

const columnHelper = createColumnHelper<TableRowData>();

// 허용할 파일 확장자 정의
const ACCEPTED_FILES: Accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/x-hwp': ['.hwp'],
    'text/plain': ['.txt', '.md'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
};

export default function ResumeParsingClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<TableRowData[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [filterPosition, setFilterPosition] = useState<string>('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState<TableRowData | null>(null);

    const POSITIONS = ['ALL', '마케팅', '개발', '디자인', '기획', '영업', '인사', '재무', '기타'];

    /* -----------------------------------------------------------
       1. 파일 핸들링 (React Dropzone)
    ----------------------------------------------------------- */
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => {
            const newFiles = [...prev, ...acceptedFiles];
            return newFiles.slice(0, 20); // 최대 20개 제한
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILES,
        multiple: true,
        maxFiles: 20
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    /* -----------------------------------------------------------
       2. 파싱 및 필터 로직
    ----------------------------------------------------------- */
    const handlePositionFilter = (pos: string) => {
        setFilterPosition(pos);
        setColumnFilters(pos === 'ALL' ? [] : [{ id: 'position', value: pos }]);
    };

    const startParsing = async () => {
        if (files.length === 0) return;
        setIsParsing(true);

        try {
            const data = await parseResumes(files);

            // 💡 'any'를 제거하고 앞서 만든 ParsingItem 인터페이스를 적용하여 타입 안정성을 확보합니다.
            const mapped: TableRowData[] = data.items.map((item: ParsingItem, idx: number) => {
                const c = item.record.candidate;

                return {
                    id: `${c.name}-${idx}-${Date.now()}`,
                    name: c.name,
                    birth: c.dateOfBirth,
                    phone: c.phone,
                    email: c.email || '-',
                    position: item.record.aiProfile.target_position || '미지정',
                    channel: '파일 업로드',

                    // 💡 비교 대상(other)에도 ParsingItem 타입을 명확히 지정합니다.
                    isDuplicate: data.items.some((other: ParsingItem, oi: number) =>
                        oi !== idx &&
                        other.record.candidate.name === c.name &&
                        other.record.candidate.phone === c.phone
                    ),

                    criteriaMet: (c.meetsPreferredCriteria || []).length > 0,
                    raw: item // 모달에 넘겨줄 원본 데이터
                };
            });

            setResults(mapped);

            // 💡 UX 디테일: 파싱이 성공적으로 끝나면 대기열(Dropzone)을 비워주어 깔끔한 상태를 유지합니다.
            setFiles([]);

        } catch (error) {
            alert('파싱 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setIsParsing(false);
        }
    };

    /* -----------------------------------------------------------
       3. Table 설정
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
            cell: ({ row }) => ( // 💡 여기서 row 객체를 꺼냅니다.
                <button
                    onClick={() => {
                        setSelectedRowData(row.original); // 1. 클릭한 행의 데이터를 상태에 저장
                        setIsModalOpen(true);             // 2. 모달 창 열기
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                    <i className="bx bx-search-alt text-lg text-slate-400 group-hover:text-indigo-600"></i>
                </button>
            )
        })
    ];

    const table = useReactTable({
        data: results,
        columns,
        state: { globalFilter: globalSearch, columnFilters },
        onGlobalFilterChange: setGlobalSearch,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
            {/* 상단: 업로드 영역 (React Dropzone 통합) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center transition-all cursor-pointer group relative
                        ${isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                    <input {...getInputProps()} />
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 transition-transform group-hover:scale-110 
                        ${isDragActive ? 'scale-110 ring-4 ring-indigo-100' : ''}`}>
                        <i className={`bx bx-cloud-upload text-3xl ${isDragActive ? 'text-indigo-600' : 'text-indigo-500'}`}></i>
                    </div>
                    <p className="text-slate-700 font-bold text-center">
                        {isDragActive ? '파일을 여기에 놓으세요' : '이력서 파일을 드래그하거나 클릭하여 업로드'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center">PDF, DOCX, HWP, TXT (최대 20개)</p>
                </div>

                {/* 파일 리스트 */}
                {files.length > 0 && (
                    <div className="mt-6 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                대기 중인 파일 ({files.length})
                            </p>
                            {/* 파일이 많을 때 스크롤이 생기지 않도록 높이 제한을 줄 수도 있습니다 */}
                        </div>

                        {/* 💡 1. 그리드 변경: 데스크탑에서 2칸 -> 3~4칸으로 늘려 컴팩트하게 배치 */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {files.map((file, idx) => (
                                <div
                                    key={`${file.name}-${idx}`}
                                    // 💡 2. 패딩(p-3 -> px-3 py-2)과 모서리(rounded-xl -> rounded-lg) 축소
                                    className="flex items-center justify-between px-3 py-2 bg-white border border-slate-100 rounded-lg shadow-sm group hover:border-indigo-200 transition-colors"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {/* 💡 3. 아이콘 크기 축소 (text-2xl -> text-lg) */}
                                        <i className="bx bxs-file-pdf text-lg text-rose-500"></i>
                                        {/* 💡 4. 텍스트 크기 축소 (text-sm -> text-xs) */}
                                        <span className="text-xs font-bold text-slate-600 truncate">{file.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Dropzone 클릭 이벤트 전파 방지
                                            removeFile(idx);
                                        }}
                                        // 💡 5. UX 디테일: 평소엔 휴지통을 숨기고(opacity-0), 카드에 마우스를 올리면 나타나게(group-hover:opacity-100) 처리
                                        className="text-slate-300 hover:text-rose-500 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 ml-2 shrink-0"
                                    >
                                        <i className="bx bx-trash text-sm"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={startParsing}
                            disabled={isParsing}
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isParsing ? <i className="bx bx-loader-alt bx-spin text-xl"></i> : <i className="bx bx-wand text-xl"></i>}
                            {isParsing ? 'AI 분석 중...' : '이력서 데이터 추출 시작'}
                        </button>
                    </div>
                )}
            </div>

            {/* 하단: 결과 테이블 */}
            {results.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
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
            <ResumeDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedRowData}
            />
        </div>
    );
}