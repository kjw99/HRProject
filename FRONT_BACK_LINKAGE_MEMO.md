# Front/Back Linkage Memo

## Fixed in this pass

- `POST /api/auth/signup`
  - Front: `front/lib/common/auth.ts`
  - Back: `back/app/routers/auth_router.py`
- `POST /api/admin/users/{user_email}/reset-password`
  - Front: `front/lib/common/auth.ts`
  - Back: `back/app/routers/admin_router.py`
- Question generation flow
  - Front now follows the backend job flow and waits for completion.
  - Files:
    - `front/lib/interviewer/questions.ts`
    - `front/types/interviewer.ts`
- Candidate list typing mismatch
  - Front client now treats `/api/candidates` as `Applicant[]`.
  - Files:
    - `front/lib/hr/interview.client.ts`
    - `front/app/server/hr/applicant.server.ts`
- `PATCH /api/candidates/{candidate_id}`
  - Front: `front/lib/hr/interview.client.ts`
  - Server: `front/app/server/hr/applicant.server.ts`
- `DELETE /api/candidates/{candidate_id}`
  - Front: `front/lib/hr/interview.client.ts`
  - Server: `front/app/server/hr/applicant.server.ts`
- `PATCH /api/interview-bookings/{booking_id}/cancel`
  - Front: `front/lib/hr/interview-bookings.client.ts`
  - Server: `front/app/server/hr/interview-bookings.server.ts`
- `PATCH /api/interview-booking-invitations/{invitation_id}/revoke`
  - Front: `front/lib/hr/interview-booking-invitations.client.ts`
  - Server: `front/app/server/hr/interview-booking-invitations.server.ts`
- `POST /api/interviewer-invites`
  - Front: `front/lib/hr/interviewer-invites.client.ts`
  - Server: `front/app/server/hr/interviewer-communication.server.ts`
- `POST /api/interviewer-invites/accept`
  - Front: `front/lib/hr/interviewer-invites.client.ts`
  - Server: `front/app/server/hr/interviewer-communication.server.ts`
- `POST /api/interviewers/{interviewer_id}/email`
  - Front: `front/lib/hr/interviewer-mail.client.ts`
  - Server: `front/app/server/hr/interviewer-communication.server.ts`
- Candidate mail response normalization
  - Front now accepts backend snake_case response fields from `/api/candidates/{candidate_id}/email`.
  - Files:
    - `front/lib/hr/mail.client.ts`

## Page / Component linkage notes added in this pass

- Candidate detail / invitation history
  - Page: `front/app/hr/applicants/page.tsx`
  - Components:
    - `front/components/hr/applicants/ApplicantListClient.tsx`
    - `front/components/hr/applicants/ApplicantDetailModal.tsx`
- Candidate invitation mail
  - Page: `front/app/hr/applicants/page.tsx`
  - Components:
    - `front/components/hr/applicants/ApplicantListClient.tsx`
    - `front/components/hr/applicants/CandidateMailComposerModal.tsx`
- Interview booking invitation create
  - Pages:
    - `front/app/hr/page.tsx`
    - `front/app/hr/schedule/page.tsx`
  - Components:
    - `front/components/hr/dashboard/ScheduleBookingModal.tsx`
- Invitation preview / mail send
  - Page: `front/app/invitation-preview/page.tsx`
  - Component: `front/components/hr/schedule/InvitationPreviewClient.tsx`
- Interviewer question generation
  - Pages:
    - `front/app/interviewer/page.tsx`
    - `front/app/hr/ai-gen/page.tsx`
  - Components:
    - `front/components/interviewer/agent/AgentClient.tsx`
    - `front/components/interviewer/agent/ControlPanel.tsx`
    - `front/components/interviewer/agent/ResultsPanel.tsx`
- Interviewer invite / interviewer mail
  - Existing page: `front/app/hr/interviewers/page.tsx`
  - Existing components:
    - `front/components/hr/interviewers/InterviewerClient.tsx`
    - `front/components/hr/interviewers/InterviewerFormModal.tsx`
    - `front/components/hr/interviewers/InterviewerTable.tsx`
  - Note: dedicated invite acceptance page or interviewer mail send UI is not implemented yet.

## Pages to remember

- HR dashboard: `front/app/hr/page.tsx`
- HR applicants: `front/app/hr/applicants/page.tsx`
- HR schedule: `front/app/hr/schedule/page.tsx`
- HR email templates: `front/app/hr/email-templates/page.tsx`
- Admin users: `front/app/admin/...`
- Interviewer agent page: search `AgentClient` usage from `front/app`

## Components to edit by feature

- Applicants list / actions
  - `front/components/hr/applicants/ApplicantListClient.tsx`
  - `front/components/hr/applicants/ApplicantDetailModal.tsx`
  - `front/components/hr/applicants/CandidateMailComposerModal.tsx`
- Email template management
  - `front/components/hr/email-templates/EmailTemplateManagerClient.tsx`
- Invitation preview / template apply
  - `front/components/hr/schedule/InvitationPreviewClient.tsx`
- Interview question generation UI
  - `front/components/interviewer/agent/AgentClient.tsx`
  - `front/components/interviewer/agent/ControlPanel.tsx`
  - `front/components/interviewer/agent/ResultsPanel.tsx`
- Admin user management
  - `front/components/admin/UserTable.tsx`
  - `front/components/admin/usertable/CreateUserModal.tsx`
  - `front/components/admin/usertable/UserDetailModal.tsx`
- Shared layout / navigation
  - `front/components/hr/wrapper/HrSidebar.tsx`
  - `front/app/hr/layout.tsx`
  - `front/app/globals.css`

## Remaining backend routes that still deserve front wrappers

- `back/app/routers/interview_booking_router.py`
  - missing likely front action: booking cancel
- `back/app/routers/interview_booking_invitation_router.py`
  - missing likely front action: invitation revoke
- `back/app/routers/candidate_router.py`
  - update/delete still not fully exposed in front wrappers
- `back/app/routers/hr_router.py`
  - check whether `/api/hr/dashboard/stats` and `/api/hr/users` should be used or removed
- `back/app/routers/interviewer_invite_router.py`
- `back/app/routers/interviewer_mail_router.py`
- `back/app/routers/interviewer_question_router.py`

## Good implementation order

1. Finish API wrappers in `front/lib` and `front/app/server`.
2. Connect the wrappers to the matching `page.tsx`.
3. Add or refine the visible `components`.
4. Only then polish layout/colors in shared files.
