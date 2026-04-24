from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Literal

# 공통 필드
class UserBase(BaseModel):
    user_email: EmailStr
    user_name: str
    role: Literal["admin", "hr", "interviewer"]

# 회원가입 요청
class UserCreate(UserBase):
    password: str

# 로그인 요청
class UserLogin(BaseModel):
    user_email: EmailStr
    password: str

# 유저 정보 응답
class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy 모델을 Pydantic으로 변환 허용

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_id: int
    role: Literal["admin", "hr", "interviewer"]
