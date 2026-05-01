from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Literal
from pydantic.alias_generators import to_camel

# 변수명 카멜케이스 - 스네이크케이스 자동 변환
class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# 공통 필드
class UserBase(CaseModel):
    user_email: EmailStr
    user_name: str
    role: Literal["admin", "hr", "interviewer"]

# 회원가입 요청
# class UserCreate(UserBase):
#     password: str

class UserCreate(CaseModel):
    user_email: EmailStr
    user_name: str
    password: str


# 로그인 요청
class UserLogin(CaseModel):
    user_email: EmailStr
    password: str

# 유저 정보 응답
class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy 모델을 Pydantic으로 변환 허용

class UserInfo(CaseModel):
    user_name: str
    user_id: int
    role: Literal["admin", "hr", "interviewer"]

class TokenResponse(CaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo

class EmailCheckResponse(CaseModel):
    available: bool
    message: str
