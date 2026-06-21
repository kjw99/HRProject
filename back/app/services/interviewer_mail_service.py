import os
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.mail_delivery_log import MailDeliveryLog
from app.repositories.interviewer_invite_repository import interviewer_invite_repository
from app.repositories.interviewer_repository import interviewer_repository
from app.schemas.interviewer_invite import (
    InterviewerInviteCreateRequest,
    InterviewerInviteCreateResponse,
)
from app.services.email_template_service import email_template_service
from app.services.interviewer_invite_service import interviewer_invite_service
from app.services.mail_service import mail_service


MailTemplateVariables = dict[str, str | int | float | bool | None]


@dataclass(frozen=True)
class InterviewerMail:
    to_email: str
    subject: str
    content: str
    invite: InterviewerInviteCreateResponse


class InterviewerMailService:
    @staticmethod
    def _build_availability_url(invite_url: str) -> str:
        if "token=" not in invite_url:
            return invite_url
        token = invite_url.split("token=", 1)[1]
        base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
        return f"{base}/interviewer-availability?token={token}"

    async def get_interviewer_email(self, db: AsyncSession, interviewer_id: int) -> str:
        interviewer = await interviewer_repository.get_by_id(db, interviewer_id)
        if not interviewer:
            raise NotFoundException("Interviewer not found.")

        if not interviewer.interviewer_email:
            raise BadRequestException("Interviewer email is missing.")

        return interviewer.interviewer_email

    async def create_interviewer_mail(
        self,
        db: AsyncSession,
        interviewer_id: int,
        subject: str | None,
        content: str | None,
        template_id: int | None,
        template_variables: MailTemplateVariables | None,
        expires_in_days: int,
        created_by_user_id: int,
    ) -> InterviewerMail:
        to_email = await self.get_interviewer_email(db, interviewer_id)
        invite = await interviewer_invite_service.get_or_create_invite(
            db=db,
            data=InterviewerInviteCreateRequest(
                interviewer_id=interviewer_id,
                expires_in_days=expires_in_days,
            ),
            created_by_user_id=created_by_user_id,
        )
        subject, content = await self._resolve_mail_content(
            db=db,
            subject=subject,
            content=content,
            template_id=template_id,
            template_variables=template_variables,
            invite_url=invite.invite_url,
            interviewer_id=interviewer_id,
            interviewer_email=to_email,
        )

        return InterviewerMail(
            to_email=to_email,
            subject=self._replace_invite_url(subject, invite.invite_url),
            content=self._include_invite_url(content, invite.invite_url),
            invite=invite,
        )

    def send_interviewer_mail(
        self,
        to_email: str,
        subject: str,
        content: str,
    ) -> None:
        mail_service.send_mail(to_email, subject, content)

    async def _resolve_mail_content(
        self,
        db: AsyncSession,
        subject: str | None,
        content: str | None,
        template_id: int | None,
        template_variables: MailTemplateVariables | None,
        invite_url: str,
        interviewer_id: int,
        interviewer_email: str,
    ) -> tuple[str, str]:
        if template_id is None:
            return subject or "", content or ""

        variables = dict(template_variables or {})
        variables.setdefault("interviewer_id", interviewer_id)
        variables.setdefault("interviewer_email", interviewer_email)
        variables.setdefault("invite_url", invite_url)
        variables.setdefault("access_link", invite_url)
        variables.setdefault("availability_url", self._build_availability_url(invite_url))
        variables.setdefault("interviewer_response_url", self._build_availability_url(invite_url))

        rendered_template = await email_template_service.render_template(
            db,
            template_id=template_id,
            variables=variables,
        )
        return rendered_template.subject, rendered_template.body

    def _include_invite_url(self, text: str, invite_url: str) -> str:
        rendered_text = self._replace_invite_url(text, invite_url)
        if rendered_text != text or invite_url in rendered_text:
            return rendered_text

        return f"{rendered_text.rstrip()}\n\nInterviewer access link: {invite_url}"

    def _replace_invite_url(self, text: str, invite_url: str) -> str:
        return (
            text.replace("{invite_url}", invite_url)
            .replace("{access_link}", invite_url)
        )

    async def get_existing_invite_response(
        self,
        db: AsyncSession,
        *,
        interviewer_id: int,
        mail_log: MailDeliveryLog,
    ) -> InterviewerInviteCreateResponse:
        invite_url = self._extract_tokenized_url(mail_log.body)
        if invite_url is None:
            raise NotFoundException("Invite URL not found in the existing mail log.")

        token = self._extract_token(invite_url)
        if token is None:
            raise NotFoundException("Invite token not found in the existing mail log.")

        invite = await interviewer_invite_repository.find_by_token_hash(
            db,
            interviewer_invite_service.hash_token(token),
        )
        if invite is None:
            raise NotFoundException("Invite metadata not found for the existing mail log.")

        return InterviewerInviteCreateResponse(
            invite_id=invite.invite_id,
            interviewer_id=interviewer_id,
            expires_at=invite.expires_at,
            invite_url=invite_url,
            reused=True,
        )

    def _extract_tokenized_url(self, text: str) -> str | None:
        for chunk in text.split():
            if "token=" not in chunk:
                continue
            cleaned = chunk.strip("()[]{}<>,.;\"'")
            if self._extract_token(cleaned):
                return cleaned
        return None

    def _extract_token(self, url: str) -> str | None:
        parsed = urlparse(url)
        token_values = parse_qs(parsed.query).get("token")
        if not token_values:
            return None

        token = token_values[0].strip()
        return token or None


interviewer_mail_service = InterviewerMailService()
