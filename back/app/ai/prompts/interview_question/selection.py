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
아래 면접 질문 후보는 최종 질문 {data.question_count}개를 만들기 위해 각 질문 슬롯마다 A/B 후보로 생성된 것입니다.
각 pair에서 더 좋은 질문 1개를 선택하여 최종 질문을 정확히 {data.question_count}개 반환하세요.

지원 직무: {data.position_name}
최종 질문 개수: {data.question_count}
추가 요청: {optional_text(data.additional_request)}

## 핵심 분석 결과
{model_to_json(analysis)}

## 질문 후보 pair
{model_to_json(question_pairs)}

선택 기준:
- 직무기술서 요구 역량과 이력서 근거가 더 구체적으로 연결되는 질문을 선택하세요.
- 지원자의 실제 경험, 판단, 성과, 문제 해결 방식을 더 잘 끌어내는 질문을 선택하세요.
- 너무 일반적인 질문보다 맥락과 평가 포인트가 분명한 질문을 선택하세요.
- 보호 대상 개인정보, 차별 소지, 직무와 무관한 사적 정보를 묻는 질문은 선택하지 마세요.
- 전체 최종 질문 세트가 직무경험, 기술역량, 프로젝트 심화, 협업, 리스크 확인, 실무 스타일을 균형 있게 포함하도록 선택하세요.
- 같은 내용이 반복될 경우 더 구체적이고 근거가 명확한 질문을 남기세요.

반환 규칙:
- 각 pair에서 반드시 1개만 선택하세요.
- selected_questions는 정확히 {data.question_count}개여야 합니다.
- selected_questions의 각 항목은 question_text, evaluation_intent, generation_basis만 포함하세요.
- selection_reasons에는 pair별 선택 이유를 간단히 작성하세요.
- 선택한 질문의 핵심 의미를 바꾸지 마세요.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
