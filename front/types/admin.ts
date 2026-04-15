import { ReactNode } from 'react';

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
}

export interface MenuGroup {
    title: string;
    items: MenuItem[];
}

export interface AdminSidebarProps {
    activeMenu: string;
    setActiveMenu: (id: string) => void;
}

export interface AdminLayoutProps {
    children: ReactNode;
    activeMenu: string;
    setActiveMenu: (id: string) => void;
}

export type Role = 'Super Admin' | 'HR Manager' | 'Interviewer' | 'Viewer';
export type Status = 'Active' | 'Inactive' | 'Pending';

export interface UserAccount {
    id: string;
    name: string;
    email: string;
    department: string;
    role: Role;
    status: Status;
    lastLogin: string;
    createdAt: string;
    managedJobs: string[];
}

export interface AccountManagementProps {
    initialUsers: UserAccount[]; // 서버 컴포넌트에서 SSR로 주입받는 초기 데이터
}