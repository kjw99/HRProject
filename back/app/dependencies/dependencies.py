import json
import os
from urllib.parse import unquote

import jwt
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.dependencies.database import get_async_db
from app.models.interviewer import Interviewer
from app.models.user import User
from app.repositories.interviewer_repository import interviewer_repository
from app.repositories.user_repository import user_repository


def _get_secret_key() -> str | None:
    return os.getenv("JWT_SECRET_KEY")


def _get_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def _extract_token_from_auth_storage_cookie(request: Request) -> str | None:
    raw = request.cookies.get("auth-storage")
    if not raw:
        return None

    candidates = [raw]
    try:
        candidates.append(unquote(raw))
    except Exception:
        pass

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            token = parsed.get("state", {}).get("token")
            if isinstance(token, str) and token.strip():
                return token.strip()
        except Exception:
            continue

    return None


def _resolve_access_token(request: Request, token: str | None) -> str:
    if token and token.strip():
        return token.strip()

    cookie_token = _extract_token_from_auth_storage_cookie(request)
    if cookie_token:
        return cookie_token

    raise UnauthorizedException("Not authenticated")


def decode_bearer_token(token: str) -> dict:
    secret_key = _get_secret_key()
    algorithm = _get_algorithm()
    if not secret_key:
        raise UnauthorizedException(
            "서버에 JWT_SECRET_KEY가 설정되어 있지 않습니다. 백엔드 .env를 확인해 주세요.",
        )
    try:
        return jwt.decode(token, secret_key, algorithms=[algorithm])
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Token expired")
    except jwt.InvalidTokenError:
        raise UnauthorizedException("Invalid token")
    except (TypeError, ValueError) as exc:
        raise UnauthorizedException("Invalid token configuration") from exc


async def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> User:
    payload = decode_bearer_token(_resolve_access_token(request, token))
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
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> Interviewer:
    payload = decode_bearer_token(_resolve_access_token(request, token))

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
