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
    analysis_text = model_to_json(analysis) if analysis else "적합도 분석 결과가 없습니다."
    human_prompt = f"""
아래 지원자 정보와 직무 정보를 바탕으로 면접 질문을 정확히 {data.question_count}개 생성하세요.

지원 직무: {data.position_name}
생성 모드: {data.generation_mode}
이번에 새로 생성할 질문 개수: {data.question_count}
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
- 프로젝트, 성과, 의사결정, 트레이드오프, 문제 해결 경험을 구체적으로 검증하는 질문을 만드세요.
- 이미 재사용된 질문과 동일하거나 매우 유사한 질문은 만들지 마세요.
- 근거가 약한 경우에는 단정하지 말고 검증 질문 형태로 작성하세요.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 묻지 마세요.
- 각 항목에는 question_text, evaluation_intent, generation_basis, question_keywords만 포함하세요.
- question_keywords에는 해당 질문을 직접 뒷받침하는 핵심 키워드만 넣으세요.

question_keywords 작성 규칙:
- question_keywords는 반드시 제공된 resume_keywords 안에서만 선택하세요.
- 새로운 키워드를 임의로 만들지 마세요.
- question_keywords는 반드시 1개 이상 3개 이하로 작성하세요.
- 해당 질문을 직접적으로 뒷받침하는 핵심 키워드만 넣으세요.
- resume_keywords 전체를 그대로 복사하지 마세요.
- 빈 배열([])은 허용되지 않습니다.

예시 1:
question_text: "Spring Boot 기반 서비스에서 트랜잭션 처리 중 겪었던 문제와 해결 방법을 설명해 주세요."
evaluation_intent: "Spring Boot 기반 백엔드 개발 경험과 트랜잭션 처리, 문제 해결 능력을 평가합니다."
generation_basis: "이력서에 Spring Boot 기반 서비스 개발 경험과 트랜잭션 관련 업무가 언급됨."
question_keywords: ["spring boot", "transaction"]

예시 2:
question_text: "JPA를 사용할 때 성능 저하를 경험한 사례와 이를 개선한 방법을 설명해 주세요."
evaluation_intent: "JPA 사용 경험과 성능 최적화 역량을 평가합니다."
generation_basis: "이력서에 JPA 기반 개발 및 성능 개선 경험이 언급됨."
question_keywords: ["jpa", "performance"]

예시 3:
question_text: "고객 요구사항을 분석하고 기술 제안으로 연결했던 경험을 설명해 주세요."
evaluation_intent: "고객 요구사항 분석 능력과 기술 제안 역량을 평가합니다."
generation_basis: "이력서에 고객 대응 및 기술 제안 경험이 언급됨."
question_keywords: ["고객 요구사항 분석", "기술 제안"]

잘못된 예시:
question_keywords: []
question_keywords: ["java", "spring", "jpa", "mysql", "concurrency"]
question_keywords: ["지원자", "면접", "경험"]

각 질문의 question_keywords는 generation_basis와 question_text를 읽었을 때 “왜 이 질문이 나왔는지”를 설명할 수 있는 키워드여야 합니다.

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
이번에 새로 생성할 최종 질문 개수: {data.question_count}
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
- 가능하면 서로 다른 표현 또는 다른 근거 관점을 가진 질문 쌍을 만드세요.
- 키워드와 하이라이트를 활용해 일반적인 질문이 아니라 구체적인 질문을 만드세요.
- 이미 재사용된 질문과 동일하거나 매우 유사한 질문은 만들지 마세요.
- 실제 업무, 성과, 기술적 의사결정, 리스크 대응을 검증할 수 있는 질문을 우선하세요.
- 근거가 부족하면 중립적인 확인 질문으로 작성하세요.
- 보호 대상 개인정보나 직무와 무관한 사적 정보는 묻지 마세요.
- 결과는 정확히 {candidate_count}개여야 합니다.
- 각 항목에는 question_text, evaluation_intent, generation_basis, question_keywords만 포함하세요.

question_keywords 작성 규칙:
- question_keywords는 반드시 제공된 resume_keywords 안에서만 선택하세요.
- 새로운 키워드를 임의로 만들지 마세요.
- question_keywords는 반드시 1개 이상 3개 이하로 작성하세요.
- 해당 질문을 직접적으로 뒷받침하는 핵심 키워드만 넣으세요.
- resume_keywords 전체를 그대로 복사하지 마세요.
- 빈 배열([])은 허용되지 않습니다.

예시 1:
question_text: "Spring Boot 기반 서비스에서 트랜잭션 처리 중 겪었던 문제와 해결 방법을 설명해 주세요."
evaluation_intent: "Spring Boot 기반 백엔드 개발 경험과 트랜잭션 처리, 문제 해결 능력을 평가합니다."
generation_basis: "이력서에 Spring Boot 기반 서비스 개발 경험과 트랜잭션 관련 업무가 언급됨."
question_keywords: ["spring boot", "transaction"]

예시 2:
question_text: "JPA를 사용할 때 성능 저하를 경험한 사례와 이를 개선한 방법을 설명해 주세요."
evaluation_intent: "JPA 사용 경험과 성능 최적화 역량을 평가합니다."
generation_basis: "이력서에 JPA 기반 개발 및 성능 개선 경험이 언급됨."
question_keywords: ["jpa", "performance"]

예시 3:
question_text: "고객 요구사항을 분석하고 기술 제안으로 연결했던 경험을 설명해 주세요."
evaluation_intent: "고객 요구사항 분석 능력과 기술 제안 역량을 평가합니다."
generation_basis: "이력서에 고객 대응 및 기술 제안 경험이 언급됨."
question_keywords: ["고객 요구사항 분석", "기술 제안"]

잘못된 예시:
question_keywords: []
question_keywords: ["java", "spring", "jpa", "mysql", "concurrency"]
question_keywords: ["지원자", "면접", "경험"]

각 질문의 question_keywords는 generation_basis와 question_text를 읽었을 때 “왜 이 질문이 나왔는지”를 설명할 수 있는 키워드여야 합니다.


""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
