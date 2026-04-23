from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Literal


class UserCreate(BaseModel):
    user_email: EmailStr
    password: str
    user_name: str
    role: Literal["admin", "hr", "interviewer"]


class UserResponse(BaseModel):
    user_id: int
    user_email: EmailStr
    user_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy 모델을 Pydantic으로 변환 허용


class UserLogin(BaseModel):
    user_email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
