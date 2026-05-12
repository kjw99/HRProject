from sqlalchemy import select, func
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession


class UserRepository:
    async def get_user_by_email(self, db, email: str):
        result = await db.execute(select(User).where(User.user_email == email))
        return result.scalar_one_or_none()

    async def find_by_id(self, db: AsyncSession, user_id: int):
        return await db.get(User, user_id)

    async def create_user(self, db: AsyncSession, user: User) -> User:
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user
    

    async def get_users(self, db, offset, limit, keyword):
        query = select(User)

        if keyword:
            query = query.where(User.user_name.ilike(f"%{keyword}%"))

        total_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(total_query)

        result = await db.execute(
            query.offset(offset).limit(limit)
        )
        users = result.scalars().all()

        return users, total

    async def update_password(self, db: AsyncSession, user: User, new_hash: str) -> User:
        user.pw_hash = new_hash


    async def delete_user(self, db, user):
        await db.delete(user)



user_repository = UserRepository()
