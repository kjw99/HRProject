import json
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel

from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
    QuestionReviewOutput,
)


SYSTEM_PROMPT = """
당신은 채용 면접 질문을 설계하는 수석 면접관 보조 AI입니다.
모든 판단은 지원 직무, 직무기술서, 이력서 근거에 기반해야 합니다.
질문은 한국어로 작성하고, 실제 면접장에서 바로 사용할 수 있어야 합니다.
나이, 성별, 가족관계, 종교, 장애, 보훈, 주소, 외모 등 직무와 무관하거나 보호 대상이 될 수 있는 개인정보 질문은 생성하지 않습니다.
""".strip()


def build_fit_analysis_messages(
    data: InterviewQuestionGenerationInput,
) -> list[SystemMessage | HumanMessage]:
    additional_request = _optional_text(data.additional_request)
    human_prompt = f"""
아래 지원자 이력서 정보와 직무기술서 정보를 비교하여 면접 질문 생성에 필요한 핵심 요소를 도출하세요.

지원 직무: {data.position_name}
질문 개수: {data.question_count}
추가 요청: {additional_request}

## 직무기술서 정보
{_optional_text(data.job_description_context)}

## 이력서 정보
{_optional_text(data.resume_context)}

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


def build_interview_question_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis | None = None,
) -> list[SystemMessage | HumanMessage]:
    additional_request = _optional_text(data.additional_request)
    analysis_text = _model_to_json(analysis) if analysis else "분석 결과 없음."
    human_prompt = f"""
아래 분석 결과, 직무기술서, 이력서 정보를 바탕으로 면접 질문을 정확히 {data.question_count}개 생성하세요.

지원 직무: {data.position_name}
생성 모드: {data.generation_mode}
질문 개수: {data.question_count}
추가 요청: {additional_request}

## 핵심 분석 결과
{analysis_text}

## 직무기술서 정보
{_optional_text(data.job_description_context)}

## 이력서 정보
{_optional_text(data.resume_context)}

질문 작성 규칙:
- 각 질문은 반드시 "[ ] 질문 내용" 형식으로 시작하세요.
- 직무기술서 요구 역량과 이력서 근거를 함께 반영하세요.
- 질문은 직무경험, 기술역량, 프로젝트 심화, 협업, 리스크 확인, 실무 스타일을 균형 있게 포함하세요.
- 질문 개수가 10개라면 직무 관련 질문 7개, 인성/실무 스타일 질문 3개 비율을 우선하세요.
- 직무 관련 질문은 기본 2개, 중간 3개, 심화 2개 정도의 난이도 균형을 우선하세요.
- 질문 개수가 10개가 아니면 위 비율을 최대한 유지하되 정확한 개수를 우선하세요.
- 이력서나 직무기술서에 근거가 없는 내용은 단정하지 말고 확인 질문으로 작성하세요.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 질문하지 마세요.

각 항목은 다음 필드만 포함하세요:
- question_text: "[ ] 질문 내용"
- evaluation_intent: "질문유형: ... / 난이도: ... / 질문의도: ... / 평가포인트: ..."
- generation_basis: "근거: ..."
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]


def build_question_review_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    questions: list[GeneratedQuestion],
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
아래 면접 질문 초안을 검토하세요.

지원 직무: {data.position_name}
요청 질문 개수: {data.question_count}
추가 요청: {_optional_text(data.additional_request)}

## 핵심 분석 결과
{_model_to_json(analysis)}

## 질문 초안
{_model_to_json(questions)}

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


def build_question_revision_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    questions: list[GeneratedQuestion],
    review: QuestionReviewOutput,
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
리뷰 피드백을 반영하여 면접 질문을 개선하세요.
문제가 없는 질문은 최대한 유지하고, 지적된 질문만 구체적으로 수정하거나 더 적합한 질문으로 교체하세요.

지원 직무: {data.position_name}
최종 질문 개수: {data.question_count}
추가 요청: {_optional_text(data.additional_request)}

## 핵심 분석 결과
{_model_to_json(analysis)}

## 현재 질문
{_model_to_json(questions)}

## 리뷰 결과
{_model_to_json(review)}

수정 규칙:
- 최종 질문은 정확히 {data.question_count}개여야 합니다.
- 질문은 반드시 "[ ] 질문 내용" 형식을 유지하세요.
- 리뷰에서 지적한 중복, 근거 부족, 모호함, 부적절함을 해결하세요.
- 이력서나 직무기술서에 없는 내용을 단정하지 마세요.
- 보호 대상 개인정보나 직무 무관 정보는 포함하지 마세요.

각 항목은 다음 필드만 포함하세요:
- question_text
- evaluation_intent
- generation_basis
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]


def _optional_text(value: str | None) -> str:
    if not value:
        return "제공된 정보 없음."

    return value.strip() or "제공된 정보 없음."


def _model_to_json(value: Any) -> str:
    if isinstance(value, BaseModel):
        value = value.model_dump()
    elif isinstance(value, list):
        value = [
            item.model_dump() if isinstance(item, BaseModel) else item
            for item in value
        ]

    return json.dumps(value, ensure_ascii=False, indent=2, default=str)
