from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_async_db
from app.models.interviewer import Interviewer
from app.models.user import User
from app.repositories.interviewer_repository import interviewer_repository
from app.repositories.user_repository import user_repository
from app.core.exceptions import ForbiddenException, UnauthorizedException
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def decode_bearer_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Token expired")
    except jwt.InvalidTokenError:
        raise UnauthorizedException("Invalid token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> User:
    payload = decode_bearer_token(token)
    token_type = payload.get("token_type")
    if token_type is not None and token_type != "user_access":
        raise UnauthorizedException("Invalid user token")

    user_id_value = payload.get("sub")
    if user_id_value is None:
        raise UnauthorizedException("Invalid token")

    try:
        user_id = int(user_id_value)
    except (TypeError, ValueError):
        raise UnauthorizedException("Invalid token")

    user = await user_repository.find_by_id(db, user_id)
    if not user:
        raise UnauthorizedException("User not found")

    return user


async def get_current_interviewer(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> Interviewer:
    payload = decode_bearer_token(token)

    if payload.get("token_type") != "interviewer_access":
        raise UnauthorizedException("Invalid interviewer token")

    if payload.get("role") != "interviewer":
        raise UnauthorizedException("Invalid interviewer token")

    interviewer_id_value = payload.get("interviewer_id") or payload.get("sub")
    if interviewer_id_value is None:
        raise UnauthorizedException("Invalid interviewer token")

    try:
        interviewer_id = int(interviewer_id_value)
    except (TypeError, ValueError):
        raise UnauthorizedException("Invalid interviewer token")

    interviewer = await interviewer_repository.get_by_id(db, interviewer_id)
    if not interviewer:
        raise UnauthorizedException("Interviewer not found")

    if interviewer.position_id is None:
        raise ForbiddenException("Interviewer position is required")

    return interviewer


def require_roles(allowed_roles: tuple[str, ...]):
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException("Permission denied")

        return current_user

    return role_checker
