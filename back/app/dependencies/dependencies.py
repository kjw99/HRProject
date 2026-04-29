from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_async_db
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.core.exceptions import ForbiddenException, UnauthorizedException
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Authorization 헤더에서 Bearer 토큰을 자동으로 추출한다.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_value = payload.get("sub")

        if user_id_value is None:
            raise UnauthorizedException("유효하지 않은 토큰입니다.")

        user_id = int(user_id_value)
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("토큰이 만료되었습니다.")
    except jwt.InvalidTokenError:
        raise UnauthorizedException("유효하지 않은 토큰입니다.")
    except (TypeError, ValueError):
        raise UnauthorizedException("유효하지 않은 토큰입니다.")

    user = await user_repository.find_by_id(db, user_id)
    if not user:
        raise UnauthorizedException("사용자를 찾을 수 없습니다.")

    return user


def require_roles(allowed_roles: tuple[str, ...]):
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException("해당 작업을 수행할 권한이 없습니다.")

        return current_user

    return role_checker
