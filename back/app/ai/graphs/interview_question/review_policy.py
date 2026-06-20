from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    QuestionReviewIssue,
    QuestionReviewOutput,
)


MIN_REVIEW_SCORE = 85


def apply_deterministic_review_checks(
    review: QuestionReviewOutput,
    questions: list[GeneratedQuestion],
    question_count: int,
) -> QuestionReviewOutput:
    issues = list(review.issues)
    hard_failure = False
    needs_revision = False

    for issue in issues:
        severity = issue.severity.strip().casefold()
        if severity == "critical":
            hard_failure = True
        elif severity == "major":
            needs_revision = True

    if len(questions) != question_count:
        hard_failure = True
        issues.append(
            QuestionReviewIssue(
                severity="critical",
                reason=(
                    f"요청 질문 개수는 {question_count}개이지만 "
                    f"생성 질문은 {len(questions)}개입니다."
                ),
                suggestion="요청 개수와 정확히 일치하도록 질문을 보완하세요.",
            )
        )

    seen_texts: set[str] = set()
    for index, question in enumerate(questions, start=1):
        question_text = question.question_text.strip()
        if question_text in seen_texts:
            hard_failure = True
            issues.append(
                QuestionReviewIssue(
                    question_number=index,
                    severity="major",
                    reason="동일한 질문이 중복 생성되었습니다.",
                    suggestion="중복 질문을 다른 검증 관점의 질문으로 교체하세요.",
                )
            )
        seen_texts.add(question_text)

    passed = (
        review.passed
        and review.score >= MIN_REVIEW_SCORE
        and not hard_failure
        and not needs_revision
    )
    score = review.score
    if hard_failure:
        score = min(score, 70)
    elif needs_revision:
        score = min(score, MIN_REVIEW_SCORE - 1)
    elif not passed:
        score = min(score, MIN_REVIEW_SCORE - 1)

    return QuestionReviewOutput(
        passed=passed,
        score=score,
        summary=review.summary,
        issues=issues,
    )
