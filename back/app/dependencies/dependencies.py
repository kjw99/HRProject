from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_db
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.core.exceptions import UnauthorizedException
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")

# Authorization 헤더에서 Bearer 토큰을 자동으로 추출한다.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))

        if user_id is None:
            raise UnauthorizedException("유효하지 않은 토큰입니다.")
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("토큰이 만료되었습니다.")
    except jwt.InvalidTokenError:
        raise UnauthorizedException("유효하지 않은 토큰입니다.")

    user = user_repository.find_by_id(db, user_id)
    if not user:
        raise UnauthorizedException("사용자를 찾을 수 없습니다.")

    return user