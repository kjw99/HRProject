'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

// 1. 데이터 타입 정의
interface Skill {
    name: string;
    level: 'Essential' | 'Preferred';
}

interface Job {
    id: string;
    title: string;
    department: string;
    status: 'Active' | 'Draft' | 'Closed';
    description: string;
    skills: Skill[];
}

// 초기 목업 데이터
const INITIAL_JOBS: Job[] = [
    {
        id: 'job_1',
        title: 'IT-FRONTEND',
        department: '기술본부',
        status: 'Active',
        description: 'Next.js와 TypeScript를 이용한 대시보드 고도화 및 신규 기능 개발',
        skills: [
            { name: 'React', level: 'Essential' },
            { name: 'Next.js', level: 'Essential' },
            { name: 'TypeScript', level: 'Essential' },
            { name: 'Tailwind CSS', level: 'Preferred' }
        ]
    },
    {
        id: 'job_2',
        title: 'HR 매니저',
        department: '인사팀',
        status: 'Draft',
        description: '전사 채용 프로세스 설계, 운영 및 온보딩 프로그램 기획',
        skills: [
            { name: '커뮤니케이션', level: 'Essential' },
            { name: '채용 브랜딩', level: 'Preferred' }
        ]
    },
    {
        id: 'job_3',
        title: 'IT-BACKEND',
        department: '기술본부',
        status: 'Active',
        description: 'Spring Boot 기반 대용량 트래픽 처리 API 서버 설계 및 MSA 전환',
        skills: [
            { name: 'Java', level: 'Essential' },
            { name: 'Spring Boot', level: 'Essential' },
            { name: 'MySQL', level: 'Essential' },
            { name: 'AWS', level: 'Preferred' },
            { name: 'Kafka', level: 'Preferred' }
        ]
    },
    {
        id: 'job_4',
        title: '프로덕트 디자이너 (UI/UX)',
        department: '디자인그룹',
        status: 'Active',
        description: 'B2B SaaS 프로덕트 사용성 개선 및 디자인 시스템 구축',
        skills: [
            { name: 'Figma', level: 'Essential' },
            { name: 'UX 리서치', level: 'Essential' },
            { name: '프로토타이핑', level: 'Preferred' }
        ]
    },
    {
        id: 'job_5',
        title: '데이터 애널리스트',
        department: '데이터전략팀',
        status: 'Closed',
        description: '유저 행동 데이터 분석 및 대시보드(Tableau) 구축을 통한 인사이트 도출',
        skills: [
            { name: 'SQL', level: 'Essential' },
            { name: 'Python', level: 'Essential' },
            { name: 'Tableau', level: 'Preferred' }
        ]
    },
    {
        id: 'job_6',
        title: '퍼포먼스 마케터',
        department: '그로스마케팅팀',
        status: 'Draft',
        description: '매체별 광고 효율 최적화(ROAS) 및 A/B 테스트 기획',
        skills: [
            { name: '데이터 분석', level: 'Essential' },
            { name: 'Google Analytics', level: 'Essential' },
            { name: '카피라이팅', level: 'Preferred' }
        ]
    },
    {
        id: 'job_7',
        title: 'DevOps 엔지니어',
        department: '인프라팀',
        status: 'Active',
        description: 'CI/CD 파이프라인 구축 및 Kubernetes 클러스터 운영',
        skills: [
            { name: 'Kubernetes', level: 'Essential' },
            { name: 'Docker', level: 'Essential' },
            { name: 'GitHub Actions', level: 'Preferred' },
            { name: 'Terraform', level: 'Preferred' }
        ]
    }
];

export default function JobManagementPage() {
    const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(INITIAL_JOBS[0].id);
    const [isEditing, setIsEditing] = useState(false);

    // 현재 선택된 직무 데이터
    const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

    // --- CRUD 함수들 ---

    // 추가 (새 직무 생성)
    const handleAddJob = () => {
        const newJob: Job = {
            id: `job_${Date.now()}`,
            title: '새로운 직무 명칭',
            department: '부서 선택',
            status: 'Draft',
            description: '',
            skills: []
        };
        setJobs([newJob, ...jobs]);
        setSelectedJobId(newJob.id);
        setIsEditing(true);
        toast.success('새 직무 슬롯이 생성되었습니다.');
    };

    // 수정 저장
    const handleSave = (updatedJob: Job) => {
        setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
        setIsEditing(false);
        toast.success('변경 사항이 저장되었습니다.');
    };

    // 삭제
    const handleDelete = (id: string) => {
        if (!confirm('정말로 이 직무를 삭제하시겠습니까?')) return;
        setJobs(jobs.filter(j => j.id !== id));
        setSelectedJobId(jobs[0]?.id || null);
        toast.error('직무가 삭제되었습니다.');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">

            {/* ⬅️ 좌측: 직무 리스트 (컴팩트 자세히 보기 형태) */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        직무 리스트 <span className="text-indigo-500 ml-1">{jobs.length}</span>
                    </h3>
                    <button
                        onClick={handleAddJob}
                        className="w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="새 직무 추가"
                    >
                        <i className='bx bx-plus text-lg'></i>
                    </button>
                </div>

                {/* 💡 간격을 줄이기 위해 space-y-2에서 space-y-1로 변경 */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                    {jobs.map(job => (
                        <div
                            key={job.id}
                            onClick={() => { setSelectedJobId(job.id); setIsEditing(false); }}
                            // 💡 p-4에서 px-3 py-2.5로 패딩 축소, 레이아웃을 가로(flex)로 변경
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer group
                                ${selectedJobId === job.id
                                    ? 'bg-white border-indigo-200 shadow-sm'
                                    : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* 💡 큰 배지 대신 상태 표시 Dot(점) 사용 */}
                                <div className={`w-2 h-2 rounded-full shrink-0
                                    ${job.status === 'Active' ? 'bg-emerald-500' :
                                        job.status === 'Draft' ? 'bg-amber-400' : 'bg-slate-300'}`}
                                    title={job.status}
                                />

                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                                        {job.title}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {job.department}
                                    </p>
                                </div>
                            </div>

                            {/* 삭제 버튼 (우측 정렬) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                                className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all ml-2 shrink-0"
                                title="직무 삭제"
                            >
                                <i className='bx bx-trash text-base'></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ➡️ 우측: 상세 설정 (CRUD 상세 + AI 매칭 시너지) */}
            <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                {selectedJob ? (
                    <>
                        {/* 헤더 */}
                        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">직무 상세 설정</h2>
                                <p className="text-sm text-slate-500">기본 정보와 AI 매칭 역량을 관리합니다.</p>
                            </div>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <button
                                        onClick={() => handleSave(selectedJob)}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        저장하기
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                    >
                                        수정하기
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 컨텐츠 (기본 정보 + AI 매칭) */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">

                            {/* 섹션 1: 기본 정보 (CRUD) */}
                            <section className="space-y-6">
                                <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <i className='bx bx-info-circle text-lg'></i> 기본 정보
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 ml-1">직무 명칭</label>
                                        <input
                                            disabled={!isEditing}
                                            value={selectedJob.title}
                                            onChange={(e) => setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, title: e.target.value } : j))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 ml-1">소속 부서</label>
                                        <input
                                            disabled={!isEditing}
                                            value={selectedJob.department}
                                            onChange={(e) => setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, department: e.target.value } : j))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 ml-1">직무 상세 설명 (JD)</label>
                                    <textarea
                                        disabled={!isEditing}
                                        rows={4}
                                        value={selectedJob.description}
                                        onChange={(e) => setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, description: e.target.value } : j))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all outline-none font-medium text-sm leading-relaxed"
                                    />
                                </div>
                            </section>

                            {/* 섹션 2: AI 매칭 역량 설정 (시너지 피처) */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                        <i className='bx bx-target-lock text-lg'></i> AI 매칭 역량 설정
                                    </h4>
                                    <button
                                        disabled={!isEditing}
                                        className="text-xs font-black text-indigo-600 hover:underline disabled:opacity-30"
                                    >
                                        + 역량 추가
                                    </button>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 mb-4">설정된 역량은 AI 파싱 결과의 적합도(%) 계산에 반영됩니다.</p>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedJob.skills.map((skill, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm group/tag">
                                                <span className={`w-2 h-2 rounded-full ${skill.level === 'Essential' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                                                <span className="text-sm font-bold text-slate-700">{skill.name}</span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase">{skill.level}</span>
                                                {isEditing && (
                                                    <button className="ml-1 text-slate-300 hover:text-rose-500 transition-colors">
                                                        <i className='bx bx-x text-base'></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {selectedJob.skills.length === 0 && (
                                            <div className="w-full py-8 text-center text-slate-300 text-sm font-bold border-2 border-dashed border-slate-200 rounded-xl">
                                                설정된 매칭 역량이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <i className='bx bx-select-multiple text-6xl mb-4'></i>
                        <p className="font-bold">편집할 직무를 리스트에서 선택해주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}