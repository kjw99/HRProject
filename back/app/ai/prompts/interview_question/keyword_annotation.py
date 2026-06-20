from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_list
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
)


def build_question_keyword_annotation_messages(
    data: InterviewQuestionGenerationInput,
    questions: list[GeneratedQuestion],
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
아래 면접 질문마다 question_keywords를 매핑하세요.

지원 직무: {data.position_name}

## 키워드 후보
{optional_list(data.resume_keywords)}

## 질문 목록
{model_to_json(questions)}

매핑 규칙:
- question_keywords는 반드시 제공된 키워드 후보 안에서만 선택하세요.
- 새로운 키워드를 만들거나 변형하지 마세요.
- 각 질문에는 해당 질문의 생성 근거와 직접 연결되는 키워드만 넣으세요.
- 질문 하나당 1개 이상 3개 이하의 키워드만 선택하세요.
- 키워드 후보 전체를 그대로 복사하지 마세요.
- 질문 내용과 생성 근거에 직접 연결되지 않는 키워드는 넣지 마세요.
- 기존 question_text, evaluation_intent, generation_basis는 수정하지 마세요.
- 결과는 입력과 동일한 질문 개수를 유지하세요.

좋은 예시:
- 질문이 Spring Boot 기반 API 성능 개선 경험을 묻는다면 ["spring boot", "api 성능 개선"]처럼 직접 관련된 키워드만 고릅니다.
- 질문이 고객 요구사항 분석과 기술 제안 경험을 묻는다면 ["고객 요구사항 분석", "기술 제안"]처럼 질문 근거를 설명하는 키워드만 고릅니다.

나쁜 예시:
- 질문과 무관한 키워드를 넣는 경우
- 키워드 후보에 없는 새 키워드를 만들어 넣는 경우
- 모든 키워드 후보를 그대로 복사하는 경우
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
