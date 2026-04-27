from fastapi import FastAPI
from app.routers.auth_router import router as auth_router
from app.dependencies.database import async_engine, Base
from app.routers.user_router import router as user_router
from app.routers.admin_router import router as admin_router
from app.routers.hr_router import router as hr_router
# from app.models.user import User
import app.models.user

# alembic 사용중.
# Base.metadata.create_all(bind=async_engine)

app = FastAPI()

# app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(hr_router)


@app.get("/")
def root():
    return {"message": "Server is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.on_event("startup")
async def startup():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)