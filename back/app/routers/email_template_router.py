from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.schemas.common import MessageResponse
from app.schemas.email_template import (
    EmailTemplateCreate,
    EmailTemplateRenderRequest,
    EmailTemplateRenderResponse,
    EmailTemplateResponse,
    EmailTemplateUpdate,
)
from app.services.email_template_service import email_template_service


router = APIRouter(prefix="/api/email-templates", tags=["EmailTemplate"])


@router.get("", response_model=list[EmailTemplateResponse])
async def get_email_templates(db: AsyncSession = Depends(get_async_db)):
    return await email_template_service.get_templates(db)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=EmailTemplateResponse,
)
async def create_email_template(
    data: EmailTemplateCreate,
    db: AsyncSession = Depends(get_async_db),
):
    return await email_template_service.create_template(db, data)


@router.get("/{template_id}", response_model=EmailTemplateResponse)
async def get_email_template(
    template_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    return await email_template_service.get_template(db, template_id)


@router.patch("/{template_id}", response_model=EmailTemplateResponse)
async def update_email_template(
    template_id: int,
    data: EmailTemplateUpdate,
    db: AsyncSession = Depends(get_async_db),
):
    return await email_template_service.update_template(db, template_id, data)


@router.delete("/{template_id}", response_model=MessageResponse)
async def delete_email_template(
    template_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    await email_template_service.delete_template(db, template_id)
    return {"message": "Email template deleted successfully."}


@router.post("/{template_id}/render", response_model=EmailTemplateRenderResponse)
async def render_email_template(
    template_id: int,
    data: EmailTemplateRenderRequest,
    db: AsyncSession = Depends(get_async_db),
):
    return await email_template_service.render_template(
        db,
        template_id=template_id,
        variables=data.variables,
    )
