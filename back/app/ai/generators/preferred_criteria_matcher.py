import json

from app.ai.clients.llm_errors import map_llm_exception
from app.ai.clients.llm_retry import run_with_rate_limit_retry
from app.ai.clients.llm_client import get_chat_model
from app.ai.prompts.preferred_criteria_matching import (
    build_preferred_criteria_match_messages,
)
from app.ai.schemas.preferred_criteria_matching import PreferredCriteriaMatchOutput
from app.ai.schemas.resume_parsing import ParsedResumeJson
from app.core.exceptions import ExternalServiceException


class PreferredCriteriaMatcher:
    async def match(
        self,
        job_description_context: str,
        parsed_resume: ParsedResumeJson,
        position_name: str | None = None,
        resume_summary: str | None = None,
    ) -> list[str]:
        cleaned_context = job_description_context.strip()
        if not cleaned_context:
            return []

        try:
            resume_json = json.dumps(
                parsed_resume.model_dump(
                    mode="json",
                    exclude={
                        "personal_info": {
                            "name",
                            "birth_date",
                            "gender",
                            "address",
                            "phone",
                            "email",
                        }
                    },
                ),
                ensure_ascii=False,
            )
            llm = get_chat_model().with_structured_output(
                PreferredCriteriaMatchOutput
            )
            result = await run_with_rate_limit_retry(
                lambda: llm.ainvoke(
                    build_preferred_criteria_match_messages(
                        job_description_context=cleaned_context,
                        resume_json=resume_json,
                        position_name=position_name,
                        resume_summary=resume_summary,
                    )
                )
            )
        except ExternalServiceException:
            raise
        except Exception as exc:
            raise ExternalServiceException(
                map_llm_exception(exc, "AI failed to match preferred criteria.")
            ) from exc

        try:
            output = PreferredCriteriaMatchOutput.model_validate(result)
        except Exception as exc:
            raise ExternalServiceException(
                "AI returned an invalid preferred criteria format."
            ) from exc

        return output.meets_preferred_criteria


preferred_criteria_matcher = PreferredCriteriaMatcher()
