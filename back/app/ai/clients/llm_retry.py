import asyncio
import logging
import os
import random
from collections.abc import Awaitable, Callable
from typing import TypeVar

from app.ai.clients.llm_errors import is_rate_limit_exception


logger = logging.getLogger(__name__)
T = TypeVar("T")

DEFAULT_MAX_RETRIES = 3
DEFAULT_BASE_DELAY_SECONDS = 1.0
DEFAULT_MAX_DELAY_SECONDS = 8.0
DEFAULT_JITTER_SECONDS = 0.25


async def run_with_rate_limit_retry(
    fn: Callable[[], Awaitable[T]],
) -> T:
    max_retries = _get_int_env("LLM_RATE_LIMIT_MAX_RETRIES", DEFAULT_MAX_RETRIES)
    base_delay = _get_float_env(
        "LLM_RATE_LIMIT_BASE_DELAY_SECONDS",
        DEFAULT_BASE_DELAY_SECONDS,
    )
    max_delay = _get_float_env(
        "LLM_RATE_LIMIT_MAX_DELAY_SECONDS",
        DEFAULT_MAX_DELAY_SECONDS,
    )
    jitter = _get_float_env(
        "LLM_RATE_LIMIT_JITTER_SECONDS",
        DEFAULT_JITTER_SECONDS,
    )

    attempt = 0
    while True:
        try:
            return await fn()
        except Exception as exc:
            if not is_rate_limit_exception(exc) or attempt >= max_retries:
                raise

            delay = min(max_delay, base_delay * (2**attempt))
            if jitter > 0:
                delay += random.uniform(0, jitter)

            logger.warning(
                "OpenAI rate limit hit. Retrying in %.2fs (%d/%d).",
                delay,
                attempt + 1,
                max_retries,
            )
            await asyncio.sleep(delay)
            attempt += 1


def _get_int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default

    try:
        value = int(raw)
    except ValueError:
        return default

    return max(0, value)


def _get_float_env(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default

    try:
        value = float(raw)
    except ValueError:
        return default

    return max(0.0, value)
