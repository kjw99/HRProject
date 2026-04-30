from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.position_router import router as position_router
from app.routers.question_router import router as question_router
from app.routers.resume_parse_router import router as resume_parse_router
from app.core.exception_handlers import register_exception_handlers


from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.admin_router import router as admin_router
from app.routers.hr_router import router as hr_router
# import app.models.user

# alembic 사용중.
# Base.metadata.create_all(bind=async_engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 주소 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 예외 핸들러 등록
register_exception_handlers(app)

routers = [
    auth_router,
    position_router,
    user_router,
    admin_router,
    hr_router,
    question_router,
    resume_parse_router,
]

# 반복문을 통해 등록
for router in routers:
    app.include_router(router)


@app.get("/")
def root():
    return {"message": "Server is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
