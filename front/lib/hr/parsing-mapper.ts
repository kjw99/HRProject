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

function hasTwoOrMoreMatchingIdentityFields(
  left: Pick<TableRowData, "name" | "phone" | "email">,
  right: Pick<TableRowData, "name" | "phone" | "email">,
): boolean {
  const leftName = normalizeDupKey(left.name);
  const leftPhone = normalizeDupKey(left.phone);
  const leftEmail = normalizeDupKey(left.email);

  const rightName = normalizeDupKey(right.name);
  const rightPhone = normalizeDupKey(right.phone);
  const rightEmail = normalizeDupKey(right.email);

  let matchCount = 0;

  if (leftName && rightName && leftName === rightName) matchCount += 1;
  if (leftPhone && rightPhone && leftPhone === rightPhone) matchCount += 1;
  if (leftEmail && rightEmail && leftEmail === rightEmail) matchCount += 1;

  return matchCount >= 2;
}

export function recomputeDuplicateFlags(rows: TableRowData[]): TableRowData[] {
  const duplicateIds = new Set<string>();

  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      if (hasTwoOrMoreMatchingIdentityFields(rows[i], rows[j])) {
        duplicateIds.add(rows[i].id);
        duplicateIds.add(rows[j].id);
      }
    }
  }

  return rows.map((row) => ({ ...row, isDuplicate: duplicateIds.has(row.id) }));
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

export interface DuplicateIdentityInput {
  name: string | null | undefined;
  birth: string | null | undefined;
  phone: string | null | undefined;
  email: string | null | undefined;
}

function normalizeIdentityValue(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
}

function normalizeNameValue(value: string | null | undefined): string {
  // Remove parenthetical aliases like "최태형 (崔泰亨)".
  const withoutParen = (value ?? "")
    .replace(/[\(\（][^\)\）]*[\)\）]/g, "")
    .trim();
  return normalizeIdentityValue(withoutParen);
}

export function buildDuplicateIdentityKey(input: DuplicateIdentityInput): string {
  const name = normalizeNameValue(input.name);
  const birth = normalizeIdentityValue(input.birth);
  const phone = normalizeIdentityValue(input.phone);
  const email = normalizeIdentityValue(input.email);
  return `${name}::${birth}::${phone}::${email}`;
}

export function findDuplicateIdentityKeys(
  entries: DuplicateIdentityInput[],
): Set<string> {
  const duplicateKeys = new Set<string>();

  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const left = entries[i];
      const right = entries[j];

      const leftName = normalizeNameValue(left.name);
      const rightName = normalizeNameValue(right.name);
      const leftBirth = normalizeIdentityValue(left.birth);
      const rightBirth = normalizeIdentityValue(right.birth);
      const leftPhone = normalizeIdentityValue(left.phone);
      const rightPhone = normalizeIdentityValue(right.phone);
      const leftEmail = normalizeIdentityValue(left.email);
      const rightEmail = normalizeIdentityValue(right.email);

      const nameMatched = leftName !== "" && leftName === rightName;
      const birthMatched = leftBirth !== "" && leftBirth === rightBirth;
      const phoneMatched = leftPhone !== "" && leftPhone === rightPhone;
      const emailMatched = leftEmail !== "" && leftEmail === rightEmail;

      // Primary rule: name + birth + phone all match.
      if (nameMatched && birthMatched && phoneMatched) {
        duplicateKeys.add(buildDuplicateIdentityKey(left));
        duplicateKeys.add(buildDuplicateIdentityKey(right));
        continue;
      }

      // Secondary rule: at least 2 matched among name/phone/email.
      const matchedFieldCount =
        Number(nameMatched) + Number(phoneMatched) + Number(emailMatched);

      if (matchedFieldCount >= 2) {
        duplicateKeys.add(buildDuplicateIdentityKey(left));
        duplicateKeys.add(buildDuplicateIdentityKey(right));
      }
    }
  }

  return duplicateKeys;
}
