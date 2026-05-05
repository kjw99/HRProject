from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    async def get_user_by_email(self, db, email: str):
        result = await db.execute(select(User).where(User.user_email == email))
        return result.scalar_one_or_none()

    async def find_by_id(self, db: AsyncSession, user_id: int):
        return await db.get(User, user_id)

    def create_user(self, db: AsyncSession, user: User) -> User:
        db.add(user)
        return user


user_repository = UserRepository()
