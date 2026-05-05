from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_text
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
)


def build_question_review_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    questions: list[GeneratedQuestion],
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
아래 면접 질문 초안을 검토하세요.

지원 직무: {data.position_name}
요청 질문 개수: {data.question_count}
추가 요청: {optional_text(data.additional_request)}

## 핵심 분석 결과
{model_to_json(analysis)}

## 질문 초안
{model_to_json(questions)}

검토 기준:
- 질문 개수가 요청 개수와 정확히 일치하는가
- 각 질문이 직무기술서 또는 이력서 근거와 연결되는가
- 질문이 너무 일반적이지 않고 실제 답변을 끌어낼 만큼 구체적인가
- 동일하거나 매우 유사한 질문이 반복되지 않는가
- 평가 의도와 평가 포인트가 질문 내용과 일치하는가
- generation_basis가 실제 제공된 정보에 기반하는가
- 보호 대상 개인정보, 차별 소지가 있는 정보, 직무 무관 사적 정보를 묻지 않는가
- 면접관이 실제 면접에서 사용할 만큼 유용한가

판정 방식:
- score는 0에서 100 사이로 평가하세요.
- passed는 score가 85 이상이고 중대한 문제가 없을 때만 true로 설정하세요.
- 개선이 필요하면 issues에 질문 번호, 문제 심각도, 이유, 수정 제안을 구체적으로 작성하세요.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
