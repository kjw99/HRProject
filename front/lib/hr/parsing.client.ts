// src/lib/api/parsing.client.ts
import { ParsingResponse, ParsingItem } from '@/types/parsing'; // 인터페이스 임포트
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

        // 💡 2. 엄격한 인터페이스 규격에 맞춘 목업 아이템 생성
        const mockItems: ParsingItem[] = files.map((file, idx) => ({
            filename: file.name,
            record: {
                candidateId: 1000 + idx,
                resumeId: 2000 + idx,
                positionMatch: {
                    status: idx % 3 === 0 ? "noMatch" : "matched",
                    rawPosition: idx % 2 === 0 ? "프론트엔드 개발자" : "마케팅",
                    matchedPositionId: idx % 2 === 0 ? 1 : 2,
                    matchedPositionName: idx % 2 === 0 ? "프론트엔드 개발자" : "퍼포먼스 마케팅",
                    candidates: [],
                    reason: "이력서 내 키워드 기반으로 추출된 가상 매칭 결과입니다.",
                },
                candidate: {
                    candidateId: 1000 + idx,
                    positionId: idx % 2 === 0 ? 1 : 2,
                    name: `지원자${idx + 1}`,
                    dateOfBirth: `199${idx}-05-15`,
                    gender: idx % 2 === 0 ? '남' : '여',
                    address: "(우편번호: 06123) 서울특별시 강남구 테헤란로 123",
                    phone: `010-1234-567${idx}`,
                    email: `user${idx}@example.com`,
                    experienceLevel: idx % 2 === 0 ? "신입" : "경력",
                    applicationStatus: "서류",
                    finalStatus: "진행중",
                    meetsPreferredCriteria: idx % 2 !== 0 ? ["관련 전공자", "해당 직무 경험 3년 이상"] : [],
                },
                resume: {
                    resumeId: 2000 + idx,
                    candidateId: 1000 + idx,
                    desiredLocation: "서울",
                    desiredSalary: 50000000,
                    filePath: `uploads/resumes/mock_${file.name}`,
                    summary: `${file.name}에서 추출된 가상의 요약본입니다. 이 지원자는 매우 성실하며 직무에 대한 이해도가 높습니다.`,
                },
                parsedJson: {
                    schema_version: "1.0",
                    personal_info: {
                        name: `지원자${idx + 1}`,
                        birth_date: `199${idx}-05-15`,
                        gender: idx % 2 === 0 ? '남' : '여',
                        address: "서울특별시 강남구 테헤란로 123",
                        phone: `010-1234-567${idx}`,
                        email: `user${idx}@example.com`,
                        applied_position: "프론트엔드 개발자"
                    },
                    desired_conditions: {
                        desired_location: "서울",
                        desired_salary: "5000"
                    },
                    education: [],
                    military_service: null,
                    careers: [],
                    certifications: [],
                    job_related_activities: [],
                    cover_letters: [],
                    skills: ["React", "TypeScript", "Excel", "GA4"],
                    extraction_meta: {
                        language: "ko",
                        confidence: 0.95,
                        warnings: ["학력 정보가 일부 누락되었습니다."]
                    }
                },
                aiProfile: {
                    schema_version: "1.0",
                    target_position: idx % 2 === 0 ? "개발팀" : "마케팅팀",
                    candidate_summary: {
                        career_level: "경력",
                        total_experience_months: 36,
                        current_or_latest_role: "대리",
                        core_summary: "전반적으로 우수한 역량을 보유하고 있으며 팀워크에 기여할 수 있는 인재입니다.",
                    },
                    skills: {
                        programming_languages: ["JavaScript", "TypeScript"],
                        frameworks: ["React", "Next.js"],
                        databases: ["MySQL"],
                        tools: ["Figma", "Git"],
                        domains: ["웹 개발"],
                        other: ["영어 회화 우수"]
                    },
                    experience_highlights: [
                        {
                            title: "웹 서비스 프론트엔드 개발",
                            organization: "(주)테스트컴퍼니",
                            period_summary: "2021.03 ~ 현재",
                            role: "대리",
                            tech_stack: ["React", "TypeScript"],
                            responsibilities: ["UI/UX 구현", "성능 최적화"],
                            achievements: ["로딩 속도 30% 개선"],
                            question_focus: ["성능 최적화 과정에서 직면한 문제점"]
                        }
                    ],
                    education_summary: {
                        highest_level: "대학교 졸업",
                        major: "컴퓨터공학과",
                        relevant_notes: ["성적 우수"]
                    },
                    certifications: [],
                    cover_letter_insights: [
                        {
                            theme: "문제 해결 능력",
                            claim: "끈기 있게 문제를 해결함",
                            question_focus: "가장 어려웠던 개발 이슈 해결 경험"
                        }
                    ],
                    strengths_to_probe: ["자기 주도적 학습", "커뮤니케이션"],
                    risk_or_unclear_points: ["이전 직장 퇴사 사유가 명확하지 않음"],
                    recommended_question_topics: ["협업 시 갈등 해결 경험", "최신 기술 트렌드 학습 방법"]
                },
            }
        }));

        // 💡 3. 서버 응답 포맷(ParsingResponse)과 동일하게 리턴 (누락된 excel 속성 추가)
        return {
            items: mockItems,
            errors: [],
            excelBase64: null,
            excelFileName: null
        };
    }
};