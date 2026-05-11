from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_template import EmailTemplate


class EmailTemplateRepository:
    def save(self, db: AsyncSession, email_template: EmailTemplate) -> EmailTemplate:
        db.add(email_template)
        return email_template

    async def find_all(self, db: AsyncSession) -> list[EmailTemplate]:
        result = await db.scalars(
            select(EmailTemplate).order_by(EmailTemplate.id)
        )
        return result.all()

    async def find_by_id(
        self,
        db: AsyncSession,
        template_id: int,
    ) -> EmailTemplate | None:
        return await db.get(EmailTemplate, template_id)

    async def find_by_name(
        self,
        db: AsyncSession,
        name: str,
    ) -> EmailTemplate | None:
        return await db.scalar(
            select(EmailTemplate).where(EmailTemplate.name == name)
        )

    async def delete(self, db: AsyncSession, email_template: EmailTemplate) -> None:
        await db.delete(email_template)


email_template_repository = EmailTemplateRepository()
