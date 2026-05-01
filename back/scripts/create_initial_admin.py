from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import select

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env")

if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL environment variable is required.")

from app.core.security import get_password_hash
from app.dependencies.database import AsyncSessionLocal, async_engine
from app.models.user import User


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value or not value.strip():
        raise RuntimeError(f"{name} environment variable is required.")
    return value.strip()


async def admin_exists(db) -> bool:
    result = await db.execute(select(User).where(User.role == "admin").limit(1))
    return result.scalar_one_or_none() is not None


async def create_initial_admin() -> None:
    email = get_required_env("INITIAL_ADMIN_EMAIL")
    password = get_required_env("INITIAL_ADMIN_PASSWORD")
    name = get_required_env("INITIAL_ADMIN_NAME")

    if len(password) < 8:
        raise RuntimeError("INITIAL_ADMIN_PASSWORD must be at least 8 characters.")

    async with AsyncSessionLocal() as db:
        if await admin_exists(db):
            print("Admin user already exists. Skipping initial admin creation.")
            return

        result = await db.execute(select(User).where(User.user_email == email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise RuntimeError(
                "A user with INITIAL_ADMIN_EMAIL already exists, but no admin user exists."
            )

        admin = User(
            user_email=email,
            pw_hash=get_password_hash(password),
            user_name=name,
            role="admin",
        )
        db.add(admin)
        await db.commit()

    print(f"Initial admin user created: {email}")


async def main() -> None:
    try:
        await create_initial_admin()
    finally:
        await async_engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
