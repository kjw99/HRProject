import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()

SYNC_DATABASE_URL = os.getenv("DATABASE_URL", "")

if SYNC_DATABASE_URL.startswith("postgresql+psycopg://"):
    ASYNC_DATABASE_URL = SYNC_DATABASE_URL.replace(
        "postgresql+psycopg://",
        "postgresql+asyncpg://",
        1,
    )
elif SYNC_DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = SYNC_DATABASE_URL.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
    )
else:
    ASYNC_DATABASE_URL = SYNC_DATABASE_URL

async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    class_=Session,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
