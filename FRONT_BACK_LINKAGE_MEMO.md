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
- Applicant edit / delete UI
  - Components:
    - `front/components/hr/applicants/ApplicantEditModal.tsx`
    - `front/components/hr/applicants/ApplicantDeleteConfirmModal.tsx`
  - Connected page:
    - `front/app/hr/applicants/page.tsx`
    - `front/components/hr/applicants/ApplicantListClient.tsx`
- Interviewer communication page
  - Page:
    - `front/app/hr/interviewers/communication/page.tsx`
  - Components:
    - `front/components/hr/interviewers/InterviewerCommunicationClient.tsx`
    - `front/components/hr/interviewers/InterviewerInviteModal.tsx`
    - `front/components/hr/interviewers/InterviewerMailComposerModal.tsx`
- Interviewer invite accept page
  - Page:
    - `front/app/interviewer/invite/page.tsx`
  - Components:
    - `front/components/interviewer/invite/InterviewerInviteAcceptClient.tsx`
    - `front/components/interviewer/invite/InviteAcceptResultCard.tsx`
- Admin home separation
  - Component:
    - `front/components/admin/AdminHomeOverview.tsx`
  - Connected page:
    - `front/app/admin/page.tsx`
- Applicant detail modal action upgrade
  - Detail modal now supports:
    - applicant edit
    - applicant delete
    - invitation revoke
    - active interview booking cancel
  - Files:
    - `front/components/hr/applicants/ApplicantDetailModal.tsx`
    - `front/components/hr/applicants/ApplicantDetailActionBar.tsx`
    - `front/types/applicant.ts`
    - `back/app/schemas/candidate.py`
    - `back/app/services/candidate_service.py`
    - `back/app/repositories/interview_booking_repository.py`

## Design upgrade note

- Separate memo created:
  - `FRONTEND_DESIGN_UPGRADE_NOTES.md`

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

## 아직 구현이 안 된 page / components 정리

### 1. 면접 예약 취소 UI

- 관련 백엔드 API
  - `PATCH /api/interview-bookings/{booking_id}/cancel`
- 프론트 래퍼 상태
  - 구현 완료
  - `front/lib/hr/interview-bookings.client.ts`
  - `front/app/server/hr/interview-bookings.server.ts`
- 아직 없는 화면
  - 예약된 면접을 직접 취소하는 버튼/액션 UI가 아직 없음
- 붙이기 좋은 page
  - `front/app/hr/schedule/page.tsx`
  - `front/app/hr/applicants/page.tsx`
- 붙이기 좋은 components
  - `front/components/hr/schedule/ScheduleSlotDetailModal.tsx`
  - `front/components/hr/dashboard/ScheduleBookingModal.tsx`
  - `front/components/hr/applicants/ApplicantDetailModal.tsx`
- 추천 한글 작업명
  - "면접 예약 취소 버튼"
  - "예약 취소 확인 모달"

### 2. 면접 초대 링크 회수 UI

- 관련 백엔드 API
  - `PATCH /api/interview-booking-invitations/{invitation_id}/revoke`
- 프론트 래퍼 상태
  - 구현 완료
  - `front/lib/hr/interview-booking-invitations.client.ts`
  - `front/app/server/hr/interview-booking-invitations.server.ts`
- 아직 없는 화면
  - 생성된 초대 링크를 회수하는 버튼/상태 갱신 UI가 아직 없음
- 붙이기 좋은 page
  - `front/app/hr/applicants/page.tsx`
  - `front/app/hr/schedule/page.tsx`
- 붙이기 좋은 components
  - `front/components/hr/applicants/ApplicantDetailModal.tsx`
  - `front/components/hr/schedule/InvitationPreviewClient.tsx`
  - `front/components/hr/dashboard/ScheduleBookingModal.tsx`
- 추천 한글 작업명
  - "초대 링크 회수"
  - "초대 상태 갱신"

### 3. 지원자 정보 수정 UI

- 관련 백엔드 API
  - `PATCH /api/candidates/{candidate_id}`
- 프론트 래퍼 상태
  - 구현 완료
  - `front/lib/hr/interview.client.ts`
  - `front/app/server/hr/applicant.server.ts`
- 아직 없는 화면
  - 지원자 기본 정보 수정 폼이 아직 없음
- 붙이기 좋은 page
  - `front/app/hr/applicants/page.tsx`
- 붙이기 좋은 components
  - `front/components/hr/applicants/ApplicantDetailModal.tsx`
  - 새로 만들 후보:
    - `front/components/hr/applicants/ApplicantEditModal.tsx`
- 추천 한글 작업명
  - "지원자 정보 수정"
  - "지원자 수정 모달"

### 4. 지원자 삭제 UI

- 관련 백엔드 API
  - `DELETE /api/candidates/{candidate_id}`
- 프론트 래퍼 상태
  - 구현 완료
  - `front/lib/hr/interview.client.ts`
  - `front/app/server/hr/applicant.server.ts`
- 아직 없는 화면
  - 지원자 삭제 버튼과 삭제 확인 모달이 아직 없음
- 붙이기 좋은 page
  - `front/app/hr/applicants/page.tsx`
- 붙이기 좋은 components
  - `front/components/hr/applicants/ApplicantListClient.tsx`
  - `front/components/hr/applicants/ApplicantDetailModal.tsx`
  - 새로 만들 후보:
    - `front/components/hr/applicants/ApplicantDeleteConfirmModal.tsx`
- 추천 한글 작업명
  - "지원자 삭제"
  - "삭제 확인 모달"

### 5. 면접관 초대 발송 UI

- 관련 백엔드 API
  - `POST /api/interviewer-invites`
- 프론트 래퍼 상태
  - 구현 완료
  - `front/lib/hr/interviewer-invites.client.ts`
  - `front/app/server/hr/interviewer-communication.server.ts`
- 아직 없는 화면
  - 면접관 초대 링크를 생성하는 전용 버튼/폼이 아직 없음
- 붙이기 좋은 page
  - `front/app/hr/interviewers/page.tsx`
- 붙이기 좋은 components
  - `front/components/hr/interviewers/InterviewerClient.tsx`
  - `front/components/hr/interviewers/InterviewerFormModal.tsx`
  - 새로 만들 후보:
    - `front/components/hr/interviewers/InterviewerInviteModal.tsx`
- 추천 한글 작업명
  - "면접관 초대 링크 생성"
  - "면접관 초대 모달"

### 6. 면접관 초대 수락 페이지

- 관련 백엔드 API
  - `POST /api/interviewer-invites/accept`
- 프론트 래퍼 상태
  - 구현 완료
  - `front/lib/hr/interviewer-invites.client.ts`
  - `front/app/server/hr/interviewer-communication.server.ts`
- 아직 없는 화면
  - 이메일 링크로 진입한 면접관이 토큰을 수락하는 페이지가 아직 없음
- 새로 만들 page 후보
  - `front/app/interviewer/invite/page.tsx`
  - 또는 `front/app/interviewer/accept/page.tsx`
- 새로 만들 components 후보
  - `front/components/interviewer/invite/InterviewerInviteAcceptClient.tsx`
  - `front/components/interviewer/invite/InviteAcceptResultCard.tsx`
- 추천 한글 작업명
  - "면접관 초대 수락 페이지"
  - "초대 토큰 확인 화면"

### 7. 면접관 메일 발송 UI

- 관련 백엔드 API
  - `POST /api/interviewers/{interviewer_id}/email`
- 프론트 래퍼 상태
  - 구현 완료
  - `front/lib/hr/interviewer-mail.client.ts`
  - `front/app/server/hr/interviewer-communication.server.ts`
- 아직 없는 화면
  - 선택한 면접관에게 메일을 발송하는 UI가 아직 없음
- 붙이기 좋은 page
  - `front/app/hr/interviewers/page.tsx`
- 붙이기 좋은 components
  - `front/components/hr/interviewers/InterviewerTable.tsx`
  - `front/components/hr/interviewers/InterviewerClient.tsx`
  - 새로 만들 후보:
    - `front/components/hr/interviewers/InterviewerMailComposerModal.tsx`
- 추천 한글 작업명
  - "면접관 메일 보내기"
  - "면접관 메일 작성 모달"

### 8. HR 대시보드 통계 API 실제 연결 여부 점검

- 관련 백엔드 API
  - `GET /api/hr/dashboard/stats`
- 현재 상태
  - 대시보드는 아직 이 API를 직접 쓰지 않고 화면 내 계산/목업 값이 섞여 있음
- 관련 page
  - `front/app/hr/page.tsx`
- 관련 components
  - `front/components/hr/dashboard/SummaryQuadrants.tsx`
  - `front/components/hr/dashboard/Q3TodayInterviews.tsx`
- 메모
  - 새 페이지를 만드는 작업은 아니고, 기존 대시보드 카드 데이터를 실제 백엔드 응답으로 치환하는 작업에 가까움
- 추천 한글 작업명
  - "대시보드 통계 실데이터 연결"

### 9. HR 사용자 생성 API 사용처 정리

- 관련 백엔드 API
  - `POST /api/hr/users`
- 현재 상태
  - `/api/interviewers` 생성 API와 역할이 겹쳐 보임
  - 실제로 어느 화면에서 이 API를 써야 하는지 아직 확정되지 않음
- 관련 page 후보
  - `front/app/hr/interviewers/page.tsx`
- 관련 components 후보
  - `front/components/hr/interviewers/InterviewerFormModal.tsx`
- 메모
  - 새 컴포넌트를 만들기 전에 `/api/interviewers`와 `/api/hr/users` 중 어떤 흐름을 표준으로 쓸지 먼저 정리하는 것이 안전함
- 추천 한글 작업명
  - "면접관 생성 API 정리"
  - "HR 사용자 생성 경로 정리"

## Good implementation order

1. Finish API wrappers in `front/lib` and `front/app/server`.
2. Connect the wrappers to the matching `page.tsx`.
3. Add or refine the visible `components`.
4. Only then polish layout/colors in shared files.
