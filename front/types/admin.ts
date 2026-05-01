// src/types/admin.ts

export interface User {
  userId: number;
  userEmail: string;
  userName: string;
  role: "admin" | "hr" | "viewer";
  createdAt: string;
  status?: "ACTIVE" | "BLOCK";
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