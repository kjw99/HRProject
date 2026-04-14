"use client";

import { MOCK_USERS } from "@/mocked/adminData";
import { AccountManagementProps, Role, UserAccount } from "@/types/admin";
import { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import FilterBar from "./FilterBar";
import UserTable from "./UserTable";
import UserDrawer from "./UserDrawer";
import AddUserModal from "./AddUserModal";
import ChangeRoleModal from "./ChangeRoleModal";
import DeleteConfirmModal from "../../pipeline/DeleteConfirmModal";

export default function AccountManagementClient({ initialUsers = MOCK_USERS }: AccountManagementProps) {
    const [users, setUsers] = useState<UserAccount[]>(initialUsers);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('All');

    // 모달 제어 상태
    const [drawerUser, setDrawerUser] = useState<UserAccount | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [roleUser, setRoleUser] = useState<UserAccount | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Boxicons Load
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => { if (document.head.contains(link)) document.head.removeChild(link); }
    }, []);

    // 필터링 적용
    const filteredUsers = useMemo(() => users.filter(u =>
        (u.name.includes(search) || u.department.includes(search)) &&
        (filterRole === 'All' || u.role === filterRole)
    ), [users, search, filterRole]);

    // --- Handlers ---
    const handleAdd = (fd: FormData) => {
        setUsers([{
            id: `u_${Date.now()}`, name: fd.get('name') as string, email: fd.get('email') as string,
            department: fd.get('dept') as string, role: fd.get('role') as Role,
            status: 'Pending', lastLogin: '없음', createdAt: new Date().toLocaleDateString(), managedJobs: []
        }, ...users]);
        setIsAddOpen(false);
    };

    const handleRoleChange = (role: Role) => {
        if (!roleUser) return;
        setUsers(users.map(u => u.id === roleUser.id ? { ...u, role } : u));
        if (drawerUser?.id === roleUser.id) setDrawerUser({ ...drawerUser, role });
        setRoleUser(null);
    };

    const handleDelete = () => {
        setUsers(users.filter(u => u.id !== deleteId));
        if (drawerUser?.id === deleteId) setDrawerUser(null);
        setDeleteId(null);
    };

    // --- 렌더링 부 --- (코드가 매우 간결해짐)
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 p-6 md:p-10">
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">

                {/* 블록 조립 (추상화된 컴포넌트 사용) */}
                <Header onAddClick={() => setIsAddOpen(true)} />

                <FilterBar
                    search={search} setSearch={setSearch}
                    filterRole={filterRole} setFilterRole={setFilterRole}
                />

                <UserTable
                    users={filteredUsers}
                    onRowClick={setDrawerUser}
                    onEdit={setRoleUser}
                    onDelete={setDeleteId}
                />

            </div>

            {/* 모달 및 오버레이 관리 */}
            <UserDrawer
                user={drawerUser}
                onClose={() => setDrawerUser(null)}
                onEdit={setRoleUser}
                onDelete={setDeleteId}
            />
            <AddUserModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
            <ChangeRoleModal user={roleUser} onClose={() => setRoleUser(null)} onChangeRole={handleRoleChange} />
            <DeleteConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onDelete={handleDelete} />
        </div>
    );
}