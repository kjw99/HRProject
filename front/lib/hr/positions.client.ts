import { Position, PositionPayload, PositionMutationResponse } from "@/types/position";
import { api } from "../api";

export const positionApi = {
  /** GET /api/positions */
  fetchPositions: async (): Promise<Position[]> => {
    const response = await api.get<Position[]>("/api/positions");
    return response.data;
  },

  /**
   * 직무 생성 (Create)
   * POST /api/positions
   */
  createPosition: async (
    data: PositionPayload,
  ): Promise<PositionMutationResponse> => {
    const response = await api.post<PositionMutationResponse>(
      "/api/positions",
      data,
    );
    return response.data;
  },

  /**
   * 직무 수정 (Update)
   * PATCH /api/positions/{positionId}
   */
  updatePosition: async (
    positionId: number,
    data: PositionPayload,
  ): Promise<PositionMutationResponse> => {
    const response = await api.patch<PositionMutationResponse>(
      `/api/positions/${positionId}`,
      data,
    );
    return response.data;
  },

  /**
   * 직무 삭제 (Delete)
   * DELETE /api/positions/{positionId}
   */
  deletePosition: async (
    positionId: number,
  ): Promise<PositionMutationResponse> => {
    const response = await api.delete<PositionMutationResponse>(
      `/api/positions/${positionId}`,
    );
    return response.data;
  },
};
