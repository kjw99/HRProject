import axios from "axios";
import {
  InterviewerInviteAcceptPayload,
  InterviewerInviteAcceptResponse,
  InterviewerInvitePayload,
  InterviewerInviteResponse,
} from "@/types/interviewer";
import { api } from "../api";

function normalizeInviteResponse(
  data: InterviewerInviteResponse & {
    invite_id?: number;
    interviewer_id?: number;
    invite_url?: string;
    expires_at?: string;
    reused?: boolean;
  },
): InterviewerInviteResponse {
  return {
    inviteId: data.inviteId ?? data.invite_id ?? 0,
    interviewerId: data.interviewerId ?? data.interviewer_id ?? 0,
    inviteUrl: data.inviteUrl ?? data.invite_url ?? "",
    expiresAt: data.expiresAt ?? data.expires_at ?? "",
    reused: data.reused ?? false,
  };
}

export const interviewerInviteApi = {
  /** 만료·폐기되지 않은 활성 초대 링크 조회 (없으면 null) */
  getActiveInvite: async (
    interviewerId: number,
  ): Promise<InterviewerInviteResponse | null> => {
    try {
      const response = await api.get<
        InterviewerInviteResponse & {
          invite_id?: number;
          invite_url?: string;
          expires_at?: string;
        }
      >(`/api/interviewers/${interviewerId}/active-invite`);
      return normalizeInviteResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 활성 링크가 있으면 재사용, 없으면 새로 생성.
   * 서버 POST `/api/interviewer-invites`가 idempotent(get_or_create)이므로 POST만 사용합니다.
   */
  ensureInvite: async (
    payload: InterviewerInvitePayload,
  ): Promise<InterviewerInviteResponse> => {
    const response = await api.post<
      InterviewerInviteResponse & {
        invite_id?: number;
        interviewer_id?: number;
        invite_url?: string;
        expires_at?: string;
        reused?: boolean;
      }
    >("/api/interviewer-invites", {
      interviewerId: payload.interviewerId,
      expiresInDays: payload.expiresInDays ?? 7,
    });
    return normalizeInviteResponse(response.data);
  },

  createInvite: async (
    payload: InterviewerInvitePayload,
  ): Promise<InterviewerInviteResponse> => {
    const response = await api.post<
      InterviewerInviteResponse & {
        invite_id?: number;
        invite_url?: string;
        expires_at?: string;
      }
    >("/api/interviewer-invites", payload);
    return normalizeInviteResponse(response.data);
  },

  acceptInvite: async (
    payload: InterviewerInviteAcceptPayload,
  ): Promise<InterviewerInviteAcceptResponse> => {
    const response = await api.post<InterviewerInviteAcceptResponse>(
      "/api/interviewer-invites/accept",
      payload,
    );
    return response.data;
  },
};
