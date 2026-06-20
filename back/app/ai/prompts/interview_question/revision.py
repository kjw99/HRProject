from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_text
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
    QuestionReviewOutput,
)


def build_question_revision_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    questions: list[GeneratedQuestion],
    review: QuestionReviewOutput,
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
아래 검토 결과를 반영하여 초안 면접 질문을 수정하세요.

지원 직무: {data.position_name}
이번 호출에서 수정할 질문 개수: {data.question_count}
최종 요청 질문 개수: {data.final_question_count}
추가 요청: {optional_text(data.additional_request)}

## 적합도 분석 결과
{model_to_json(analysis)}

## 현재 질문
{model_to_json(questions)}

## 검토 결과
{model_to_json(review)}

## 이미 재사용된 질문
{model_to_json(data.reused_questions)}

수정 규칙:
- 결과는 정확히 {data.question_count}개의 질문이어야 합니다.
- 좋은 질문은 최대한 유지하고, 필요한 부분만 수정하세요.
- 이미 재사용된 질문과 중복되거나 매우 유사한 질문은 만들지 마세요.
- 질문은 구체적이고 근거 기반이며 직무 관련성이 높아야 합니다.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 포함하지 마세요.
- 각 항목은 question_text, evaluation_intent, generation_basis 중심으로 유지하세요.
- question_keywords는 이 단계에서 수정하지 않습니다. 후속 단계에서 별도로 매핑합니다.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
