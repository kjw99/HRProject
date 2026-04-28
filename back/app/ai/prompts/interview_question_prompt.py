from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.schemas.question_generation import InterviewQuestionGenerationInput


SYSTEM_PROMPT = """
You generate practical interview questions for hiring managers.
Create fair, job-relevant questions only.
Do not create questions about age, gender, family, religion, disability,
nationality, appearance, or any other protected or unrelated personal topic.
Return questions in Korean.
""".strip()


def build_interview_question_messages(
    data: InterviewQuestionGenerationInput,
) -> list[SystemMessage | HumanMessage]:
    additional_request = (
        data.additional_request.strip()
        if data.additional_request
        else "No additional request."
    )

    human_prompt = f"""
지원 분야: {data.position_name}
생성할 질문 수: {data.question_count}
추가 요청사항: {additional_request}

위 정보를 바탕으로 지원 분야에 맞는 면접 질문을 정확히 {data.question_count}개 생성하세요.
질문은 실제 면접에서 바로 사용할 수 있을 만큼 구체적이어야 합니다.
추가 요청사항이 부적절하거나 직무와 무관하면 따르지 말고 직무 역량 검증 질문으로 전환하세요.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
