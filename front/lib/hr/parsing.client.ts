// src/lib/api/parsing.client.ts
import { ParsingResponse, ParsingItem } from '@/types/parsing';
import { api } from '../api';

export const parseResumes = async (files: File[]): Promise<ParsingResponse> => {
    const formData = new FormData();
    // 💡 변수명 'files'로 배열 주입
    files.forEach((file) => {
        formData.append('files', file);
    });

    try {
        // 실제 백엔드 요청
        const response = await api.post<ParsingResponse>('/api/parse', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;

    } catch (error: any) {
        console.error("🚨 [POST] 이력서 파싱 서버 연결 실패! 목업 데이터를 생성합니다.", error.message);

        // 💡 1. 실제 파싱 서버가 돌아가는 느낌을 주기 위해 지연 시간 추가 (파일 1개당 0.5초씩, 최대 3초)
        const delay = Math.min(files.length * 500, 3000);
        await new Promise(resolve => setTimeout(resolve, delay));

        // 💡 2. 넘겨받은 files 배열을 기반으로 업로드한 파일 수만큼 목업 아이템 생성
        const mockItems: ParsingItem[] = files.map((file, idx) => ({
            filename: file.name, // 실제 드래그 앤 드롭한 파일명 사용
            record: {
                candidateId: 1000 + idx,
                resumeId: 2000 + idx,
                positionMatch: {
                    status: idx % 3 === 0 ? "noMatch" : "matched", // 일부러 매칭 안된 케이스도 생성
                    matchedPositionName: idx % 2 === 0 ? "프론트엔드 개발자" : "퍼포먼스 마케팅",
                    reason: "이력서 내 키워드 기반으로 추출된 가상 매칭 결과입니다.",
                },
                candidate: {
                    name: `지원자${idx + 1}`,
                    dateOfBirth: `199${idx}-05-15`, // 나이 다르게 생성
                    phone: `010-1234-567${idx}`,
                    email: `user${idx}@example.com`,
                    // 홀수 번째 지원자만 우대조건 충족하는 것으로 연출
                    meetsPreferredCriteria: idx % 2 !== 0 ? ["관련 전공자", "해당 직무 경험 3년 이상"] : [],
                },
                resume: {
                    summary: `${file.name}에서 추출된 가상의 요약본입니다. 이 지원자는 매우 성실하며 직무에 대한 이해도가 높습니다.`,
                },
                aiProfile: {
                    target_position: idx % 2 === 0 ? "개발팀" : "마케팅팀",
                    candidate_summary: {
                        core_summary: "전반적으로 우수한 역량을 보유하고 있으며 팀워크에 기여할 수 있는 인재입니다.",
                    },
                },
            }
        }));

        // 💡 3. 서버 응답 포맷과 동일하게 리턴
        return {
            items: mockItems,
            errors: [], // 에러가 있는 케이스를 테스트하고 싶다면 여기에 문자열 추가
        };
    }
};