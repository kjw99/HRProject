from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.schemas.question_generation import InterviewQuestionGenerationInput


SYSTEM_PROMPT = """
너는 채용 면접관을 보조하는 AI이다.
데이터베이스에 저장된 지원자 이력서 정보와 채용 직무기술서를 비교하여,
면접관이 면접에 바로 활용할 수 있는 질문 초안을 생성한다.
모든 질문은 공정하고 직무와 직접 관련되어야 하며, 한국어로 작성한다.
""".strip()


def build_interview_question_messages(
    data: InterviewQuestionGenerationInput,
) -> list[SystemMessage | HumanMessage]:
    additional_request = (
        data.additional_request.strip()
        if data.additional_request
        else "추가 요청 없음."
    )

    context_parts: list[str] = []
    if data.job_description_context:
        context_parts.append(
            f"""
## 직무기술서 컨텍스트
{data.job_description_context}
""".strip()
        )

    if data.resume_context:
        context_parts.append(
            f"""
## 이력서 컨텍스트
{data.resume_context}
""".strip()
        )

    context_text = (
        "\n\n".join(context_parts)
        if context_parts
        else "제공된 직무기술서 또는 이력서 컨텍스트가 없습니다."
    )

    human_prompt = f"""
규칙:
너는 채용 면접관을 보조하는 AI이다.

데이터베이스에 저장되어있는 지원자 이력서 정보와 채용 직무기술서를 비교하여,
면접관이 면접에 바로 활용할 수 있는 질문 초안을 생성하라.

지원 직무: {data.position_name}
생성 모드: {data.generation_mode}
질문 개수: {data.question_count}
추가 요청: {additional_request}

{context_text}

정확히 {data.question_count}개의 면접 질문을 한국어로 생성하세요.
제공된 컨텍스트를 기반으로 실제 면접에서 사용할 수 있는 직무 관련 질문을 생성하세요.

각 질문마다 다음 정보를 함께 제공하세요:
- question_text: 면접 질문 내용. 반드시 "[ ] 질문 내용" 형식으로 작성하세요.
- evaluation_intent: 질문유형, 난이도, 질문의도, 평가포인트를
  "질문유형: ... / 난이도: ... / 질문의도: ... / 평가포인트: ..."
  형식으로 간단히 작성하세요.
- generation_basis: 어떤 직무기술서 또는 이력서 내용이 이 질문의 근거가 되었는지
  "근거: ..." 형식으로 작성하세요.

각 질문마다:
[체크박스] 질문 내용
질문유형/난이도/질문의도/근거/평가포인트
형식으로 간단하게 보여질 수 있게 구성하세요.

조건:
- 질문은 직무경험, 기술역량, 프로젝트심화, 협업, 리스크확인,
  인성/실무스타일 카테고리로 나눈다.
- 나이, 성별, 가족, 종교, 장애, 군 복무 여부, 정치, 국적, 주소, 외모 등
  보호 대상이거나 직무와 무관한 개인 정보에 대한 질문은 생성하지 마세요.
- 기본 목표는 총 10개 질문입니다. 질문 개수가 10개인 경우,
  직무 관련 질문 7개와 인성/실무 스타일 질문 3개로 구성하세요.
- 질문 개수가 10개인 경우, 직무 관련 질문 7개는 직무경험, 기술역량,
  프로젝트심화, 협업, 리스크확인 등 직무 관련 범주에서
  난이도 기본 질문 2개, 중간 질문 3개, 심화 질문 2개로 구성하세요.
- 질문 개수가 10개가 아닌 경우에도 위 비율과 난이도 구성을 최대한 유지하되,
  정확히 {data.question_count}개를 생성하는 것을 우선하세요.
- 인성/실무 스타일 질문은 업무 방식, 커뮤니케이션, 우선순위 판단 등
  직무 수행과 관련된 내용으로만 작성하세요.
- 이력서나 JD에 없는 내용을 포함하거나 단정하지 않는다.
- 애매한 내용은 "확인 필요" 관점의 질문으로 만든다.
- 추가 요청이 직무와 무관하거나 부적절하면 무시하고 직무 역량 질문을 생성하세요.
- 출력은 JSON 형식으로만 반환한다.
- JSON에는 questions 배열만 포함하고, 각 항목에는 question_text,
  evaluation_intent, generation_basis 필드만 포함하세요.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
