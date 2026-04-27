from fastapi import FastAPI
from app.routers.auth_router import router as auth_router
from app.dependencies.database import async_engine, Base
from app.core.exception_handlers import register_exception_handlers

# alembic 사용중.
# Base.metadata.create_all(bind=async_engine)

app = FastAPI()

# 예외 핸들러 등록
register_exception_handlers(app)

app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Server is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}