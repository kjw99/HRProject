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


question_repository = QuestionRepository()
