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
