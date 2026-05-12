from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import optional_text
from app.ai.schemas.question_generation import InterviewQuestionGenerationInput


def build_fit_analysis_messages(
    data: InterviewQuestionGenerationInput,
) -> list[SystemMessage | HumanMessage]:
    additional_request = optional_text(data.additional_request)
    human_prompt = f"""
아래 지원자 이력서 정보와 직무기술서 정보를 비교하여 면접 질문 생성에 필요한 핵심 요소를 도출하세요.

지원 직무: {data.position_name}
질문 개수: {data.question_count}
추가 요청: {additional_request}

## 직무기술서 정보
{optional_text(data.job_description_context)}

## 이력서 정보
{optional_text(data.resume_context)}

분석 기준:
- 직무기술서에서 반드시 검증해야 할 핵심 요구 역량을 뽑으세요.
- 이력서에서 해당 역량과 연결되는 경험, 프로젝트, 기술, 성과 근거를 찾으세요.
- 이력서 내용이 부족하거나 애매해서 면접에서 확인해야 할 리스크를 정리하세요.
- 질문 생성 시 우선순위를 둘 주제를 구체적으로 제안하세요.
- 근거가 약한 내용을 단정하지 말고 "확인 필요" 관점으로 다루세요.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
