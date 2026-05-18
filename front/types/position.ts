// 기존 직무 타입
export interface Position {
  positionId: number;
  positionName: string;
  createdAt: string;
}

// 💡 새로 추가할 타입들
// 생성 및 수정 요청(Request Body)에 사용할 페이로드
export interface PositionPayload {
  positionName: string;
}

// 생성 및 수정 완료 응답(Response Body)
export interface PositionMutationResponse {
  message: string;
}
