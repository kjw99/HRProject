from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_text
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
)


def build_question_selection_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    candidate_questions: list[GeneratedQuestion],
) -> list[SystemMessage | HumanMessage]:
    question_pairs = [
        {
            "pair_number": index + 1,
            "candidate_a": candidate_questions[index * 2],
            "candidate_b": candidate_questions[index * 2 + 1],
        }
        for index in range(data.question_count)
    ]
    human_prompt = f"""
아래 후보 질문 쌍에서 최종 질문을 정확히 {data.question_count}개 선택하세요.

지원 직무: {data.position_name}
이번에 선택할 질문 개수: {data.question_count}
최종 요청 질문 개수: {data.final_question_count}
추가 요청: {optional_text(data.additional_request)}

## 적합도 분석 결과
{model_to_json(analysis)}

## 후보 질문 쌍
{model_to_json(question_pairs)}

## 이미 재사용된 질문
{model_to_json(data.reused_questions)}

선택 기준:
- 각 pair에서 반드시 1개만 선택하세요.
- 직무 관련성이 높고, 근거가 분명하며, 실무 검증에 유리한 질문을 우선하세요.
- 실제 프로젝트, 성과, 의사결정, 리스크 대응을 확인할 수 있는 질문을 우선하세요.
- 이미 재사용된 질문과 중복되거나 매우 유사한 질문은 선택하지 마세요.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 제외하세요.
- 최종 결과는 정확히 {data.question_count}개여야 합니다.
- 각 질문에는 question_text, evaluation_intent, generation_basis, question_keywords가 포함되어야 합니다.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
