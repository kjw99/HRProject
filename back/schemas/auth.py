from pydantic import BaseModel, EmailStr

# 회원가입 요청
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "hr"

# 로그인 요청
class SignInRequest(BaseModel):
    email: EmailStr
    password: str

# 응답
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"