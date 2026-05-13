import string

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.email_template import EmailTemplate
from app.repositories.email_template_repository import email_template_repository
from app.schemas.email_template import (
    EmailTemplateCreate,
    EmailTemplateRenderResponse,
    EmailTemplateUpdate,
)


class _SafeFormatter(string.Formatter):
    def get_value(self, key, args, kwargs):
        if isinstance(key, str):
            if key not in kwargs:
                raise KeyError(key)
            value = kwargs[key]
            return "" if value is None else value

        return super().get_value(key, args, kwargs)


class EmailTemplateService:
    def __init__(self):
        self._formatter = _SafeFormatter()

    async def create_template(
        self,
        db: AsyncSession,
        data: EmailTemplateCreate,
    ) -> EmailTemplate:
        email_template = EmailTemplate(
            name=data.name,
            subject=data.subject,
            body=data.body,
        )

        email_template_repository.save(db, email_template)
        await db.commit()
        await db.refresh(email_template)

        return email_template

    async def get_templates(self, db: AsyncSession) -> list[EmailTemplate]:
        return await email_template_repository.find_all(db)

    async def get_template(
        self,
        db: AsyncSession,
        template_id: int,
    ) -> EmailTemplate:
        email_template = await email_template_repository.find_by_id(db, template_id)
        if not email_template:
            raise NotFoundException("Email template not found.")

        return email_template

    async def update_template(
        self,
        db: AsyncSession,
        template_id: int,
        data: EmailTemplateUpdate,
    ) -> EmailTemplate:
        email_template = await self.get_template(db, template_id)

        update_data = data.model_dump(exclude_unset=True)
        for field_name, value in update_data.items():
            setattr(email_template, field_name, value)

        await db.commit()
        await db.refresh(email_template)

        return email_template

    async def delete_template(self, db: AsyncSession, template_id: int) -> None:
        email_template = await self.get_template(db, template_id)
        await email_template_repository.delete(db, email_template)
        await db.commit()

    async def render_template(
        self,
        db: AsyncSession,
        template_id: int,
        variables: dict[str, str | int | float | bool | None],
    ) -> EmailTemplateRenderResponse:
        email_template = await self.get_template(db, template_id)

        return EmailTemplateRenderResponse(
            subject=self._render_text(email_template.subject, variables),
            body=self._render_text(email_template.body, variables),
        )

    def _render_text(
        self,
        template_text: str,
        variables: dict[str, str | int | float | bool | None],
    ) -> str:
        try:
            return self._formatter.format(template_text, **variables)
        except KeyError as exc:
            raise BadRequestException(
                f"Template variable is missing: {exc.args[0]}"
            ) from exc
        except ValueError as exc:
            raise BadRequestException("Template format is invalid.") from exc


email_template_service = EmailTemplateService()
