import secrets

from app.core.exceptions import (
    BadRequestException,
    DuplicateException,
    ForbiddenException,
    NotFoundException,
)
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.repositories.user_repository import user_repository


class UserService:
    async def check_email_availability(self, db, email: str):
        user = await user_repository.get_user_by_email(db, email)

        if user:
            return {
                "available": False,
                "message": "Email is already in use.",
            }

        return {
            "available": True,
            "message": "Email is available.",
        }

    async def create_user(self, db, request, role: str):
        existing = await user_repository.get_user_by_email(db, request.user_email)
        if existing:
            raise DuplicateException("Email already exists.")

        user = User(
            user_email=request.user_email,
            pw_hash=get_password_hash(request.password),
            user_name=request.user_name,
            role=role,
        )

        user = await user_repository.create_user(db, user)
        await db.commit()
        return user

    async def register_user(self, db, request):
        if request.role == "admin":
            raise ForbiddenException("Admin signup is not allowed.")

        return await self.create_user(db, request, role=request.role)

    async def change_password(self, db, current_user, data):
        if data.current_password == data.new_password:
            raise BadRequestException(
                "The new password must be different from the current password."
            )

        if len(data.new_password) < 8:
            raise BadRequestException("Password must be at least 8 characters long.")

        if not verify_password(data.current_password, current_user.pw_hash):
            raise BadRequestException("Current password is incorrect.")

        new_hash = get_password_hash(data.new_password)
        await user_repository.update_password(db, current_user, new_hash)
        await db.commit()

        return {
            "message": "Password changed successfully.",
        }

    async def get_users(self, db, page, size, keyword):
        offset = page * size
        users, total = await user_repository.get_users(db, offset, size, keyword)

        return {
            "content": users,
            "page": page,
            "size": size,
            "totalElements": total,
            "totalPages": (total + size - 1) // size,
        }

    async def get_user_by_id(self, db, user_id):
        user = await user_repository.find_by_id(db, user_id)

        if not user:
            raise NotFoundException("User not found.")

        return user

    async def delete_user(self, db, user_id):
        user = await user_repository.find_by_id(db, user_id)

        if not user:
            raise NotFoundException("User not found.")

        await user_repository.delete_user(db, user)
        await db.commit()

        return {
            "message": "User deleted successfully.",
        }

    async def reset_password(self, db, user_email: str):
        user = await user_repository.get_user_by_email(db, user_email)

        if not user:
            raise NotFoundException("User not found.")

        temporary_password = f"Temp!{secrets.token_hex(4)}"
        new_hash = get_password_hash(temporary_password)

        await user_repository.update_password(db, user, new_hash)
        await db.commit()

        return {
            "message": "Temporary password issued successfully.",
            "temporary_password": temporary_password,
        }


user_service = UserService()
