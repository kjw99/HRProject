const DEFAULT_EMAIL_DISPLAY_MAX = 26;

export interface TruncatedEmailDisplay {
  full: string;
  display: string;
  isTruncated: boolean;
}

/** 긴 주소를 `user@gmai…` 형태로 줄여 표시 */
export function truncateEmailForDisplay(
  email: string,
  maxLength = DEFAULT_EMAIL_DISPLAY_MAX,
): TruncatedEmailDisplay {
  const full = email.trim();
  if (!full) {
    return { full: "", display: "", isTruncated: false };
  }

  if (full.length <= maxLength) {
    return { full, display: full, isTruncated: false };
  }

  const atIndex = full.indexOf("@");
  if (atIndex <= 0) {
    return {
      full,
      display: `${full.slice(0, maxLength - 1)}…`,
      isTruncated: true,
    };
  }

  const local = full.slice(0, atIndex);
  const domain = full.slice(atIndex + 1);
  const domainHead = domain.slice(0, Math.min(4, domain.length));
  const suffix = `@${domainHead}…`;
  const localMax = Math.max(4, maxLength - suffix.length);
  const localPart =
    local.length > localMax
      ? `${local.slice(0, Math.max(1, localMax - 1))}…`
      : local;

  return {
    full,
    display: `${localPart}${suffix}`,
    isTruncated: true,
  };
}
