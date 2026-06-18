from typing import Any

from app.ai.clients.llm_errors import map_llm_exception
from app.ai.clients.llm_client import get_chat_model
from app.ai.graphs.interview_question.validators import normalize_questions
from app.ai.schemas.question_generation import InterviewQuestionGenerationOutput
from app.core.exceptions import ExternalServiceException
from langchain_core.messages import HumanMessage


async def invoke_structured(
    schema: type[Any],
    messages: list[Any],
    error_message: str,
) -> Any:
    try:
        llm = get_chat_model().with_structured_output(schema)
        return await llm.ainvoke(messages)
    except ExternalServiceException:
        raise
    except Exception as exc:
        raise ExternalServiceException(
            map_llm_exception(exc, error_message),
        ) from exc


async def invoke_question_output(
    messages: list[Any],
    question_count: int,
    error_message: str,
    count_error_message: str | None = None,
) -> InterviewQuestionGenerationOutput:
    result = await invoke_structured(
        schema=InterviewQuestionGenerationOutput,
        messages=messages,
        error_message=error_message,
    )

    try:
        output = InterviewQuestionGenerationOutput.model_validate(result)
        questions = normalize_questions(output.questions)
    except Exception as exc:
        raise ExternalServiceException(
            "AI가 유효하지 않은 면접 질문 형식을 반환했습니다."
        ) from exc

    # if len(questions) < question_count:
    #     raise ExternalServiceException(
    #         "AI가 요청한 개수보다 적은 면접 질문을 생성했습니다."
    #     )
    ######사비카 코드##########
    if len(questions) < question_count:
        retry_messages = [
            *messages,
            HumanMessage(
                content=(
                    f"You returned {len(questions)} questions, but exactly "
                    f"{question_count} questions are required. Return the full "
                    "list again. Do not summarize. Do not reduce the count. "
                    'Every question_text must start with "[ ]".'
                )
            ),
        ]

        retry_result = await invoke_structured(
            schema=InterviewQuestionGenerationOutput,
            messages=retry_messages,
            error_message=error_message,
        )
        retry_output = InterviewQuestionGenerationOutput.model_validate(retry_result)
        questions = normalize_questions(retry_output.questions)

    if len(questions) < question_count:
        raise ExternalServiceException(
            count_error_message
            or f"AI generated {len(questions)} questions, expected {question_count}."
        )


    return InterviewQuestionGenerationOutput(questions=questions[:question_count])
