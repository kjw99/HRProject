from app.ai.schemas.question_generation import GeneratedQuestion


def normalize_questions(
    questions: list[GeneratedQuestion],
) -> list[GeneratedQuestion]:
    normalized_questions: list[GeneratedQuestion] = []
    seen_texts: set[str] = set()

    for question in questions:
        question_text = question.question_text.strip()
        if not question_text or question_text in seen_texts:
            continue

        seen_texts.add(question_text)
        normalized_questions.append(
            GeneratedQuestion(
                question_text=question_text,
                evaluation_intent=question.evaluation_intent.strip(),
                generation_basis=question.generation_basis.strip(),
            )
        )

    return normalized_questions
