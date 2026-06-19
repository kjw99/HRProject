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
아래 초안 면접 질문을 검토하세요.

지원 직무: {data.position_name}
이번에 검토할 질문 개수: {data.question_count}
최종 요청 질문 개수: {data.final_question_count}
추가 요청: {optional_text(data.additional_request)}

## 적합도 분석 결과
{model_to_json(analysis)}

## 초안 질문
{model_to_json(questions)}

## 이미 재사용된 질문
{model_to_json(data.reused_questions)}

검토 기준:
- 질문 개수는 반드시 {data.question_count}개와 일치해야 합니다.
- 각 질문은 직무기술서와 지원자 근거 정보에 부합해야 합니다.
- 질문은 실제 경험, 의사결정, 성과를 평가할 수 있을 만큼 구체적이어야 합니다.
- 이미 재사용된 질문과 중복되거나 매우 유사한 질문이 있으면 안 됩니다.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 포함하면 안 됩니다.
- generation_basis는 실제 근거를 적절히 반영해야 합니다.

평가 방식:
- 점수는 0점부터 100점까지 부여하세요.
- passed는 점수가 85점 이상이고 중대한 문제가 없을 때만 true로 설정하세요.
- 개선이 필요하면 어떤 문제가 있고 어떻게 수정해야 하는지 구체적으로 설명하세요.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
