/** SSR·클라이언트 동일 결과를 위한 KST 고정 포맷 */
const KST_DATE_TIME: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Seoul",
};

export function formatDateTimeKST(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ko-KR", KST_DATE_TIME).format(date);
}
