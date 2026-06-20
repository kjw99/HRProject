from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import (
    model_to_json,
    optional_list,
    optional_text,
)
from app.ai.schemas.question_generation import (
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
    QuestionPlan,
)


def build_interview_question_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis | None = None,
) -> list[SystemMessage | HumanMessage]:
    additional_request = optional_text(data.additional_request)
    analysis_text = (
        model_to_json(analysis) if analysis else "적합도 분석 결과가 없습니다."
    )
    human_prompt = f"""
아래 지원자 정보와 직무 정보를 바탕으로 면접 질문을 정확히 {data.question_count}개 생성하세요.

지원 직무: {data.position_name}
생성 모드: {data.generation_mode}
이번 호출에서 생성할 질문 개수: {data.question_count}
최종 요청 질문 개수: {data.final_question_count}
추가 요청: {additional_request}

## 적합도 분석 결과
{analysis_text}

## 직무기술서 정보
{optional_text(data.job_description_context)}

## 이력서 키워드
{optional_list(data.resume_keywords)}

## 이력서 하이라이트
{optional_list(data.resume_highlights)}

## 이력서 근거 정보
{optional_text(data.resume_context)}

## 이미 재사용된 질문
{model_to_json(data.reused_questions)}

작성 규칙:
- 지원자의 실제 키워드와 하이라이트를 근거로 사용하세요.
- 프로젝트, 성과, 문제 해결, 의사결정, 협업, 운영 경험을 구체적으로 검증하는 질문을 만드세요.
- 이미 재사용된 질문과 동일하거나 매우 유사한 질문은 만들지 마세요.
- 근거가 약한 경우에는 단정하지 말고 검증 질문 형태로 작성하세요.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 묻지 마세요.
- 각 항목에는 question_text, evaluation_intent, generation_basis만 반영된 질문 내용을 작성하세요.
- question_keywords는 이 단계에서 판단하지 않습니다. 키워드 매핑은 후속 단계에서 처리됩니다.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]


def build_question_candidate_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    question_plan: QuestionPlan | None,
    candidate_count: int,
) -> list[SystemMessage | HumanMessage]:
    additional_request = optional_text(data.additional_request)
    question_plan_text = (
        model_to_json(question_plan) if question_plan else "질문 구성안이 없습니다."
    )
    human_prompt = f"""
최종 질문을 고르기 위한 후보 질문을 정확히 {candidate_count}개 생성하세요.

지원 직무: {data.position_name}
생성 모드: {data.generation_mode}
이번 호출에서 생성할 최종 질문 개수: {data.question_count}
최종 요청 질문 개수: {data.final_question_count}
후보 질문 개수: {candidate_count}
추가 요청: {additional_request}

## 적합도 분석 결과
{model_to_json(analysis)}

## 질문 구성안
{question_plan_text}

## 직무기술서 정보
{optional_text(data.job_description_context)}

## 이력서 키워드
{optional_list(data.resume_keywords)}

## 이력서 하이라이트
{optional_list(data.resume_highlights)}

## 이력서 근거 정보
{optional_text(data.resume_context)}

## 이미 재사용된 질문
{model_to_json(data.reused_questions)}

작성 규칙:
- 질문 구성안의 category와 count를 따르세요.
- 가능한 한 서로 다른 근거와 관점을 가진 질문 후보를 만드세요.
- 키워드와 하이라이트를 사용해 일반론보다 구체적인 질문을 만드세요.
- 이미 재사용된 질문과 동일하거나 매우 유사한 질문은 만들지 마세요.
- 실제 업무, 성과, 기술 선택, 문제 해결, 리스크 대응을 검증할 수 있는 질문을 우선하세요.
- 근거가 부족하면 중립적인 확인 질문으로 작성하세요.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 묻지 마세요.
- 결과는 정확히 {candidate_count}개여야 합니다.
- 각 항목은 question_text, evaluation_intent, generation_basis 중심으로 작성하세요.
- question_keywords는 이 단계에서 생성하지 않습니다. 후속 단계에서 별도로 매핑합니다.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
