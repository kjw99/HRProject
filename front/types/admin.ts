// src/types/admin.ts

export interface User {
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
  user: User | null;
  isLoading: boolean;
  isResettingPassword: boolean;
  onDelete: (userId: number) => void;
  onResetPassword: (userId: number) => void;
}

export interface CreateUserRequest {
  userEmail: string;
  password?: string;
  userName: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface EmailAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}
