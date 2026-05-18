import type { Applicant } from "@/types/applicant";
import type { ParsingItem, TableRowData } from "@/types/parsing";
import { RESUME_PARSE_POSITION_ALL } from "./parsing.constants";

function asExperienceLevel(value: string): Applicant["experience_level"] {
  if (value === "신입" || value === "경력" || value === "무관") return value;
  return "무관";
}

function asApplicationStatus(value: string): Applicant["application_status"] {
  if (
    value === "서류" ||
    value === "면접" ||
    value === "최종합격" ||
    value === "불합격"
  ) {
    return value;
  }
  return "서류";
}

function asFinalStatus(value: string): Applicant["final_status"] {
  if (value === "진행중" || value === "합격" || value === "불합격") return value;
  return "진행중";
}

/** 파싱 결과가 DB 지원자와 연결되어 있는지 */
export function isPersistedParseRow(row: TableRowData): boolean {
  return row.raw.record.candidate.candidateId > 0;
}

export function tableRowToApplicant(row: TableRowData): Applicant {
  const candidate = row.raw.record.candidate;
  return {
    candidate_id: candidate.candidateId,
    position_id: candidate.positionId ?? 0,
    name: candidate.name,
    date_of_birth: candidate.dateOfBirth,
    gender: candidate.gender,
    address: candidate.address,
    phone: candidate.phone,
    email: candidate.email,
    experience_level: asExperienceLevel(candidate.experienceLevel),
    application_status: asApplicationStatus(candidate.applicationStatus),
    final_status: asFinalStatus(candidate.finalStatus),
    meets_preferred_criteria: candidate.meetsPreferredCriteria ?? [],
  };
}

export function updateTableRowFromApplicant(
  row: TableRowData,
  applicant: Applicant,
): TableRowData {
  const position =
    row.raw.record.aiProfile?.target_position ||
    row.raw.record.positionMatch?.matchedPositionName ||
    row.raw.record.positionMatch?.rawPosition ||
    row.position;

  return {
    ...row,
    name: applicant.name,
    birth: applicant.date_of_birth,
    phone: applicant.phone,
    email: applicant.email || "—",
    criteriaMet: (applicant.meets_preferred_criteria ?? []).length > 0,
    raw: {
      ...row.raw,
      record: {
        ...row.raw.record,
        candidateId: applicant.candidate_id,
        candidate: {
          ...row.raw.record.candidate,
          candidateId: applicant.candidate_id,
          positionId: applicant.position_id,
          name: applicant.name,
          dateOfBirth: applicant.date_of_birth,
          gender:
            applicant.gender === "남" || applicant.gender === "여"
              ? applicant.gender
              : null,
          address: applicant.address,
          phone: applicant.phone,
          email: applicant.email,
          experienceLevel: applicant.experience_level,
          applicationStatus: applicant.application_status,
          finalStatus: applicant.final_status,
          meetsPreferredCriteria: applicant.meets_preferred_criteria,
        },
      },
    },
    position,
  };
}

export function mapParsingItemsToTableRows(items: ParsingItem[]): TableRowData[] {
  const rows = items.map((item, idx) => {
    const candidate = item.record.candidate;
    const position =
      item.record.aiProfile?.target_position ||
      item.record.positionMatch?.matchedPositionName ||
      item.record.positionMatch?.rawPosition ||
      "미분류";

    return {
      id: `${candidate.candidateId}-${idx}-${item.filename}`,
      name: candidate.name,
      birth: candidate.dateOfBirth,
      phone: candidate.phone,
      email: candidate.email || "—",
      position,
      channel: "파일 업로드",
      isDuplicate: false,
      criteriaMet: (candidate.meetsPreferredCriteria ?? []).length > 0,
      raw: item,
    };
  });
  return recomputeDuplicateFlags(rows);
}

function normalizeDupKey(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9가-힣]/g, "");
}

function duplicateKey(row: Pick<TableRowData, "name" | "phone">): string {
  const name = normalizeDupKey(row.name);
  const phone = normalizeDupKey(row.phone);
  return `${name}::${phone}`;
}

export function recomputeDuplicateFlags(rows: TableRowData[]): TableRowData[] {
  const countByKey = new Map<string, number>();

  for (const row of rows) {
    const key = duplicateKey(row);
    if (!key || key === "::") continue;
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
  }

  return rows.map((row) => {
    const key = duplicateKey(row);
    const isDuplicate = key !== "::" && (countByKey.get(key) ?? 0) > 1;
    return { ...row, isDuplicate };
  });
}

export function collectPositionOptions(rows: TableRowData[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    if (row.position?.trim()) set.add(row.position.trim());
  }
  return [
    RESUME_PARSE_POSITION_ALL,
    ...[...set].sort((a, b) => a.localeCompare(b, "ko")),
  ];
}
