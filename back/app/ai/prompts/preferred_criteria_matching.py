from langchain_core.messages import HumanMessage, SystemMessage


SYSTEM_PROMPT = """
You are an HR resume screening assistant.
Your job is to compare a candidate resume with the preferred qualifications in a
job description and return only the preferred criteria the candidate clearly meets.

Rules:
- Use only the job description's preferred-criteria section, such as "우대사항",
  "우대 사항", "preferred qualifications", or similar wording.
- Do not use required skills, main duties, interview guide topics, or general company context.
- Return the matched preferred criteria as short strings.
- Do not include reasons, evidence, scores, or unmatched criteria.
- If no preferred criteria are clearly met, return an empty list.
- Do not invent criteria that are not present in the job description.
""".strip()


def build_preferred_criteria_match_messages(
    job_description_context: str,
    resume_json: str,
    position_name: str | None = None,
    resume_summary: str | None = None,
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
Position:
{position_name or "Unknown"}

Job description context:
\"\"\"
{job_description_context}
\"\"\"

Resume summary:
\"\"\"
{resume_summary or ""}
\"\"\"

Parsed resume JSON:
```json
{resume_json}
```

Return structured output with only:
- meets_preferred_criteria: a JSON array of strings.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
