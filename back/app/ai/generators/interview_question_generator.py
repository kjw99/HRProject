from app.ai.clients.openai_client import get_chat_model
from app.ai.prompts.interview_question_prompt import build_interview_question_messages
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    InterviewQuestionGenerationOutput,
)
from app.core.exceptions import ExternalServiceException


class InterviewQuestionGenerator:
    async def generate(
        self,
        data: InterviewQuestionGenerationInput,
    ) -> InterviewQuestionGenerationOutput:
        try:
            llm = get_chat_model().with_structured_output(
                InterviewQuestionGenerationOutput
            )
            result = await llm.ainvoke(build_interview_question_messages(data))
        except ExternalServiceException:
            raise
        except Exception as exc:
            raise ExternalServiceException(
                "Failed to generate interview questions."
            ) from exc

        try:
            output = InterviewQuestionGenerationOutput.model_validate(result)
            questions = self._normalize_questions(output.questions)
        except Exception as exc:
            raise ExternalServiceException(
                "AI returned an invalid interview question format."
            ) from exc

        if len(questions) < data.question_count:
            raise ExternalServiceException(
                "AI generated fewer interview questions than requested."
            )

        return InterviewQuestionGenerationOutput(
            questions=questions[: data.question_count]
        )

    def _normalize_questions(
        self,
        questions: list[GeneratedQuestion],
    ) -> list[GeneratedQuestion]:
        normalized_questions: list[GeneratedQuestion] = []
        seen_texts: set[str] = set()

        for question in questions:
            question_text = question.question_text.strip()
            if not question_text or question_text in seen_texts:
                continue

            seen_texts.add(question_text)
            normalized_questions.append(
                GeneratedQuestion(question_text=question_text)
            )

        return normalized_questions


interview_question_generator = InterviewQuestionGenerator()
