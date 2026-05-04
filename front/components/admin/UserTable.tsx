// src/components/admin/UserTable.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { User, PaginatedResponse, CreateUserRequest } from "@/types/admin";
import {
  createUser,
  checkEmailAvailability,
  getUserDetail,
  deleteUser,
} from "@/lib/admin/adminUsers.client";
import { resetUserPassword } from "@/lib/auth";

interface UserTableProps {
  data: PaginatedResponse<User>;
}

const columnHelper = createColumnHelper<User>();

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
  const [formData, setFormData] = useState<CreateUserRequest>({
    userEmail: "",
    password: "",
    userName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  // 단건 조회(상세) 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 💡 1. 서버에서 받은 데이터를 로컬 상태에 저장 (삭제 연출용)
  const [userList, setUserList] = useState<User[]>(data.content);

  // 삭제 // 업데이트시 로딩 화면 on off
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 비밀번호 초기화 모달 상태
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // 💡 2. 추가: 비밀번호 초기화 실행 핸들러
  const handleResetPassword = async (userId: number) => {
    if (!confirm("해당 사용자의 비밀번호를 초기화하시겠습니까?")) return;

    setIsResettingPassword(true);
    try {
      const res = await resetUserPassword(userId);
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

  // 💡 2. 검색이나 페이징으로 data가 바뀌면 로컬 상태도 업데이트해줘야 합니다.
  useEffect(() => {
    setUserList(data.content);
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

  // [추가 모달] 이메일 입력 및 중복 체크
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, userEmail: e.target.value });
    setIsEmailChecked(false);
    setEmailMessage("");
  };

  const handleEmailCheck = async () => {
    if (!formData.userEmail) {
      setEmailMessage("이메일을 먼저 입력해주세요.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      setEmailMessage("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsCheckingEmail(true);
    try {
      const res = await checkEmailAvailability(formData.userEmail);
      setIsEmailChecked(res.available);
      setEmailMessage(res.message);
    } catch (error) {
      setEmailMessage("중복 확인 중 오류가 발생했습니다.");
      setIsEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // [추가 모달] 사용자 생성 제출
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailChecked) {
      alert("이메일 중복 확인을 먼저 완료해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser(formData);
      alert(`${formData.userName}님이 성공적으로 추가되었습니다!`);

      setIsCreateModalOpen(false);
      setFormData({ userEmail: "", password: "", userName: "" });
      setIsEmailChecked(false);
      setEmailMessage("");

      router.refresh();
    } catch (error) {
      alert("사용자 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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
    pageCount: data.totalPages,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  const selectedCount = Object.keys(rowSelection).length;

  /* ==========================================
       4. 렌더링 (JSX)
    ========================================== */
  return (
    <div className="w-full">
      {/* 상단 액션 바 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <form onSubmit={handleSearch} className="relative">
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
            <input
              type="text"
              placeholder="이름/이메일 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-64 transition-all"
            />
          </form>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
        >
          <i className="bx bx-plus text-lg"></i> 사용자 추가
        </button>
      </div>

      {/* 테이블 데이터 렌더링 */}
      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden mb-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original.userId)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${row.getIsSelected() ? "bg-indigo-50/30" : ""}`}
                >
                  {row.getVisibleCells().map((c) => (
                    <td key={c.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.content.length === 0 && (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center">
            <i className="bx bx-ghost text-5xl mb-3"></i>
            <p className="font-medium">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 하단 페이지네이션 */}
      <div className="flex items-center justify-center gap-2 mt-8 mb-8">
        <button
          onClick={() => updateURLParams({ page: data.page - 1 })}
          disabled={data.page === 0}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <i className="bx bx-chevron-left text-2xl"></i>
        </button>
        <span className="text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
          {data.page + 1} / {data.totalPages === 0 ? 1 : data.totalPages} 페이지
        </span>
        <button
          onClick={() => updateURLParams({ page: data.page + 1 })}
          disabled={data.page >= data.totalPages - 1}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <i className="bx bx-chevron-right text-2xl"></i>
        </button>
      </div>

      {/* 💡 1. 사용자 추가 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">
                새 사용자 추가
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  이름
                </label>
                <input
                  required
                  type="text"
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  이메일 (ID)
                </label>
                <div className="flex gap-2">
                  <input
                    required
                    type="email"
                    value={formData.userEmail}
                    onChange={handleEmailChange}
                    className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all
                                            ${
                                              emailMessage
                                                ? isEmailChecked
                                                  ? "border-emerald-500 focus:ring-emerald-200"
                                                  : "border-rose-500 focus:ring-rose-200"
                                                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                                            }`}
                    placeholder="hr1@company.com"
                  />
                  <button
                    type="button"
                    onClick={handleEmailCheck}
                    disabled={
                      isCheckingEmail || !formData.userEmail || isEmailChecked
                    }
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isCheckingEmail
                      ? "확인 중..."
                      : isEmailChecked
                        ? "확인 완료"
                        : "중복 확인"}
                  </button>
                </div>
                {emailMessage && (
                  <p
                    className={`mt-2 text-xs font-bold flex items-center gap-1 ${isEmailChecked ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    <i
                      className={`bx ${isEmailChecked ? "bx-check-circle" : "bx-error-circle"} text-base`}
                    ></i>
                    {emailMessage}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  임시 비밀번호
                </label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
                  placeholder="password123!"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isEmailChecked}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors"
                >
                  {isSubmitting ? "추가 중..." : "추가 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💡 2. 사용자 상세 조회 및 삭제 모달 */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-20 bg-gradient-to-r from-slate-100 to-slate-50 relative border-b border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm"
              >
                <i className="bx bx-x text-xl"></i>
              </button>
            </div>

            <div className="p-8 pt-0">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-sm -mt-10 mb-4 mx-auto relative z-10 text-4xl text-indigo-500">
                <i className="bx bxs-user-circle"></i>
              </div>

              {isLoadingDetail ? (
                <div className="py-10 flex justify-center">
                  <i className="bx bx-loader-alt bx-spin text-3xl text-indigo-500"></i>
                </div>
              ) : selectedUser ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">
                      {selectedUser.userName}
                    </h3>
                    <p className="text-sm font-medium text-slate-500">
                      {selectedUser.userEmail}
                    </p>
                  </div>

                  <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-400">사원 ID</span>
                      <span className="font-semibold text-slate-800">
                        #{selectedUser.userId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-400">
                        시스템 권한
                      </span>
                      <span className="font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-400">
                        계정 생성일
                      </span>
                      <span className="font-semibold text-slate-800">
                        {new Intl.DateTimeFormat("ko-KR").format(
                          new Date(selectedUser.createdAt),
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      닫기
                    </button>

                    <div className="flex-1 flex gap-2">
                      {/* 💡 새로 추가된 비밀번호 초기화 버튼 (노란색 톤) */}
                      <button
                        onClick={() => handleResetPassword(selectedUser.userId)}
                        disabled={isResettingPassword}
                        className="flex-1 px-3 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm flex justify-center items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <i
                          className={`bx ${isResettingPassword ? "bx-loader-alt bx-spin" : "bx-key"} text-lg`}
                        ></i>
                        <span className="text-sm">비밀번호 초기화</span>
                      </button>

                      {/* 기존 계정 삭제 버튼 */}
                      <button
                        onClick={() => handleDeleteSingle(selectedUser.userId)}
                        className="flex-1 px-3 py-2.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm flex justify-center items-center gap-1.5 transition-colors"
                      >
                        <i className="bx bx-trash text-lg"></i>
                        <span className="text-sm">계정 삭제</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-rose-500 font-bold py-10">
                  데이터를 불러오지 못했습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 💡 3. 전역 삭제 로딩 오버레이 (z-[100] 적용) */}
      {isDeleting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100] animate-in fade-in duration-200">
          {/* 회전하는 로딩 아이콘 (Boxicons) */}
          <i className="bx bx-loader-alt bx-spin text-5xl text-white mb-4"></i>
          <p className="text-white font-bold text-lg tracking-wide shadow-sm">
            안전하게 삭제 중입니다...
          </p>
        </div>
      )}
      {/* 💡 (새로 추가) 하단 플로팅 리모콘 (항목 선택 시 표시) */}
      {selectedCount > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 rounded-full px-6 py-3 flex items-center gap-4">
            {/* 몇 개 선택되었는지 안내 */}
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full text-xs">
                {selectedCount}
              </span>
              명 선택됨
            </div>

            {/* 세로 구분선 */}
            <div className="w-px h-5 bg-slate-300"></div>

            {/* 삭제 버튼 */}
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-full text-sm font-bold shadow-sm hover:bg-rose-600 hover:-translate-y-0.5 transition-all"
            >
              <i className="bx bx-trash text-lg"></i>
              선택 삭제
            </button>

            {/* 선택 취소 버튼 (선택적) */}
            <button
              onClick={() => setRowSelection({})} // 💡 선택 초기화 함수
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors ml-1"
              title="선택 취소"
            >
              <i className="bx bx-x text-xl"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
