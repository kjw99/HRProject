import { UserAccount } from "@/types/admin";

export const MOCK_USERS: UserAccount[] = [
    { id: 'u1', name: '김인사', email: 'insa@co.com', department: '인사기획팀', role: 'Super Admin', status: 'Active', lastLogin: '10분 전', createdAt: '2023.01.15', managedJobs: ['전체 접근 권한'] },
    { id: 'u2', name: '박채용', email: 'rcrt@co.com', department: '채용운영팀', role: 'HR Manager', status: 'Active', lastLogin: '1시간 전', createdAt: '2023.03.22', managedJobs: ['프론트엔드', 'AI 엔지니어'] },
    { id: 'u3', name: '이개발', email: 'dev@co.com', department: '플랫폼실', role: 'Interviewer', status: 'Active', lastLogin: '어제', createdAt: '2023.06.10', managedJobs: ['프론트엔드'] },
    { id: 'u4', name: '최데이터', email: 'data@co.com', department: 'AI연구소', role: 'Interviewer', status: 'Pending', lastLogin: '기록 없음', createdAt: '2024.04.01', managedJobs: ['AI 엔지니어'] },
];