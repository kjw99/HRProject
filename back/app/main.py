from fastapi import FastAPI
from app.dependencies.database import AsyncSessionLocal

from app.core.security import get_password_hash, verify_password, create_access_token
from app.repositories.user_repository import user_repository
from app.dependencies.database import async_engine, Base


from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.admin_router import router as admin_router
from app.routers.hr_router import router as hr_router
from app.models.user import User
#import app.models.user

# alembic 사용중.
# Base.metadata.create_all(bind=async_engine)

app = FastAPI()

app.include_router(auth_router)
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
async def create_admin():
    async with AsyncSessionLocal() as db:
        existing = await user_repository.get_user_by_email(db, "admin@company.com")

        if not existing:
            admin = User(
                user_email="admin@company.com",
                pw_hash=get_password_hash("admin123!"),
                user_name="Admin",
                role="admin"
            )
            await user_repository.create_user(db, admin)
            await db.commit(admin)