from langchain_core.messages import HumanMessage, SystemMessage


SYSTEM_PROMPT = """
당신은 채용 담당자를 돕는 이력서 파싱 AI입니다.
이력서 원문에 명시된 정보만 추출하세요.
원문에 없는 값은 추측하지 말고 null 또는 빈 배열로 두세요.
한국어 이력서는 한국어 내용을 그대로 유지하세요.
반드시 제공된 structured output 스키마에 정확히 맞는 데이터만 반환하세요.
""".strip()


def build_resume_parse_messages(
    raw_text: str,
    filename: str | None = None,
) -> list[SystemMessage | HumanMessage]:
    source_name = filename or "uploaded resume"
    human_prompt = f"""
아래 이력서 원문을 세 가지 결과로 구조화하세요.

1. parsed_json
- 원본 이력서를 최대한 충실하게 구조화한 데이터입니다.
- 인적사항, 희망조건, 학력사항, 병역사항, 경력사항, 자격증,
  직무 관련 경험 및 활동, 자기소개서, 기술 스택, 추출 메타데이터를 포함하세요.
- 날짜는 일자가 있으면 YYYY-MM-DD, 연월만 있으면 YYYY-MM 형식을 우선 사용하세요.
- 종료일이 현재 재직/진행 중이면 end_date에 "present"를 사용하세요.
- 연봉이나 희망연봉은 가능하면 원화 기준 숫자 amount로 변환하세요.
- 정규화가 애매한 값은 raw 필드에 원문 표현을 함께 보존하세요.
- 원문에 없는 정보는 절대 추측하지 말고 null 또는 빈 배열로 두세요.

Career extraction rules:
- For each parsed_json.careers item, set employment_type when the resume states it.
- Set is_company_employment=true only for actual company employment records
  such as full-time, regular, or contract employment.
- Set is_company_employment=false for internships, part-time work, education,
  bootcamps, personal/team projects, portfolio projects, and training courses.
- When is_company_employment=false, write a short exclusion_reason.

2. summary
- 채용 담당자가 빠르게 읽을 수 있는 짧은 이력서 요약입니다.
- 사실 기반으로 작성하고, 채용 검토에 불필요한 민감 정보는 포함하지 마세요.

3. ai_profile
- 면접 질문 생성을 위한 후보자 역량 프로필입니다.
- 이름, 휴대폰 번호, 이메일, 주소, 생년월일, 성별, 병역 세부사항,
  연봉, 가족관계, 종교, 장애, 보훈, 외모 등 질문 생성에 불필요한
  개인정보나 민감 정보는 제외하세요.
- 지원 직무, 직무 관련 기술, 주요 경험, 담당 업무, 성과, 확인이 필요한 부분,
  면접 질문 주제에 집중하세요.
- 구체적인 성과나 본인 역할 범위가 부족하면 내용을 지어내지 말고
  확인이 필요한 부분으로 정리하세요.

파일명: {source_name}

이력서 원문:
\"\"\"
{raw_text}
\"\"\"
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
