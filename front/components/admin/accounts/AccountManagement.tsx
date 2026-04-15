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
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function AccountManagementClient({
  initialUsers = MOCK_USERS,
}: AccountManagementProps) {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  // 모달 제어 상태
  const [drawerUser, setDrawerUser] = useState<UserAccount | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<UserAccount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Boxicons Load
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // 필터링 적용
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.name.includes(search) || u.department.includes(search)) &&
          (filterRole === "All" || u.role === filterRole),
      ),
    [users, search, filterRole],
  );

  // --- Handlers ---
  const handleAdd = (fd: FormData) => {
    setUsers([
      {
        id: `u_${Date.now()}`,
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        department: fd.get("dept") as string,
        role: fd.get("role") as Role,
        status: "Pending",
        lastLogin: "없음",
        createdAt: new Date().toLocaleDateString(),
        managedJobs: [],
      },
      ...users,
    ]);
    setIsAddOpen(false);
  };

  const handleRoleChange = (role: Role) => {
    if (!roleUser) return;
    setUsers(users.map((u) => (u.id === roleUser.id ? { ...u, role } : u)));
    if (drawerUser?.id === roleUser.id) setDrawerUser({ ...drawerUser, role });
    setRoleUser(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true); // 로딩 시작

    try {
      // 1. 실제 서버(DB) 삭제 API 호출 (Next.js Server Action 또는 Route Handler)
      // await fetch(`/api/users/${deleteId}`, { method: 'DELETE' });

      // 테스트를 위한 인위적인 1초 지연 (API 통신 흉내)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 2. 화면(UI) 업데이트 (Optimistic UI)
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));
      if (drawerUser?.id === deleteId) setDrawerUser(null); // 열려있는 드로어도 닫기

      // 3. 모달 닫기
      setDeleteId(null);

      // alert("계정이 성공적으로 삭제되었습니다."); // 필요시 Toast 알림 추가
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false); // 로딩 종료
    }
  };

  // --- 렌더링 부 --- (코드가 매우 간결해짐)
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 p-6 md:p-10">
      <div className="max-w-350 mx-auto space-y-8 animate-in fade-in duration-500">
        {/* 블록 조립 (추상화된 컴포넌트 사용) */}
        <Header onAddClick={() => setIsAddOpen(true)} />

        <FilterBar
          search={search}
          setSearch={setSearch}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
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
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />
      <ChangeRoleModal
        user={roleUser}
        onClose={() => setRoleUser(null)}
        onChangeRole={handleRoleChange}
      />
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDelete={handleDelete}
        isDeleting={isDeleting} // 로딩 상태 넘겨주기
      />
    </div>
  );
}
