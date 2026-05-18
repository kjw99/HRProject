import "server-only";

import { UserProfile } from "@/types/myInformation";
import { apiServer } from "../axios-server";

export async function getMyProfileServer(): Promise<UserProfile> {
  try {
    const response = await apiServer.get<UserProfile>("/api/auth/me");
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      "[getMyProfileServer] Failed to fetch profile. Rendering fallback data:",
      message,
    );

    return {
      userId: 1004,
      userEmail: "dasol.han@company.com",
      userName: "한다솔",
      role: "hr",
      createdAt: "2026-05-01T09:00:00+09:00",
    };
  }
}
