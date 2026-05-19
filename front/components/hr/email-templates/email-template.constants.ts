import type { EmailTemplateFormState } from "@/types/email-template-ui";

export const EMPTY_EMAIL_TEMPLATE_FORM: EmailTemplateFormState = {
  name: "",
  subject: "",
  body: "",
};

export const EMAIL_TEMPLATE_DEFAULT_VARIABLES = {
  candidate_name: "홍길동",
  candidate_email: "hong@example.com",
  invitation_url: "https://example.com/interview-booking?token=preview",
  access_link: "https://example.com/interview-booking?token=preview",
} as const;

export const EMAIL_TEMPLATE_RECOMMENDED_KEYS = [
  "candidate_name",
  "candidate_email",
  "invitation_url",
  "access_link",
  "interviewer_name",
  "invite_url",
] as const;

/** 자동완성 dropdown에 노출되는 변수 키와 짧은 설명 */
export const EMAIL_TEMPLATE_AUTOCOMPLETE_VARIABLES: ReadonlyArray<{
  value: string;
  hint: string;
}> = [
  { value: "candidate_name", hint: "지원자 이름" },
  { value: "candidate_email", hint: "지원자 이메일" },
  { value: "invitation_url", hint: "면접 일정 선택 링크" },
  { value: "access_link", hint: "invitation_url 별칭" },
  { value: "interviewer_name", hint: "면접관 이름" },
  { value: "invite_url", hint: "면접관 초대 링크" },
  { value: "company_name", hint: "회사명 (커스텀)" },
  { value: "recruiter_name", hint: "담당자 이름 (커스텀)" },
] as const;

export const EMAIL_TEMPLATE_UI = {
  list: {
    eyebrow: "Template Library",
    title: "템플릿 목록",
    newButton: "새 템플릿",
    searchPlaceholder: "이름·제목으로 검색",
    emptyTitle: "등록된 템플릿이 없습니다",
    emptyHint: "새 템플릿을 만들어 초대 메일에 재사용하세요.",
  },
  editor: {
    eyebrow: "Editor",
    titleNew: "새 템플릿 작성",
    titleEdit: "템플릿 편집",
    nameLabel: "템플릿 이름",
    subjectLabel: "메일 제목",
    bodyLabel: "메일 본문",
    previewButton: "미리보기",
    deleteButton: "삭제",
    saveButton: "저장",
  },
  variables: {
    title: "치환 변수",
    emptyHint: "제목·본문에 {변수명} 형식을 넣으면 여기에 표시됩니다.",
    jsonLabel: "미리보기용 변수 JSON",
  },
  preview: {
    title: "렌더 결과",
    subjectLabel: "제목",
    bodyLabel: "본문",
    emptyHint: "미리보기 버튼을 누르면 변수가 적용된 결과가 표시됩니다.",
  },
} as const;

export const EMAIL_TEMPLATE_MESSAGES = {
  validationRequired: "템플릿 이름, 제목, 본문을 모두 입력해주세요.",
  created: "이메일 템플릿을 생성했습니다.",
  updated: "이메일 템플릿을 저장했습니다.",
  deleted: "이메일 템플릿을 삭제했습니다.",
  previewUpdated: "미리보기를 업데이트했습니다.",
  saveFailed: "템플릿 저장 중 오류가 발생했습니다.",
  deleteFailed: "템플릿 삭제 중 오류가 발생했습니다.",
  previewFailed: "미리보기 생성 중 오류가 발생했습니다.",
  previewSelectFirst: "먼저 저장된 템플릿을 선택하거나 생성해주세요.",
  deleteConfirm: "선택한 템플릿을 삭제할까요?",
} as const;

export const EMAIL_TEMPLATE_INPUT_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";

export const EMAIL_TEMPLATE_LABEL_CLASS =
  "grid gap-2 text-sm font-black text-slate-600";

/** "다시 보지 않기" 체크 상태를 저장하는 localStorage 키 */
export const EMAIL_TEMPLATE_GUIDE_DISMISS_KEY = "hr:email-template-guide:dismissed";

export interface EmailTemplateGuideStep {
  id: string;
  /** boxicons name (without "bx-" prefix) */
  icon: string;
  title: string;
  description: string;
  /** 코드 예시(선택) — 가독성 좋은 monospace 카드로 표시 */
  example?: string;
}

/** 모달에 노출되는 단계별 가이드 컨텐츠 */
export const EMAIL_TEMPLATE_GUIDE_STEPS: readonly EmailTemplateGuideStep[] = [
  {
    id: "create",
    icon: "edit-alt",
    title: "1. 템플릿 기본 정보 입력",
    description:
      "좌측 목록 위 '새 템플릿' 버튼으로 빈 양식을 열고, 이름 · 메일 제목 · 본문을 작성합니다. 이름은 목록에서 식별용으로만 사용돼요.",
  },
  {
    id: "variables",
    icon: "code-curly",
    title: "2. 치환 변수 삽입",
    description:
      "제목·본문에 중괄호로 변수명을 적으면 발송 직전에 실제 값으로 치환됩니다. 권장 변수는 우측 패널에 자동으로 칩으로 표시돼요.",
    example:
      "안녕하세요 {candidate_name}님,\n아래 링크에서 면접 시간을 선택해주세요.\n{invitation_url}",
  },
  {
    id: "preview",
    icon: "show",
    title: "3. 미리보기로 결과 확인",
    description:
      "우측 '미리보기용 변수 JSON'에 샘플 값을 넣고 미리보기를 눌러 실제 렌더 결과를 확인하세요. JSON 형식 오류가 있으면 즉시 알려드려요.",
  },
  {
    id: "save",
    icon: "save",
    title: "4. 저장하고 재사용",
    description:
      "저장한 템플릿은 지원자 초대(/invitation-preview)와 면접관 메일 화면에서 드롭다운으로 불러와 일괄 적용할 수 있어요.",
  },
] as const;

/** 사용자가 자주 묻는 팁 — 모달 하단에 간결 카드로 노출 */
export const EMAIL_TEMPLATE_GUIDE_TIPS: ReadonlyArray<{
  icon: string;
  label: string;
  detail: string;
}> = [
  {
    icon: "bulb",
    label: "변수 자동 인식",
    detail:
      "본문에서 사용한 모든 {변수명} 은 '치환 변수' 패널에 자동으로 칩으로 모입니다.",
  },
  {
    icon: "link-alt",
    label: "초대 URL 호환",
    detail:
      "{invitation_url} 또는 {access_link} 두 가지 키 모두 동일하게 초대 링크로 치환됩니다.",
  },
  {
    icon: "shield-alt-2",
    label: "안전한 저장",
    detail:
      "수정 도중 자리를 비워도 저장 전까지는 서버에 반영되지 않아요. 안심하고 편집하세요.",
  },
] as const;
