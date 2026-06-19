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
)


def build_question_plan_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
실제 질문을 생성하기 전에 면접 질문 구성안을 만드세요.

지원 직무:
{data.position_name}

이번에 새로 생성할 질문 개수:
{data.question_count}

최종 요청 질문 개수:
{data.final_question_count}

추가 요청:
{optional_text(data.additional_request)}

적합도 분석 결과:
{model_to_json(analysis)}

직무기술서 정보:
{optional_text(data.job_description_context)}

이력서 키워드:
{optional_list(data.resume_keywords)}

이력서 하이라이트:
{optional_list(data.resume_highlights)}

이력서 근거 정보:
{optional_text(data.resume_context)}

이미 재사용된 질문:
{model_to_json(data.reused_questions)}

작성 규칙:
- 각 항목의 count 합계는 반드시 {data.question_count}여야 합니다.
- 이미 재사용된 질문은 고정된 질문으로 간주하고, 이번에는 남은 질문만 계획하세요.
- 지원자의 실제 키워드, 하이라이트, 직무 적합도 근거를 바탕으로 구성하세요.
- 프로젝트, 성과, 문제 해결 경험을 검증할 수 있는 실무형 질문을 포함하세요.
- 분석 결과에 불명확하거나 리스크가 있는 부분이 있으면 확인 질문을 포함하세요.
- 보호 대상 개인정보나 직무와 무관한 주제는 제외하세요.
- 각 항목에는 category, count, focus가 반드시 포함되어야 합니다.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
