import axios from "axios";

type ValidationErrorItem = {
  type?: string;
  loc?: unknown;
  msg?: string;
  message?: string;
  input?: unknown;
  ctx?: unknown;
};

function formatValidationItem(item: unknown): string {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  if (typeof item === "object") {
    const obj = item as ValidationErrorItem;
    if (typeof obj.msg === "string") return obj.msg;
    if (typeof obj.message === "string") return obj.message;
  }
  return "";
}

/** FastAPI `detail` (문자열 · 객체 · 배열) → 사용자용 문자열 */
export function formatApiDetail(detail: unknown): string | null {
  if (detail == null) return null;
  if (typeof detail === "string") return detail.trim() ? detail : null;
  if (Array.isArray(detail)) {
    const messages = detail.map(formatValidationItem).filter(Boolean);
    return messages.length > 0 ? messages.join(", ") : null;
  }
  if (typeof detail === "object") {
    const single = formatValidationItem(detail);
    return single || null;
  }
  return null;
}

/** toast 등에 넣기 전 unknown → 항상 문자열 */
export function coerceToErrorString(
  value: unknown,
  fallback = "오류가 발생했습니다.",
): string {
  if (typeof value === "string" && value.trim()) return value;
  const fromDetail = formatApiDetail(value);
  if (fromDetail) return fromDetail;
  if (value instanceof Error && value.message) return value.message;
  return fallback;
}

function extractMessageFromResponseData(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") return data.trim() ? data : null;
  if (typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  if (obj.message != null) {
    const fromMessage = coerceToErrorString(obj.message, "");
    if (fromMessage) return fromMessage;
  }

  if (obj.detail != null) {
    const fromDetail = formatApiDetail(obj.detail);
    if (fromDetail) return fromDetail;
  }

  return formatApiDetail(data);
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
      }
      return "서버에 연결할 수 없습니다. 백엔드(포트 8000)가 실행 중인지 확인해 주세요.";
    }

    const message = extractMessageFromResponseData(error.response.data);
    if (message) return message;

    if (error.response.status === 401) {
      return "로그인이 필요합니다. 다시 로그인해 주세요.";
    }
    if (error.response.status === 403) {
      return "이 작업을 수행할 권한이 없습니다.";
    }
    if (error.response.status === 404) {
      return "요청한 API를 찾을 수 없습니다. 백엔드를 최신 코드로 재시작했는지 확인해 주세요.";
    }
    if (error.response.status >= 500) {
      return "서버 오류가 발생했습니다. DB 마이그레이션 적용 후 백엔드를 재시작해 주세요.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
