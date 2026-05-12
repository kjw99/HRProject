from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.question import Question


class QuestionRepository:
    def save_all(
        self,
        db: AsyncSession,
        questions: list[Question],
    ) -> list[Question]:
        db.add_all(questions)
        return questions

    async def find_all(self, db: AsyncSession) -> list[Question]:
        result = await db.scalars(
            select(Question).order_by(Question.question_id)
        )
        return result.all()

    async def find_by_id(
        self,
        db: AsyncSession,
        question_id: int,
    ) -> Question | None:
        return await db.get(Question, question_id)

    async def find_by_position_id(
        self,
        db: AsyncSession,
        position_id: int,
    ) -> list[Question]:
        result = await db.scalars(
            select(Question)
            .where(Question.position_id == position_id)
            .order_by(Question.question_id)
        )
        return result.all()

    async def find_by_candidate_id(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> list[Question]:
        result = await db.scalars(
            select(Question)
            .where(Question.candidate_id == candidate_id)
            .order_by(Question.question_id)
        )
        return result.all()

    async def find_by_target(
        self,
        db: AsyncSession,
        position_id: int | None = None,
        candidate_id: int | None = None,
    ) -> list[Question]:
        query = select(Question)

        if position_id is not None:
            query = query.where(Question.position_id == position_id)

        if candidate_id is not None:
            query = query.where(Question.candidate_id == candidate_id)

        result = await db.scalars(query.order_by(Question.question_id))
        return result.all()

    async def delete(self, db: AsyncSession, question: Question) -> None:
        await db.delete(question)


question_repository = QuestionRepository()
