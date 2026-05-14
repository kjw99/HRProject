from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.repositories.candidate_repository import candidate_repository
from app.schemas.interview_booking_invitation import (
    InterviewBookingInvitationCreateResponse,
)
from app.services.interview_booking_invitation_service import (
    interview_booking_invitation_service,
)
from app.services.email_template_service import email_template_service
from app.services.mail_service import mail_service


MailTemplateVariables = dict[str, str | int | float | bool | None]


@dataclass(frozen=True)
class CandidateMail:
    to_email: str
    subject: str
    content: str
    invitation: InterviewBookingInvitationCreateResponse


class CandidateMailService:
    async def get_candidate_email(self, db: AsyncSession, candidate_id: int) -> str:
        candidate = await candidate_repository.find_by_id(db, candidate_id)
        if not candidate:
            raise NotFoundException("Candidate not found.")

        if not candidate.email:
            raise BadRequestException("Candidate email is missing.")

        return candidate.email

    async def create_candidate_mail(
        self,
        db: AsyncSession,
        candidate_id: int,
        subject: str | None,
        content: str | None,
        template_id: int | None = None,
        template_variables: MailTemplateVariables | None = None,
        expires_at: datetime | None = None,
    ) -> CandidateMail:
        to_email = await self.get_candidate_email(db, candidate_id)
        invitation = await interview_booking_invitation_service.create_invitation(
            db,
            candidate_id=candidate_id,
            expires_at=expires_at,
        )
        subject, content = await self._resolve_mail_content(
            db=db,
            subject=subject,
            content=content,
            template_id=template_id,
            template_variables=template_variables,
            invitation_url=invitation.invitation_url,
            candidate_id=candidate_id,
            candidate_email=to_email,
        )

        return CandidateMail(
            to_email=to_email,
            subject=self._replace_invitation_url(subject, invitation.invitation_url),
            content=self._include_invitation_url(content, invitation.invitation_url),
            invitation=invitation,
        )

    def send_candidate_mail(
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
        invitation_url: str,
        candidate_id: int,
        candidate_email: str,
    ) -> tuple[str, str]:
        if template_id is None:
            return subject or "", content or ""

        variables = dict(template_variables or {})
        variables.setdefault("candidate_id", candidate_id)
        variables.setdefault("candidate_email", candidate_email)
        variables.setdefault("invitation_url", invitation_url)
        variables.setdefault("access_link", invitation_url)

        rendered_template = await email_template_service.render_template(
            db,
            template_id=template_id,
            variables=variables,
        )
        return rendered_template.subject, rendered_template.body

    def _include_invitation_url(self, text: str, invitation_url: str) -> str:
        rendered_text = self._replace_invitation_url(text, invitation_url)
        if rendered_text != text or invitation_url in rendered_text:
            return rendered_text

        return f"{rendered_text.rstrip()}\n\nInterview booking link: {invitation_url}"

    def _replace_invitation_url(self, text: str, invitation_url: str) -> str:
        return (
            text.replace("{invitation_url}", invitation_url)
            .replace("{access_link}", invitation_url)
        )


candidate_mail_service = CandidateMailService()
