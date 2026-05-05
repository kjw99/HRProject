from typing import Any

from app.ai.clients.openai_client import get_chat_model
from app.ai.graphs.interview_question.validators import normalize_questions
from app.ai.schemas.question_generation import InterviewQuestionGenerationOutput
from app.core.exceptions import ExternalServiceException


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
        raise ExternalServiceException(error_message) from exc


async def invoke_question_output(
    messages: list[Any],
    question_count: int,
    error_message: str,
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
            "AI returned an invalid interview question format."
        ) from exc

    if len(questions) < question_count:
        raise ExternalServiceException(
            "AI generated fewer interview questions than requested."
        )

    return InterviewQuestionGenerationOutput(questions=questions[:question_count])
