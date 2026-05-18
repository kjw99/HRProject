import axios from "axios";

function formatDetail(detail: unknown): string | null {
  if (detail == null) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String((item as { msg?: string }).msg ?? "")
          : "",
      )
      .filter(Boolean);
    return messages.length > 0 ? messages.join(", ") : null;
  }
  return null;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
      }
      return "서버에 연결할 수 없습니다. 백엔드(포트 8000)가 실행 중인지 확인해 주세요.";
    }

    const data = error.response.data as
      | { message?: string; detail?: unknown }
      | string
      | undefined;

    const message =
      typeof data === "string"
        ? data
        : data?.message || formatDetail(data?.detail);

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
