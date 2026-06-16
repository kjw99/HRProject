from __future__ import annotations

import re
from typing import Any


MAX_SKILLS = 12
MAX_EXPERIENCES = 10
MAX_HIGHLIGHTS = 5
MAX_HIGHLIGHT_LENGTH = 160

SKILL_ALIASES = {
    "java": "java",
    "python": "python",
    "javascript": "javascript",
    "typescript": "typescript",
    "kotlin": "kotlin",
    "spring": "spring",
    "springboot": "spring boot",
    "spring boot": "spring boot",
    "jpa": "jpa",
    "hibernate": "hibernate",
    "mysql": "mysql",
    "mariadb": "mariadb",
    "postgresql": "postgresql",
    "postgres": "postgresql",
    "oracle": "oracle",
    "redis": "redis",
    "mongodb": "mongodb",
    "kafka": "kafka",
    "rabbitmq": "rabbitmq",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "aws": "aws",
    "gcp": "gcp",
    "azure": "azure",
    "git": "git",
    "jenkins": "jenkins",
    "linux": "linux",
    "rest api": "rest api",
    "restful api": "rest api",
}

EXPERIENCE_KEYWORD_PATTERNS = {
    "rest api": ("rest api", "restful", "api"),
    "concurrency": ("concurrency", "동시성", "race condition", "lock"),
    "performance": ("performance", "성능", "optimization", "최적화", "latency"),
    "msa": ("msa", "microservice", "micro-service"),
    "db tuning": ("query tuning", "db tuning", "n+1", "index", "쿼리 튜닝"),
    "testing": ("test", "testing", "junit", "pytest", "qa"),
    "ci/cd": ("ci/cd", "cicd", "pipeline", "github actions", "jenkins"),
    "deployment": ("deploy", "deployment", "배포"),
    "messaging": ("kafka", "rabbitmq", "message queue", "event"),
    "authentication": ("oauth", "jwt", "인증", "인가", "auth"),
}


class QuestionKeywordService:
    def build_keywords(
        self,
        parsed_json: Any,
        summary: str | None,
        ai_profile: Any,
    ) -> dict[str, list[str]]:
        skills = self._extract_skills(parsed_json, ai_profile)
        experiences = self._extract_experiences(parsed_json, summary, ai_profile)
        highlights = self._extract_highlights(parsed_json, summary, ai_profile)
        return {
            "skills": skills[:MAX_SKILLS],
            "experiences": experiences[:MAX_EXPERIENCES],
            "highlights": highlights[:MAX_HIGHLIGHTS],
        }

    def flatten_keywords(self, keywords: dict[str, Any] | None) -> list[str]:
        if not keywords:
            return []

        values: list[str] = []
        for key in ("skills", "experiences"):
            for item in keywords.get(key, []) or []:
                normalized = self._clean_text(item)
                if normalized:
                    values.append(normalized)

        return self._dedupe(values)

    def _extract_skills(self, parsed_json: Any, ai_profile: Any) -> list[str]:
        candidates: list[str] = []

        parsed_skills = self._get(parsed_json, "skills", default=[])
        candidates.extend(self._string_list(parsed_skills))

        ai_skills = self._get(ai_profile, "skills")
        for field_name in (
            "programming_languages",
            "frameworks",
            "databases",
            "tools",
            "other",
        ):
            candidates.extend(
                self._string_list(self._get(ai_skills, field_name, default=[]))
            )

        for highlight in self._get(ai_profile, "experience_highlights", default=[]):
            candidates.extend(self._string_list(self._get(highlight, "tech_stack", default=[])))

        normalized_skills: list[str] = []
        seen_skills: set[str] = set()
        for candidate in candidates:
            normalized = self._normalize_skill(candidate)
            if not normalized or normalized in seen_skills:
                continue

            seen_skills.add(normalized)
            normalized_skills.append(normalized)

        return normalized_skills

    def _extract_experiences(
        self,
        parsed_json: Any,
        summary: str | None,
        ai_profile: Any,
    ) -> list[str]:
        texts: list[str] = []
        texts.extend(self._collect_texts(parsed_json))
        texts.extend(self._collect_texts(ai_profile))
        if summary:
            texts.append(summary)

        haystack = "\n".join(texts).casefold()
        experiences: list[str] = []
        for label, patterns in EXPERIENCE_KEYWORD_PATTERNS.items():
            if any(pattern.casefold() in haystack for pattern in patterns):
                experiences.append(label)

        return experiences

    def _extract_highlights(
        self,
        parsed_json: Any,
        summary: str | None,
        ai_profile: Any,
    ) -> list[str]:
        highlights: list[str] = []

        for highlight in self._get(ai_profile, "experience_highlights", default=[]):
            for text in self._string_list(self._get(highlight, "achievements", default=[])):
                highlights.append(text)
            for text in self._string_list(self._get(highlight, "responsibilities", default=[])):
                highlights.append(text)

            title = self._clean_text(self._get(highlight, "title"))
            role = self._clean_text(self._get(highlight, "role"))
            if title and role:
                highlights.append(f"{title} - {role}")
            elif title:
                highlights.append(title)
            elif role:
                highlights.append(role)

        for item in self._get(ai_profile, "cover_letter_insights", default=[]):
            claim = self._clean_text(self._get(item, "claim"))
            question_focus = self._clean_text(self._get(item, "question_focus"))
            if claim:
                highlights.append(claim)
            if question_focus:
                highlights.append(question_focus)

        for career in self._get(parsed_json, "careers", default=[]):
            for text in self._string_list(self._get(career, "responsibilities", default=[])):
                highlights.append(text)

        if summary:
            highlights.append(summary)

        cleaned_highlights: list[str] = []
        seen_highlights: set[str] = set()
        for highlight in highlights:
            normalized = self._clean_text(highlight)
            if not normalized:
                continue

            compact = re.sub(r"\s+", " ", normalized).strip()
            compact = compact[:MAX_HIGHLIGHT_LENGTH].rstrip(" .,")
            key = compact.casefold()
            if len(compact) < 8 or key in seen_highlights:
                continue

            seen_highlights.add(key)
            cleaned_highlights.append(compact)
            if len(cleaned_highlights) >= MAX_HIGHLIGHTS:
                break

        return cleaned_highlights

    def _collect_texts(self, value: Any) -> list[str]:
        texts: list[str] = []
        if value is None:
            return texts

        if isinstance(value, dict):
            for child in value.values():
                texts.extend(self._collect_texts(child))
            return texts

        if isinstance(value, list):
            for child in value:
                texts.extend(self._collect_texts(child))
            return texts

        text = self._clean_text(value)
        if text:
            texts.append(text)
        return texts

    def _normalize_skill(self, value: Any) -> str | None:
        raw = self._clean_text(value)
        if not raw:
            return None

        normalized_key = re.sub(r"[\s_\-]+", " ", raw).strip().casefold()
        condensed_key = normalized_key.replace(" ", "")
        if normalized_key in SKILL_ALIASES:
            return SKILL_ALIASES[normalized_key]
        if condensed_key in SKILL_ALIASES:
            return SKILL_ALIASES[condensed_key]

        return normalized_key

    def _string_list(self, values: Any) -> list[str]:
        if not isinstance(values, list):
            return []

        return [str(value) for value in values if self._clean_text(value)]

    def _get(self, value: Any, key: str, default: Any = None) -> Any:
        if value is None:
            return default

        if isinstance(value, dict):
            return value.get(key, default)

        return getattr(value, key, default)

    def _clean_text(self, value: Any) -> str | None:
        if value is None:
            return None

        text = str(value).strip()
        if not text:
            return None

        return re.sub(r"\s+", " ", text)

    def _dedupe(self, values: list[str]) -> list[str]:
        deduped: list[str] = []
        seen_values: set[str] = set()
        for value in values:
            key = value.casefold()
            if key in seen_values:
                continue
            seen_values.add(key)
            deduped.append(value)
        return deduped


question_keyword_service = QuestionKeywordService()
