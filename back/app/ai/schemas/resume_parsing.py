from pydantic import BaseModel, ConfigDict, Field, field_validator


class ResumeSchemaModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class PeriodValue(ResumeSchemaModel):
    raw: str | None = Field(default=None)
    start_date: str | None = Field(
        default=None,
        description="YYYY-MM, YYYY-MM-DD, or null when unknown.",
    )
    end_date: str | None = Field(
        default=None,
        description="YYYY-MM, YYYY-MM-DD, present, or null when unknown.",
    )


class MoneyValue(ResumeSchemaModel):
    amount: int | None = Field(
        default=None,
        description="Numeric amount in KRW. Use null when unknown.",
    )
    raw: str | None = Field(default=None)


class GpaValue(ResumeSchemaModel):
    score: float | None = Field(default=None)
    max_score: float | None = Field(default=None)
    raw: str | None = Field(default=None)


class PositionText(ResumeSchemaModel):
    raw: str | None = Field(default=None)
    normalized: str | None = Field(default=None)


class PersonalInfo(ResumeSchemaModel):
    name: str | None = Field(default=None)
    birth_date: str | None = Field(
        default=None,
        description="YYYY-MM-DD when available. Preserve raw value if uncertain.",
    )
    gender: str | None = Field(default=None)
    address: str | None = Field(default=None)
    phone: str | None = Field(default=None)
    email: str | None = Field(default=None)
    applied_position: PositionText | None = Field(default=None)


class DesiredConditions(ResumeSchemaModel):
    desired_location: str | None = Field(default=None)
    desired_salary: MoneyValue | None = Field(default=None)


class EducationItem(ResumeSchemaModel):
    education_level: str | None = Field(default=None)
    school_name: str | None = Field(default=None)
    major: str | None = Field(default=None)
    period: PeriodValue | None = Field(default=None)
    location: str | None = Field(default=None)
    gpa: GpaValue | None = Field(default=None)


class MilitaryService(ResumeSchemaModel):
    service_type: str | None = Field(default=None)
    branch: str | None = Field(default=None)
    period: PeriodValue | None = Field(default=None)
    rank: str | None = Field(default=None)
    exemption_reason: str | None = Field(default=None)


class CareerItem(ResumeSchemaModel):
    company_name: str | None = Field(default=None)
    department: str | None = Field(default=None)
    employment_type: str | None = Field(default=None)
    is_company_employment: bool | None = Field(default=None)
    exclusion_reason: str | None = Field(default=None)
    annual_salary: MoneyValue | None = Field(default=None)
    position: str | None = Field(default=None)
    resignation_reason: str | None = Field(default=None)
    period: PeriodValue | None = Field(default=None)
    responsibilities: list[str] = Field(default_factory=list)


class CertificationItem(ResumeSchemaModel):
    name: str | None = Field(default=None)
    issuer: str | None = Field(default=None)
    acquired_date: str | None = Field(
        default=None,
        description="YYYY-MM, YYYY-MM-DD, or null when unknown.",
    )
    certification_number: str | None = Field(default=None)


class JobRelatedActivityItem(ResumeSchemaModel):
    period: PeriodValue | None = Field(default=None)
    organization: str | None = Field(default=None)
    activity_name: str | None = Field(default=None)
    role: str | None = Field(default=None)
    note: str | None = Field(default=None)


class CoverLetterItem(ResumeSchemaModel):
    title: str | None = Field(default=None)
    content: str | None = Field(default=None)


class ExtractionMeta(ResumeSchemaModel):
    language: str | None = Field(default=None)
    confidence: float | None = Field(default=None, ge=0, le=1)
    warnings: list[str] = Field(default_factory=list)


class ParsedResumeJson(ResumeSchemaModel):
    schema_version: str = Field(default="resume_parsed_v1")
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    desired_conditions: DesiredConditions = Field(default_factory=DesiredConditions)
    education: list[EducationItem] = Field(default_factory=list)
    military_service: MilitaryService | None = Field(default=None)
    careers: list[CareerItem] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    job_related_activities: list[JobRelatedActivityItem] = Field(default_factory=list)
    cover_letters: list[CoverLetterItem] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    extraction_meta: ExtractionMeta = Field(default_factory=ExtractionMeta)


class CandidateSummary(ResumeSchemaModel):
    career_level: str | None = Field(default=None)
    total_experience_months: int | None = Field(default=None, ge=0)
    current_or_latest_role: str | None = Field(default=None)
    core_summary: str | None = Field(default=None)


class SkillsProfile(ResumeSchemaModel):
    programming_languages: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    domains: list[str] = Field(default_factory=list)
    other: list[str] = Field(default_factory=list)


class ExperienceHighlight(ResumeSchemaModel):
    title: str | None = Field(default=None)
    organization: str | None = Field(default=None)
    period_summary: str | None = Field(default=None)
    role: str | None = Field(default=None)
    tech_stack: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    question_focus: list[str] = Field(default_factory=list)


class EducationSummary(ResumeSchemaModel):
    highest_level: str | None = Field(default=None)
    major: str | None = Field(default=None)
    relevant_notes: list[str] = Field(default_factory=list)


class ProfileCertification(ResumeSchemaModel):
    name: str | None = Field(default=None)
    relevance: str | None = Field(default=None)


class CoverLetterInsight(ResumeSchemaModel):
    theme: str | None = Field(default=None)
    claim: str | None = Field(default=None)
    question_focus: str | None = Field(default=None)


class ResumeAIProfile(ResumeSchemaModel):
    schema_version: str = Field(default="resume_ai_profile_v1")
    target_position: str | None = Field(default=None)
    candidate_summary: CandidateSummary = Field(default_factory=CandidateSummary)
    skills: SkillsProfile = Field(default_factory=SkillsProfile)
    experience_highlights: list[ExperienceHighlight] = Field(default_factory=list)
    education_summary: EducationSummary = Field(default_factory=EducationSummary)
    certifications: list[ProfileCertification] = Field(default_factory=list)
    cover_letter_insights: list[CoverLetterInsight] = Field(default_factory=list)
    strengths_to_probe: list[str] = Field(default_factory=list)
    risk_or_unclear_points: list[str] = Field(default_factory=list)
    recommended_question_topics: list[str] = Field(default_factory=list)


class ResumeParseAIOutput(ResumeSchemaModel):
    parsed_json: ParsedResumeJson = Field(default_factory=ParsedResumeJson)
    summary: str | None = Field(default=None)
    ai_profile: ResumeAIProfile = Field(default_factory=ResumeAIProfile)

    @field_validator("summary")
    @classmethod
    def normalize_summary(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None
