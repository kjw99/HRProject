from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_text
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
)


def build_question_selection_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    candidate_questions: list[GeneratedQuestion],
) -> list[SystemMessage | HumanMessage]:
    question_pairs = [
        {
            "pair_number": index + 1,
            "candidate_a": candidate_questions[index * 2],
            "candidate_b": candidate_questions[index * 2 + 1],
        }
        for index in range(data.question_count)
    ]
    human_prompt = f"""
Select exactly {data.question_count} final questions from the candidate question pairs below.

Position: {data.position_name}
Question count to select now: {data.question_count}
Overall requested question count: {data.final_question_count}
Additional request: {optional_text(data.additional_request)}

## Fit analysis
{model_to_json(analysis)}

## Candidate question pairs
{model_to_json(question_pairs)}

## Already reused questions
{model_to_json(data.reused_questions)}

Selection rules:
- Pick exactly one question from each pair.
- Prefer questions that are concrete, evidence-based, and job relevant.
- Prefer questions that verify real projects, outcomes, decisions, and risk handling.
- Do not select any question that duplicates or closely paraphrases an already reused question.
- Avoid protected or irrelevant personal information.
- Return exactly {data.question_count} selected questions.
- Each selected question must include question_text, evaluation_intent, generation_basis, and question_keywords.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
