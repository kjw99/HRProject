// apis/applicantApi.ts
import apiClient from '@/lib/apiClient';
import { Applicant } from '@/types/hr'; // 타입 정의가 있다면 import

// 지원자 관련 API를 하나의 객체로 묶어서 export
export const applicantApi = {
    // 1. 전체 리스트 조회 (GET /api/v1/applicants)
    getApplicants: () => {
        return apiClient.get<Applicant[]>('/applicants');
    },

    // 2. 특정 지원자 상세 조회 (GET /api/v1/applicants/123)
    getDetail: (id: string) => {
        return apiClient.get<Applicant>(`/applicants/${id}`);
    },

    // 3. 지원자 상태 변경 (PATCH /api/v1/applicants/123/status)
    updateStatus: (id: string, newStatus: string) => {
        return apiClient.patch(`/applicants/${id}/status`, { status: newStatus });
    },

    // 4. 이력서/엑셀 업로드 (POST /api/v1/applicants/upload)
    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        // 파일 업로드는 Content-Type이 다르므로 개별 설정 오버라이딩
        return apiClient.post('/applicants/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
};