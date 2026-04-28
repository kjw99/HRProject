from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.generators.interview_question_generator import interview_question_generator
from app.ai.schemas.question_generation import InterviewQuestionGenerationInput
from app.core.exceptions import NotFoundException
from app.models.question import Question
from app.repositories.position_repository import position_repository
from app.repositories.question_repository import question_repository
from app.schemas.question import (
    GeneratedQuestionResponse,
    QuestionGenerateRequest,
    QuestionSaveRequest,
)


POSITION_BASED_QUESTION_TYPE = "position_based"


class QuestionService:
    async def generate_position_questions(
        self,
        db: AsyncSession,
        data: QuestionGenerateRequest,
    ) -> list[GeneratedQuestionResponse]:
        position = await position_repository.find_by_id(db, data.position_id)
        if not position:
            raise NotFoundException("Position not found.")

        generation_result = await interview_question_generator.generate(
            InterviewQuestionGenerationInput(
                position_name=position.position_name,
                question_count=data.question_count,
                additional_request=data.additional_request,
            )
        )

        return [
            GeneratedQuestionResponse(
                question_text=generated_question.question_text,
                question_type=POSITION_BASED_QUESTION_TYPE,
            )
            for generated_question in generation_result.questions
        ]

    async def save_position_questions(
        self,
        db: AsyncSession,
        data: QuestionSaveRequest,
    ) -> None:
        position = await position_repository.find_by_id(db, data.position_id)
        if not position:
            raise NotFoundException("Position not found.")

        existing_questions = await question_repository.find_by_position_id(
            db,
            position.position_id,
        )
        existing_question_texts: set[str] = set()

        for existing_question in existing_questions:
            if existing_question.question_type != POSITION_BASED_QUESTION_TYPE:
                continue

            if not existing_question.question_text:
                continue

            existing_question_texts.add(existing_question.question_text.strip())

        question_texts = self._get_unique_new_question_texts(
            data,
            existing_question_texts,
        )
        if not question_texts:
            return

        questions = [
            Question(
                candidate_id=None,
                position_id=position.position_id,
                question_text=question_text,
                question_type=POSITION_BASED_QUESTION_TYPE,
            )
            for question_text in question_texts
        ]

        question_repository.save_all(db, questions)
        await db.commit()

    def _get_unique_new_question_texts(
        self,
        data: QuestionSaveRequest,
        existing_question_texts: set[str],
    ) -> list[str]:
        question_texts: list[str] = []
        seen_texts = set(existing_question_texts)

        for question in data.questions:
            if question.question_text in seen_texts:
                continue

            seen_texts.add(question.question_text)
            question_texts.append(question.question_text)

        return question_texts

    async def get_questions_by_position(
        self,
        db: AsyncSession,
        position_id: int,
    ) -> list[Question]:
        position = await position_repository.find_by_id(db, position_id)
        if not position:
            raise NotFoundException("Position not found.")

        return await question_repository.find_by_position_id(db, position_id)


question_service = QuestionService()
