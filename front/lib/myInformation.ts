import { UserProfile } from "@/types/myInformation";
import { api } from "./api";

export const getMyProfile = async (): Promise<UserProfile> => {
    // 실제 백엔드 엔드포인트에 맞게 '/api/users/me' 부분을 수정해 주세요.
    const response = await api.get<UserProfile>('/api/users/me');
    return response.data;
};