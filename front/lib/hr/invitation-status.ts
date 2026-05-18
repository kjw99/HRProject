import type { BookingInviteStatus } from "@/types/hr-ui";

export interface BookingInviteStatusInput {
  revoked_at?: string | null;
  expires_at?: string | null;
}

/** 초대 링크 상태: 유효 / 회수 / 만료 */
export function resolveBookingInviteStatus(
  invite: BookingInviteStatusInput,
  now: Date = new Date(),
): BookingInviteStatus {
  if (invite.revoked_at) return "revoked";
  if (invite.expires_at && new Date(invite.expires_at).getTime() < now.getTime()) {
    return "expired";
  }
  return "active";
}
