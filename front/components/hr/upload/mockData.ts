import { ApplicantInfo } from "@/types/hr";

// 💡 실제 API가 연동되기 전까지 사용할 고품질 목업 데이터입니다.
export const MOCK_APPLICANTS: ApplicantInfo[] = [
    { id: "app_1", name: "김민지", birthDate: "1996.03.15", contact: "010-2222-3333", email: "minji.kim_data@email.com", address: "서울특별시 마포구 상암동", originalJobRole: "데이터 분석 및 머신러닝", finalEducation: "서강대학교 통계학 (2015.03~2020.02)", careerPeriod: "2020.03~2024.04", careerCompany: "인사이트랩", careerRole: "데이터 분석팀", fileType: "DOCX" },
    { id: "app_2", name: "이준호", birthDate: "1993.07.22", contact: "010-8888-9999", email: "lee.junho_dev@email.com", address: "경기도 성남시 분당구", originalJobRole: "프론트엔드 개발 (React, Next.js)", finalEducation: "한양대학교 컴퓨터소프트웨어학 (2012.03~2019.02)", careerPeriod: "2019.03~2024.01", careerCompany: "테크솔루션즈", careerRole: "웹개발팀 파트장", fileType: "PDF" },
    { id: "app_3", name: "박수진", birthDate: "1998.11.05", contact: "010-1234-5678", email: "sujin.park_be@email.com", address: "서울특별시 강남구 역삼동", originalJobRole: "백엔드 엔지니어 (Spring Boot, MSA)", finalEducation: "성균관대학교 소프트웨어학 (2017.03~2021.02)", careerPeriod: "2021.03~2024.05", careerCompany: "스타트업코리아", careerRole: "서버개발팀", fileType: "PDF" }
];