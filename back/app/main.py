import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.interview_booking_invitation_router import (
    router as interview_booking_invitation_router,
)
from app.routers.interview_booking_router import router as interview_booking_router
from app.routers.interview_slot_router import router as interview_slot_router
from app.routers.position_router import router as position_router
from app.routers.question_router import router as question_router
from app.routers.resume_parse_router import router as resume_parse_router
from app.routers.mail_router import router as mail_router
from app.core.exception_handlers import register_exception_handlers


from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.admin_router import router as admin_router
from app.routers.hr_router import router as hr_router

# 건우 작성
from app.routers.candidate_router import router as candidate_router
from app.routers.email_template_router import router as email_template_router
from app.routers.candidate_mail_router import router as candidate_mail_router
from app.routers.interviewer_mail_router import router as interviewer_mail_router

from app.routers.interviewer_router import router as interviewer_router
from app.routers.interviewer_invite_router import router as interviewer_invite_router
from app.routers.interviewer_question_router import (
    router as interviewer_question_router,
)

from dotenv import load_dotenv

# alembic 사용중.
# Base.metadata.create_all(bind=async_engine)

app = FastAPI()

# 예외 핸들러 등록
register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(interview_booking_invitation_router)
app.include_router(interview_booking_router)
app.include_router(interview_slot_router)
app.include_router(position_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(hr_router)
app.include_router(question_router)
app.include_router(resume_parse_router)
app.include_router(interviewer_router)
app.include_router(interviewer_invite_router)
app.include_router(interviewer_question_router)

# 건우 작성
app.include_router(candidate_router)
app.include_router(mail_router)
app.include_router(email_template_router)
app.include_router(candidate_mail_router)
app.include_router(interviewer_mail_router)

load_dotenv()

# CORS: 라우터 등록 이후 마지막에 두면(Starlette 권장) 에러 응답에도 헤더가 붙기 쉽습니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000"),    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Server is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
