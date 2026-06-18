import logging
import re

from app.ai.clients.llm_client import get_llm_provider, get_llm_provider_display_name

logger = logging.getLogger(__name__)


def map_llm_exception(exc: Exception, fallback: str) -> str:
    message = str(exc).lower()
    error_type = _extract_error_type(exc)
    provider_label = _get_provider_label()

    if (
        "insufficient_quota" in message
        or "exceeded your current quota" in message
        or error_type == "insufficient_quota"
    ):
        return (
            f"{provider_label} API 사용 한도를 초과했습니다. "
            f"{provider_label} 콘솔의 결제 및 사용량을 확인해 주세요."
        )

    if "rate_limit" in message or error_type == "rate_limit_exceeded":
        return (
            f"{provider_label} API 요청이 너무 많습니다. "
            "잠시 후 다시 시도해 주세요."
        )

    if (
        "invalid_api_key" in message
        or "incorrect api key" in message
        or "authentication" in message
        or error_type == "invalid_api_key"
    ):
        api_key_env = "OPENAI_API_KEY" if get_llm_provider() == "openai" else "GEMINI_API_KEY"
        return (
            f"{provider_label} API 키가 올바르지 않습니다. "
            f"백엔드 .env의 {api_key_env}를 확인해 주세요."
        )

    model_match = re.search(r"model [`']([^`']+)[`']", message)
    if "model" in message and ("not found" in message or "does not exist" in message):
        model_name = model_match.group(1) if model_match else "설정한 모델"
        return (
            f"{provider_label} 모델({model_name})을 사용할 수 없습니다. "
            "LLM_MODEL 환경 변수를 지원 모델로 설정해 주세요."
        )

    if "connection" in message or "timeout" in message:
        return (
            f"{provider_label} API에 연결하지 못했습니다. "
            "네트워크 또는 API 상태를 확인해 주세요."
        )

    logger.warning("LLM call failed: %s", exc, exc_info=True)
    return fallback


def is_rate_limit_exception(exc: Exception) -> bool:
    message = str(exc).lower()
    error_type = _extract_error_type(exc)
    status_code = _extract_status_code(exc)
    return (
        "rate_limit" in message
        or error_type == "rate_limit_exceeded"
        or status_code == 429
    )


def _extract_error_type(exc: Exception) -> str | None:
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        error = body.get("error")
        if isinstance(error, dict):
            code = error.get("code") or error.get("type")
            if isinstance(code, str):
                return code.lower()

    response = getattr(exc, "response", None)
    if response is not None:
        try:
            payload = response.json()
            error = payload.get("error") if isinstance(payload, dict) else None
            if isinstance(error, dict):
                code = error.get("code") or error.get("type")
                if isinstance(code, str):
                    return code.lower()
        except Exception:
            pass

    return None


def _extract_status_code(exc: Exception) -> int | None:
    status_code = getattr(exc, "status_code", None)
    if isinstance(status_code, int):
        return status_code

    response = getattr(exc, "response", None)
    if response is not None:
        response_status = getattr(response, "status_code", None)
        if isinstance(response_status, int):
            return response_status

    return None


def _get_provider_label() -> str:
    try:
        return get_llm_provider_display_name()
    except Exception:
        return "LLM"
