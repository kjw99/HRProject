from fastapi import FastAPI
from app.routers.position_router import router as position_router
from app.routers.question_router import router as question_router
from app.routers.resume_parse_router import router as resume_parse_router
from app.core.exception_handlers import register_exception_handlers


from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.admin_router import router as admin_router
from app.routers.hr_router import router as hr_router
# 건우 작성
from app.routers.candidate_router import router as candidate_router

from app.routers.interviewer_router import router as interviewer_router

# alembic 사용중.
# Base.metadata.create_all(bind=async_engine)

app = FastAPI()

# 예외 핸들러 등록
register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(position_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(hr_router)
app.include_router(question_router)
app.include_router(resume_parse_router)
app.include_router(interviewer_router)

# 건우 작성
app.include_router(candidate_router)


@app.get("/")
def root():
    return {"message": "Server is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
