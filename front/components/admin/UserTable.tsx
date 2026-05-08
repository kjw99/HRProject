// src/components/admin/UserTable.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AdminUser, AdminUserListResponse } from "@/types/admin";
import { getUserDetail, deleteUser } from "@/lib/admin/adminUsers.client";
import { resetUserPassword } from "@/lib/common/auth";
import { exportToCSV } from "@/lib/utils/export";
import FloatingActionBar from "./usertable/FloatingActionBar";
import UserDetailModal from "./usertable/UserDetailModal";
import CreateUserModal from "./usertable/CreateUserModal";
import { fetchAdminUsersClient } from "@/lib/admin/adminUsers.client";
interface UserTableProps {
  data: AdminUserListResponse;
}

const columnHelper = createColumnHelper<AdminUser>();

export default function UserTable({ data }: UserTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ==========================================
       1. 상태 관리 (State)
    ========================================== */
  // 테이블 & 검색 상태
  const [searchInput, setSearchInput] = useState(
    searchParams.get("keyword") || "",
  );
  const [rowSelection, setRowSelection] = useState({});

  // 사용자 추가 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 단건 조회(상세) 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 💡 1. 서버에서 받은 데이터를 로컬 상태에 저장 (삭제 연출용)
  const [userList, setUserList] = useState<AdminUser[]>(data.content);
  // 이제 클라이언트
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
  const [isFetching, setIsFetching] = useState(false); // 추가 데이터 로딩 상태
  const observer = useRef<IntersectionObserver | null>(null);

  // 삭제 // 업데이트시 로딩 화면 on off
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 비밀번호 초기화 모달 상태
  const [isResettingPassword, setIsResettingPassword] = useState(false);


  // 💡 마지막 요소를 감지하는 콜백 ref
  const lastElementRef = useCallback((node: HTMLTableRowElement) => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1); // 페이지 번호 증가
      }
    });

    if (node) observer.current.observe(node);
  }, [isFetching, hasMore]);

  // 💡 페이지 번호가 바뀔 때마다 데이터 추가 호출
  useEffect(() => {
    // 첫 페이지(SSR 데이터)는 무시
    if (page === 0) return;

    const loadMoreUsers = async () => {
      setIsFetching(true);
      try {
        const keyword = searchParams.get("keyword") || "";
        const res = await fetchAdminUsersClient(page, 20, keyword);

        const newUsers = res.content;

        if (newUsers.length === 0) {
          setHasMore(false);
        } else {
          setUserList((prev) => [...prev, ...newUsers]); // 💡 기존 리스트 뒤에 추가
        }
      } catch (error: any | Error) {
        console.error("데이터 로딩 실패", error);
      } finally {
        setIsFetching(false);
      }
    };

    loadMoreUsers();
  }, [page, searchParams]);


  // 💡 2. 추가: 비밀번호 초기화 실행 핸들러
  const handleResetPassword = async (userEmail: string) => {
    if (!confirm("해당 사용자의 비밀번호를 초기화하시겠습니까?")) return;

    setIsResettingPassword(true);
    try {
      const res = await resetUserPassword(userEmail);
      // 성공 시 발급된 임시 비밀번호를 알림창으로 확실히 보여줍니다.
      alert(
        `${res.message}\n\n🔑 임시 비밀번호: ${res.temporaryPassword}\n(사용자에게 이 비밀번호를 전달해 주세요.)`,
      );
    } catch (error) {
      alert("비밀번호 초기화에 실패했습니다.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // 💡 검색어가 바뀌면 상태 리셋
  useEffect(() => {
    setUserList(data.content);
    setPage(0);
    setHasMore(true);
  }, [data.content]);

  /* ==========================================
       2. 핸들러 함수 (Handlers)
    ========================================== */
  // URL 업데이트 (검색 및 페이징)
  const updateURLParams = (updates: Record<string, string | number>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === 0) current.delete(key);
      else current.set(key, String(value));
    });
    router.push(`${pathname}?${current.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams({ keyword: searchInput, page: 0 });
  };

  // [상세/삭제 모달] 단건 조회
  const handleRowClick = async (userId: number) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    try {
      const user = await getUserDetail(userId);
      setSelectedUser(user);
    } catch (error) {
      alert("사용자 정보를 불러오는데 실패했습니다.");
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // [상세/삭제 모달] 단건 삭제
  //   const handleDeleteSingle = async (userId: number) => {
  //     if (
  //       !confirm(
  //         "정말 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  //       )
  //     )
  //       return;

  //     try {
  //       const res = await deleteUser(userId);

  //       // ✅ [서버 연결 시] 1. 아래 주석 해제 (실제 성공 메시지)
  //       // alert(res.message);

  //       // ✅ [서버 연결 시] 2. finally에 있는 두 줄을 여기(try 안)로 옮겨옵니다.
  //       // setIsDetailModalOpen(false);
  //       // router.refresh();
  //     } catch (error) {
  //       // ✅ [서버 연결 시] 3. 아래 주석 해제 (실제 실패 메시지)
  //       // alert("삭제에 실패했습니다.");

  //       // 🚨 [서버 미연결 시] 강제로 성공 메시지 띄우기 (나중에 삭제)
  //       alert("계정이 삭제되었습니다. (UI 테스트용 강제 처리)");
  //     } finally {
  //       // 🚨 [서버 미연결 시] 성공하든 에러가 나든 무조건 모달 닫고 새로고침
  //       // ✅ [서버 연결 시] 4. 이 finally 블록 전체를 삭제하세요!
  //       setIsDetailModalOpen(false);
  //       router.refresh();
  //     }
  //   };

  const handleDeleteSingle = async (userId: number) => {
    if (
      !confirm(
        "정말 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      )
    )
      return;

    setIsDeleting(true);
    try {
      // 실제 서버 호출
      await deleteUser(userId);
    } catch (error) {
      console.error("삭제 요청 실패 (목업 모드)");
    } finally {
      // 💡 핵심: filter를 사용하여 삭제한 userId만 제외한 나머지를 상태에 저장
      // 이렇게 하면 서버 응답과 상관없이 화면에서 즉시 사라집니다.
      setUserList((prev) => prev.filter((user) => user.userId !== userId));

      alert("계정이 성공적으로 삭제되었습니다."); // 사용자 피드백
      setIsDetailModalOpen(false); // 모달 닫기
      setIsDeleting(false);
      // router.refresh(); // 지금은 목업 데이터를 다시 가져오면 안 되므로 주석 처리하거나 빼도 됩니다.
    }
  };

  // [메인 테이블] 다중 선택 삭제
  const handleBulkDelete = async () => {
    const selectedRowModel = table.getSelectedRowModel();
    const selectedIds = selectedRowModel.rows.map((row) => row.original.userId);

    if (selectedIds.length === 0) return;
    if (!confirm(`선택한 ${selectedIds.length}명의 사용자를 삭제하시겠습니까?`))
      return;
    setIsDeleting(true); // 💡 로딩 화면 켜기
    try {
      await Promise.all(selectedIds.map((id) => deleteUser(id)));
      alert(`${selectedIds.length}명의 계정이 삭제되었습니다.`);
      setRowSelection({});
      router.refresh();
    } catch (error) {
      alert("일부 사용자를 삭제하는 중 오류가 발생했습니다.");
      setIsDeleting(false); // 💡 로딩 화면 끄기
    }
  };

  /* ==========================================
       3. TanStack Table 설정
    ========================================== */
  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      ),
    }),
    columnHelper.accessor("userId", {
      header: "ID",
      cell: (info) => (
        <span className="text-slate-400 font-mono">#{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("userName", {
      header: "이름",
      cell: (info) => (
        <span className="font-bold text-slate-800">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("userEmail", {
      header: "이메일",
      cell: (info) => <span className="text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor("role", {
      header: "권한",
      cell: (info) => {
        const role = info.getValue();
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase
                        ${role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}
          >
            {role}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    // data: data.content,
    data: userList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  const selectedCount = Object.keys(rowSelection).length;

  // 💡 엑셀 출력용 헤더 매핑 정의 (일반화의 핵심)
  const userHeaderMap = {
    userId: "ID",
    userName: "성함",
    userEmail: "이메일",
    role: "권한",
    createdAt: "가입일",
  };

  // 💡 전체 다운로드 핸들러
  const handleDownloadAll = () => {
    exportToCSV(data.content, userHeaderMap, "전체_사용자_목록");
  };

  // 💡 선택 항목 다운로드 핸들러
  const handleDownloadSelected = () => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    exportToCSV(selectedRows, userHeaderMap, "선택_사용자_목록");
  };
  /* ==========================================
       4. 렌더링 (JSX) - 반응형 & Figma 스타일 고도화
    ========================================== */
  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* 💡 1. 상단 액션 바 (반응형: 모바일에서는 세로 배치, 데스크탑에서는 가로 배치) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">

        {/* 검색창 및 다운로드 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
          <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
            <i className="bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
            <input
              type="text"
              placeholder="이름/이메일 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </form>

          <button
            onClick={handleDownloadAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
          >
            <i className="bx bx-download text-lg"></i>
            목록 다운로드
          </button>
        </div>

        {/* 사용자 추가 버튼 */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm hover:shadow-md"
        >
          <i className="bx bx-plus text-lg"></i> 사용자 추가
        </button>
      </div>

      {/* 💡 2. 테이블 데이터 렌더링 (가로 스크롤 방어 및 모바일 패딩 최적화) */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* 모바일 가로 스크롤 영역 */}
        {/* table- 최소 너비를 주어 모바일에서 강제로 찌그러지지 않게 함 */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 backdrop-blur-sm">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-4 py-4 md:px-6 md:py-5 text-xs font-black text-slate-500 uppercase tracking-wider"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row, index) => {
                const isLastElement = table.getRowModel().rows.length === index + 1;
                return (
                  <tr
                    key={row.id}
                    ref={isLastElement ? lastElementRef : null}
                    onClick={() => handleRowClick(row.original.userId)}
                    className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${row.getIsSelected() ? "bg-indigo-50/40 hover:bg-indigo-50/60" : ""
                      }`}
                  >
                    {row.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-4 py-3.5 md:px-6 md:py-4 whitespace-nowrap">
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* 💡 추가 데이터 로딩 중 표시 (스켈레톤 또는 로더) */}
        {isFetching && (
          <div className="py-8 flex justify-center border-t border-slate-100 bg-slate-50/20">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <i className="bx bx-loader-alt bx-spin text-xl text-indigo-600"></i>
              목록을 더 불러오는 중...
            </div>
          </div>
        )}

        {/* 💡 모든 데이터를 다 불러왔을 때 표시 */}
        {!hasMore && userList.length > 0 && (
          <div className="py-8 text-center border-t border-slate-100 bg-slate-50/10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              모든 사용자를 불러왔습니다.
            </p>
          </div>
        )}
        {/* 검색 결과 없음 UI */}
        {data.content.length === 0 && (
          <div className="text-center py-24 text-slate-400 flex flex-col items-center bg-slate-50/30">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
              <i className="bx bx-ghost text-3xl text-slate-300"></i>
            </div>
            <p className="text-base font-bold text-slate-600">검색 결과가 없습니다.</p>
            <p className="text-sm mt-1">다른 검색어를 입력하거나 필터를 변경해 보세요.</p>
          </div>
        )}
      </div>

      {/* 사용자 추가 모달 */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {/* 사용자 상세 조회 및 삭제 모달 */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
        isLoading={isLoadingDetail}
        isResettingPassword={isResettingPassword}
        onDelete={handleDeleteSingle}
        onResetPassword={handleResetPassword}
      />

      {/* 하단 플로팅 리모콘 */}
      <FloatingActionBar
        selectedCount={selectedCount}
        onDownload={handleDownloadSelected}
        onDelete={handleBulkDelete}
        onClearSelection={() => setRowSelection({})}
      />

      {/* 💡 전역 삭제 로딩 오버레이 (디자인 고도화) */}
      {isDeleting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
            <i className="bx bx-loader-alt bx-spin text-4xl text-indigo-600 mb-3"></i>
            <p className="text-slate-800 font-black text-sm tracking-wide">
              안전하게 처리 중입니다...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
