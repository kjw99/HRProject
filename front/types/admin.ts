// src/types/admin.ts

// 💡 1. 인터페이스 정의 (컴포넌트에서 수정하기 쉽도록 내부에 정의)


export interface AdminUser {
  userId: number;
  userName: string;
  userEmail: string;
  role: "admin" | "hr" | "viewer";
  createdAt: string;
  status?: "ACTIVE" | "BLOCK";
}

// 💡 1. 하단 플로팅 액션 바 Props
export interface FloatingActionBarProps {
  selectedCount: number;
  onDownload: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

// 💡 2. 사용자 추가 모달 Props
export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // 사용자 추가 성공 시 목록 새로고침을 위한 콜백
}

// 💡 3. 사용자 상세/삭제 모달 Props
export interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  isLoading: boolean;
  isResettingPassword: boolean;
  onDelete: (userId: number) => void;
  onResetPassword: (userEmail: string) => void;
}

export interface CreateUserRequest {
  userEmail: string;
  password?: string;
  userName: string;
}

export interface AdminUserListResponse {
  content: AdminUser[];
  // 백엔드 명세에 페이징 메타데이터가 추가될 경우를 대비해 확장 가능하게 구조화
}

export interface EmailAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}

// 💡 4. 페이지 차단 상태 인터페이스

// 접근 제어 규칙(Route Rule) 인터페이스
export interface PageAccessRule {
  id: string; // 고유 식별자 (DB의 PK 역할)
  path: string; // 차단/허용할 URL 경로 (예: /payment)
  isActive: boolean; // true: 접근 허용(Active), false: 접근 차단(Maintenance)
  message: string; // 차단 시 사용자에게 보여줄 점검 사유
  updatedAt: string; // 마지막 수정일
}

// 폼 입력 시 사용할 Omit 타입 (id와 updatedAt은 서버에서 자동 생성된다고 가정)
export type CreateRuleRequest = Omit<
  PageAccessRule,
  "id" | "updatedAt" | "isActive"
>;
