'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ApplicantData, ApplicantInfo } from '@/types/hr';
import { MOCK_APPLICANTS } from './mockData';
import ApplicantDetailModal from './ApplicantDetailModal';

const generateUniqueKey = (app: ApplicantInfo) => {
    // 이메일이 우선, 없으면 연락처를 식별자로 사용
    const identifier = app.email || app.contact;
    return `${identifier}|${app.originalJobRole}`;
};

export default function ResumeUploadClient() {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ApplicantInfo[]>([]);

    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantInfo | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [showTopButton, setShowTopButton] = useState(false);

    // 상단 이동 버튼 노출 로직
    useEffect(() => {
        const handleScroll = () => {
            setShowTopButton(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            if (results.length > 0) {
                toast('기존 분석 결과가 존재합니다.', {
                    description: '새 파일을 업로드할 때 기존 결과를 어떻게 할까요?',
                    duration: 5000,
                    action: {
                        label: '초기화 하기',
                        onClick: () => { setFiles(newFiles); setResults([]); toast.success('결과가 초기화되었습니다.'); },
                    },
                    cancel: {
                        label: '그대로 유지',
                        onClick: () => { setFiles(newFiles); toast.info('기존 결과를 유지합니다.'); },
                    },
                });
            } else {
                setFiles(newFiles);
                setResults([]);
            }
            e.target.value = '';
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const simulatedResponse = MOCK_APPLICANTS.slice(0, files.length);
            const dynamicResults = simulatedResponse.map((data, idx) => ({
                ...data,
                fileType: files[idx]?.name.split('.').pop()?.toUpperCase() || "PDF"
            }));

            setResults(prev => {
                const existingKeys = new Set(prev.map(generateUniqueKey));
                const newUniqueResults = dynamicResults.filter(app => !existingKeys.has(generateUniqueKey(app)));
                return [...prev, ...newUniqueResults];
            });
            toast.success(`${files.length}건의 자기소개서 분석 완료!`);

            setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 100);
        } catch (error) {
            toast.error("분석 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => { setFiles([]); setResults([]); };

    const openDetailModal = (applicant: ApplicantInfo) => {
        setSelectedApplicant(applicant);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setResults(prev => prev.filter(app => app.id !== id));
        setIsDetailModalOpen(false);
        toast.success('해당 지원자 데이터가 삭제되었습니다.');
        if (results.length === 1) setFiles([]);
    };

    const handleEdit = (id: string) => {
        toast.info('데이터 수정 모드가 곧 지원될 예정입니다.', { icon: '⚙️' });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24 px-4 sm:px-6 relative">

            {/* 업로드 영역 */}
            <div className="bg-white p-8 md:p-10 rounded-4xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100/80">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">자기소개서 AI 파싱</h2>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">이력서를 업로드하면 AI가 핵심 정보를 추출합니다.</p>
                    </div>
                    {results.length > 0 && (
                        <button onClick={handleReset} className="px-5 py-2.5 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5">
                            <i className='bx bx-refresh text-lg'></i> 전체 초기화
                        </button>
                    )}
                </div>

                {/* 📤 1. 업로드 영역 (그리드 레이아웃 적용) */}
                {/* 📤 1. 업로드 영역 (자세히 보기 리스트 레이아웃 적용) */}
                <div className={`relative border-2 border-dashed rounded-4xl p-8 md:p-12 transition-all flex flex-col items-center justify-center
                    ${files.length > 0 ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 group'}`}>

                    {files.length === 0 ? (
                        /* 💡 A. 파일이 없을 때: 기본 가이드 UI (전체 영역 클릭 가능) */
                        <>
                            <input
                                type="file"
                                multiple
                                accept=".pdf, .docx, .hwp, .txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center animate-in fade-in duration-500">
                                <div className="w-20 h-20 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-5 group-hover:-translate-y-2 transition-transform duration-300">
                                    <i className='bx bx-cloud-upload text-4xl text-slate-400 group-hover:text-indigo-500 transition-colors'></i>
                                </div>
                                <p className="text-lg font-black text-slate-700">파일을 드래그하거나 클릭하세요</p>
                                <p className="text-sm text-slate-400 mt-1 font-medium">최대 10MB까지 업로드 가능 (.pdf, .docx)</p>
                            </div>
                        </>
                    ) : (
                        /* 💡 B. 파일이 있을 때: 자세히 보기(리스트) 뷰 */
                        <div className="w-full relative z-20 animate-in zoom-in-95 duration-300">

                            {/* 리스트 헤더 및 액션 버튼 그룹 */}
                            <div className="flex justify-between items-end mb-4 px-2">
                                <div>
                                    <span className="text-sm font-bold text-slate-700">업로드 대기 중인 파일</span>
                                    <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-md">
                                        {files.length}
                                    </span>
                                </div>

                                {/* 버튼 그룹 */}
                                <div className="flex items-center gap-2">
                                    {/* 💡 파일 초기화 버튼 */}
                                    <button
                                        onClick={() => setFiles([])}
                                        className="text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm border border-rose-100/50"
                                    >
                                        <i className='bx bx-refresh text-base'></i> 초기화
                                    </button>

                                    {/* 파일 추가 버튼 */}
                                    <label className="cursor-pointer text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm border border-indigo-100/50">
                                        <i className='bx bx-plus text-base'></i> 파일 추가
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf, .docx, .hwp, .txt"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* 자세히 보기 파일 리스트 (세로 스택) */}
                            {/* 💡 자세히 보기: 컴팩트 테이블(Excel-like) 뷰 */}
                            <div className="w-full border border-slate-200 rounded-2xl overflow-hidden mt-2">
                                <div className="max-h-75 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                                            <tr>
                                                <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[40px] text-center">유형</th>
                                                <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">파일명</th>
                                                <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px] text-right">크기</th>
                                                <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px] text-center">상태</th>
                                                <th className="py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[60px] text-center">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {files.map((file, index) => {
                                                const ext = file.name.split('.').pop()?.toLowerCase();
                                                const getFileIcon = () => {
                                                    if (ext === 'pdf') return 'bxs-file-pdf text-rose-500';
                                                    if (ext === 'docx') return 'bxs-file-doc text-blue-500';
                                                    if (ext === 'hwp') return 'bxs-file-blank text-indigo-500';
                                                    return 'bxs-file-txt text-slate-400';
                                                };

                                                return (
                                                    <tr key={index} className="hover:bg-indigo-50/30 transition-colors group/file">
                                                        {/* 1. 파일 아이콘 (유형) */}
                                                        <td className="py-2 px-4 text-center">
                                                            <i className={`bx ${getFileIcon()} text-xl`}></i>
                                                        </td>

                                                        {/* 2. 파일명 */}
                                                        <td className="py-2 px-4 text-sm font-bold text-slate-700 truncate max-w-[200px]" title={file.name}>
                                                            {file.name}
                                                        </td>

                                                        {/* 3. 파일 크기 */}
                                                        <td className="py-2 px-4 text-xs font-bold text-slate-400 text-right uppercase tracking-wider">
                                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                        </td>

                                                        {/* 4. 첨부 상태 */}
                                                        <td className="py-2 px-4 text-center">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                                <i className='bx bx-check'></i> 첨부됨
                                                            </span>
                                                        </td>

                                                        {/* 5. 관리 (삭제 버튼) */}
                                                        <td className="py-2 px-4 text-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setFiles(prev => prev.filter((_, i) => i !== index));
                                                                }}
                                                                className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center mx-auto transition-all opacity-0 group-hover/file:opacity-100"
                                                                title="파일 제외"
                                                            >
                                                                <i className='bx bx-x text-base'></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={handleUpload} disabled={loading || files.length === 0} className={`w-full mt-8 py-4.5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2.5 ${loading || files.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl active:scale-[0.98]'}`}>
                    {loading ? <><i className='bx bx-loader-alt bx-spin text-2xl'></i><span>AI 분석 중...</span></> : <><i className='bx bx-brain text-2xl'></i><span>분석 시작하기</span></>}
                </button>
            </div>

            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1500px]">
                    <thead>
                        <tr className="border-b-2 border-slate-200/80 bg-slate-50/50">
                            {/* 💡 1. '상태' 컬럼이 맨 앞에 추가되었습니다. */}
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[120px] sticky left-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">검수 상태</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[100px]">이름</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">지원 직무</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[140px]">연락처</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">이메일</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[250px]">최종학력</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[300px]">경력사항</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[180px]">경력 직무</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">생년월일</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest min-w-[250px]">거주지(주소)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((app) => {
                            // 💡 2. 파싱 완성도 계산 로직
                            const requiredFields = [app.name, app.originalJobRole, app.contact, app.email, app.finalEducation, app.careerCompany];
                            const emptyCount = requiredFields.filter(field => !field || field.trim() === '').length;
                            const isPerfect = emptyCount === 0;

                            // 💡 3. 데이터 렌더링 헬퍼 함수 (데이터가 없으면 경고 배지 출력)
                            const renderData = (data: string, label: string = "누락") => {
                                if (!data || data.trim() === '') {
                                    return (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-500 text-[11px] font-black tracking-wider border border-rose-100">
                                            <i className='bx bxs-error-circle'></i> {label}
                                        </span>
                                    );
                                }
                                return data;
                            };

                            return (
                                <tr
                                    key={app.id}
                                    onClick={() => openDetailModal(app)}
                                    className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                >
                                    {/* 검수 상태 (Sticky Column으로 좌측 고정) */}
                                    <td className="py-3 px-6 align-middle sticky left-0 bg-white group-hover:bg-indigo-50/30 transition-colors z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                                        {isPerfect ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                                <i className='bx bxs-check-circle text-base'></i>
                                                <span className="text-[11px] font-black tracking-wider">추출 완료</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                                                <i className='bx bxs-error text-base'></i>
                                                <span className="text-[11px] font-black tracking-wider">{emptyCount}건 확인</span>
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-3 px-6 text-sm font-bold text-slate-900 whitespace-nowrap align-middle">
                                        {renderData(app.name)}
                                    </td>
                                    <td className="py-3 px-6 align-middle">
                                        {app.originalJobRole ? (
                                            <div className="bg-slate-100 group-hover:bg-white text-slate-600 px-3 py-2 rounded-lg transition-colors inline-block">
                                                <span className="text-xs font-bold leading-normal break-keep">{app.originalJobRole}</span>
                                            </div>
                                        ) : renderData(app.originalJobRole)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-slate-500 whitespace-nowrap align-middle">
                                        {renderData(app.contact)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-slate-500 break-all align-middle whitespace-normal">
                                        {renderData(app.email)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-slate-500 leading-relaxed align-middle whitespace-normal break-keep">
                                        {renderData(app.finalEducation)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-slate-600 leading-relaxed align-middle whitespace-normal break-keep">
                                        {app.careerCompany ? (
                                            <>
                                                <span className="font-bold text-slate-700">{app.careerCompany}</span> <br />
                                                <span className="text-xs text-slate-400">{app.careerPeriod}</span>
                                            </>
                                        ) : renderData(app.careerCompany)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-slate-500 leading-relaxed align-middle whitespace-normal break-keep">
                                        {renderData(app.careerRole)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-slate-500 whitespace-nowrap align-middle">
                                        {renderData(app.birthDate)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-slate-500 leading-relaxed align-middle whitespace-normal break-keep">
                                        {renderData(app.address)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 💡 3. 상단 이동 버튼 (Floating) */}
            {showTopButton && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-white shadow-2xl border border-slate-100 rounded-2xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 z-50 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4"
                >
                    <i className='bx bx-chevron-up text-3xl'></i>
                </button>
            )}

            {/* 상세 보기 모달 렌더링 */}
            <ApplicantDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                data={selectedApplicant}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
}