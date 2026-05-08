from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.interview_slot import InterviewSlot
from app.models.interview_slot_interviewer import InterviewSlotInterviewer
from app.repositories.interview_booking_repository import interview_booking_repository
from app.repositories.interview_slot_interviewer_repository import (
    interview_slot_interviewer_repository,
)
from app.repositories.interview_slot_repository import interview_slot_repository
from app.repositories.interviewer_repository import interviewer_repository
from app.repositories.position_repository import position_repository
from app.schemas.interview_slot import (
    InterviewSlotBatchCreate,
    InterviewSlotCreate,
    InterviewSlotDetailResponse,
    InterviewSlotListItemResponse,
    InterviewSlotResponse,
    InterviewSlotUpdate,
)


KST = ZoneInfo("Asia/Seoul")


@dataclass
class PreparedInterviewSlot:
    slot: InterviewSlot
    interviewer_ids: list[int]
    interview_starts_at: datetime
    interview_ends_at: datetime
    booking_deadline_at: datetime


class InterviewSlotService:
    async def get_interview_slot_detail(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlotDetailResponse:
        slot = await self._get_slot_with_details_or_raise(db, slot_id)
        now = datetime.now(KST)
        active_bookings = self._get_active_bookings(slot)

        return InterviewSlotDetailResponse(
            slot_id=slot.slot_id,
            position_name=slot.position.position_name if slot.position else None,
            interviewer_names=[
                interviewer.interviewer_name for interviewer in slot.interviewers
            ],
            booked_candidate_names=[
                booking.candidate.name
                for booking in active_bookings
                if booking.candidate and booking.candidate.name
            ],
            interview_round=slot.interview_round,
            interview_starts_at=slot.interview_starts_at,
            interview_ends_at=slot.interview_ends_at,
            booking_deadline_at=slot.booking_deadline_at,
            remaining_capacity=self._get_remaining_capacity(
                slot.capacity,
                len(active_bookings),
            ),
            slot_status=self._get_effective_slot_status(
                slot,
                len(active_bookings),
                now,
            ),
            interview_location=slot.interview_location,
        )

    async def get_interview_slots(
        self,
        db: AsyncSession,
    ) -> list[InterviewSlotListItemResponse]:
        slots = await interview_slot_repository.find_all_with_details(db)
        now = datetime.now(KST)

        return [
            InterviewSlotListItemResponse(
                slot_id=slot.slot_id,
                position_name=slot.position.position_name if slot.position else None,
                interviewer_names=[
                    interviewer.interviewer_name
                    for interviewer in slot.interviewers
                ],
                interview_round=slot.interview_round,
                interview_starts_at=slot.interview_starts_at,
                interview_ends_at=slot.interview_ends_at,
                slot_status=self._get_effective_slot_status(
                    slot,
                    self._count_active_bookings(slot),
                    now,
                ),
                interview_location=slot.interview_location,
            )
            for slot in slots
        ]

    async def create_interview_slot(
        self,
        db: AsyncSession,
        data: InterviewSlotCreate,
    ) -> InterviewSlotResponse:
        prepared_slot = await self._prepare_interview_slot(db, data)

        await db.commit()
        await db.refresh(prepared_slot.slot)

        return self._to_response(prepared_slot)

    async def create_interview_slots_batch(
        self,
        db: AsyncSession,
        data: InterviewSlotBatchCreate,
    ) -> list[InterviewSlotResponse]:
        self._validate_batch_internal_time_conflicts(data.slots)

        prepared_slots = [
            await self._prepare_interview_slot(db, slot_data)
            for slot_data in data.slots
        ]

        await db.commit()

        for prepared_slot in prepared_slots:
            await db.refresh(prepared_slot.slot)

        return [self._to_response(prepared_slot) for prepared_slot in prepared_slots]

    async def update_interview_slot(
        self,
        db: AsyncSession,
        slot_id: int,
        data: InterviewSlotUpdate,
    ) -> InterviewSlotResponse:
        slot = await self._get_slot_with_interviewers_or_raise(db, slot_id)
        await self._ensure_no_active_bookings(db, slot_id, action="수정")

        current_interviewer_ids = [
            slot_interviewer.interviewer_id
            for slot_interviewer in slot.slot_interviewers
        ]

        position_id = data.position_id or slot.position_id
        interview_round = data.interview_round or slot.interview_round
        interviewer_ids = data.interviewer_ids or current_interviewer_ids
        interview_date = data.interview_date or self._get_local_date(
            slot.interview_starts_at
        )
        interview_start_time = data.interview_start_time or self._get_local_time(
            slot.interview_starts_at
        )
        interview_end_time = data.interview_end_time or self._get_local_time(
            slot.interview_ends_at
        )
        interview_location = data.interview_location or slot.interview_location
        capacity = data.capacity or slot.capacity

        if position_id is None:
            raise ConflictException("직무 정보가 없는 면접 일정은 수정할 수 없습니다.")

        starts_at = self._combine_datetime(interview_date, interview_start_time)
        ends_at = self._combine_datetime(interview_date, interview_end_time)
        if starts_at >= ends_at:
            raise ConflictException("면접 시작 시간은 종료 시간보다 빨라야 합니다.")

        await self._validate_position(db, position_id)
        await self._validate_interviewers(db, interviewer_ids)
        await self._validate_interviewer_time_conflicts(
            db,
            interviewer_ids,
            starts_at,
            ends_at,
            excluded_slot_id=slot_id,
        )

        booking_deadline_at = starts_at - timedelta(hours=24)

        slot.position_id = position_id
        slot.interview_round = interview_round
        slot.interview_starts_at = starts_at
        slot.interview_ends_at = ends_at
        slot.booking_deadline_at = booking_deadline_at
        slot.interview_location = interview_location
        slot.capacity = capacity

        if sorted(current_interviewer_ids) != sorted(interviewer_ids):
            await interview_slot_interviewer_repository.delete_by_slot_id(db, slot_id)
            await db.flush()

            for interviewer_id in interviewer_ids:
                db.add(
                    InterviewSlotInterviewer(
                        slot_id=slot_id,
                        interviewer_id=interviewer_id,
                    )
                )

        await db.commit()
        await db.refresh(slot)

        return self._to_response(
            PreparedInterviewSlot(
                slot=slot,
                interviewer_ids=interviewer_ids,
                interview_starts_at=starts_at,
                interview_ends_at=ends_at,
                booking_deadline_at=booking_deadline_at,
            )
        )

    async def delete_interview_slot(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> None:
        slot = await self._get_slot_or_raise(db, slot_id)
        await self._ensure_no_active_bookings(db, slot_id, action="삭제")

        await interview_slot_repository.delete(db, slot)
        await db.commit()

    async def _prepare_interview_slot(
        self,
        db: AsyncSession,
        data: InterviewSlotCreate,
    ) -> PreparedInterviewSlot:
        await self._validate_position(db, data.position_id)
        await self._validate_interviewers(db, data.interviewer_ids)

        starts_at = self._combine_datetime(data.interview_date, data.interview_start_time)
        ends_at = self._combine_datetime(data.interview_date, data.interview_end_time)
        booking_deadline_at = starts_at - timedelta(hours=24)

        await self._validate_interviewer_time_conflicts(
            db,
            data.interviewer_ids,
            starts_at,
            ends_at,
        )

        slot = InterviewSlot(
            position_id=data.position_id,
            interview_round=data.interview_round,
            interview_starts_at=starts_at,
            interview_ends_at=ends_at,
            booking_deadline_at=booking_deadline_at,
            interview_location=data.interview_location,
            capacity=data.capacity,
            slot_status="open",
            slot_interviewers=[
                InterviewSlotInterviewer(interviewer_id=interviewer_id)
                for interviewer_id in data.interviewer_ids
            ],
        )

        interview_slot_repository.save(db, slot)

        return PreparedInterviewSlot(
            slot=slot,
            interviewer_ids=data.interviewer_ids,
            interview_starts_at=starts_at,
            interview_ends_at=ends_at,
            booking_deadline_at=booking_deadline_at,
        )

    async def _get_slot_or_raise(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlot:
        slot = await interview_slot_repository.find_by_id(db, slot_id)
        if not slot:
            raise NotFoundException("면접 일정을 찾을 수 없습니다.")

        return slot

    async def _get_slot_with_interviewers_or_raise(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlot:
        slot = await interview_slot_repository.find_by_id_with_interviewers(
            db,
            slot_id,
        )
        if not slot:
            raise NotFoundException("면접 일정을 찾을 수 없습니다.")

        return slot

    async def _get_slot_with_details_or_raise(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlot:
        slot = await interview_slot_repository.find_by_id_with_details(db, slot_id)
        if not slot:
            raise NotFoundException("면접 일정을 찾을 수 없습니다.")

        return slot

    async def _ensure_no_active_bookings(
        self,
        db: AsyncSession,
        slot_id: int,
        action: str,
    ) -> None:
        has_active_bookings = await interview_booking_repository.has_active_bookings(
            db,
            slot_id,
        )
        if has_active_bookings:
            raise ConflictException(
                f"활성 예약이 있는 면접 일정은 {action}할 수 없습니다."
            )

    async def _validate_position(
        self,
        db: AsyncSession,
        position_id: int,
    ) -> None:
        position = await position_repository.find_by_id(db, position_id)
        if not position:
            raise NotFoundException("직무를 찾을 수 없습니다.")

    async def _validate_interviewers(
        self,
        db: AsyncSession,
        interviewer_ids: list[int],
    ) -> None:
        interviewers = await interviewer_repository.find_by_ids(
            db,
            interviewer_ids,
        )
        found_interviewer_ids = {
            interviewer.interviewer_id for interviewer in interviewers
        }
        missing_interviewer_ids = [
            interviewer_id
            for interviewer_id in interviewer_ids
            if interviewer_id not in found_interviewer_ids
        ]

        if missing_interviewer_ids:
            raise NotFoundException(
                "존재하지 않는 면접관 id가 있습니다: "
                f"{', '.join(map(str, missing_interviewer_ids))}"
            )

    async def _validate_interviewer_time_conflicts(
        self,
        db: AsyncSession,
        interviewer_ids: list[int],
        starts_at: datetime,
        ends_at: datetime,
        excluded_slot_id: int | None = None,
    ) -> None:
        if excluded_slot_id is None:
            conflicts = (
                await interview_slot_interviewer_repository.find_interviewer_time_conflicts(
                    db,
                    interviewer_ids,
                    starts_at,
                    ends_at,
                )
            )
        else:
            conflicts = (
                await interview_slot_interviewer_repository.find_interviewer_time_conflicts_excluding_slot(
                    db,
                    interviewer_ids,
                    starts_at,
                    ends_at,
                    excluded_slot_id,
                )
            )

        if not conflicts:
            return

        conflict_slots_by_interviewer_id: dict[int, list[int]] = defaultdict(list)
        for interviewer_id, slot_id in conflicts:
            conflict_slots_by_interviewer_id[interviewer_id].append(slot_id)

        conflict_messages = [
            f"면접관 {interviewer_id}: 기존 일정 {', '.join(map(str, slot_ids))}"
            for interviewer_id, slot_ids in conflict_slots_by_interviewer_id.items()
        ]

        raise ConflictException(
            "해당 시간에 이미 배정된 면접관이 있습니다. "
            + "; ".join(conflict_messages)
        )

    def _validate_batch_internal_time_conflicts(
        self,
        slots: list[InterviewSlotCreate],
    ) -> None:
        scheduled_interviews: list[tuple[int, int, datetime, datetime]] = []
        conflict_messages: list[str] = []

        for slot_index, slot_data in enumerate(slots, start=1):
            starts_at = self._combine_datetime(
                slot_data.interview_date,
                slot_data.interview_start_time,
            )
            ends_at = self._combine_datetime(
                slot_data.interview_date,
                slot_data.interview_end_time,
            )

            for interviewer_id in slot_data.interviewer_ids:
                for (
                    existing_slot_index,
                    existing_interviewer_id,
                    existing_starts_at,
                    existing_ends_at,
                ) in scheduled_interviews:
                    if interviewer_id != existing_interviewer_id:
                        continue

                    if not self._has_time_overlap(
                        starts_at,
                        ends_at,
                        existing_starts_at,
                        existing_ends_at,
                    ):
                        continue

                    conflict_messages.append(
                        f"{existing_slot_index}번째 일정과 {slot_index}번째 일정의 "
                        f"면접관 {interviewer_id} 시간이 겹칩니다."
                    )

                scheduled_interviews.append(
                    (slot_index, interviewer_id, starts_at, ends_at)
                )

        if conflict_messages:
            raise ConflictException(
                "batch 요청 안에서 면접관 시간이 겹치는 일정이 있습니다. "
                + "; ".join(conflict_messages)
            )

    def _has_time_overlap(
        self,
        starts_at: datetime,
        ends_at: datetime,
        target_starts_at: datetime,
        target_ends_at: datetime,
    ) -> bool:
        return starts_at < target_ends_at and ends_at > target_starts_at

    def _count_active_bookings(self, slot: InterviewSlot) -> int:
        return len(self._get_active_bookings(slot))

    def _get_active_bookings(self, slot: InterviewSlot):
        return [
            booking
            for booking in slot.bookings
            if booking.cancelled_at is None
        ]

    def _get_remaining_capacity(
        self,
        capacity: int,
        active_booking_count: int,
    ) -> int:
        return max(0, capacity - active_booking_count)

    def _get_effective_slot_status(
        self,
        slot: InterviewSlot,
        active_booking_count: int,
        now: datetime,
    ) -> str:
        if slot.slot_status == "closed":
            return "closed"

        if slot.booking_deadline_at is not None and slot.booking_deadline_at <= now:
            return "closed"

        if active_booking_count >= slot.capacity:
            return "full"

        return "open"

    def _to_response(
        self,
        prepared_slot: PreparedInterviewSlot,
    ) -> InterviewSlotResponse:
        slot = prepared_slot.slot
        return InterviewSlotResponse(
            slot_id=slot.slot_id,
            position_id=slot.position_id,
            interview_round=slot.interview_round,
            interviewer_ids=prepared_slot.interviewer_ids,
            interview_starts_at=prepared_slot.interview_starts_at,
            interview_ends_at=prepared_slot.interview_ends_at,
            booking_deadline_at=prepared_slot.booking_deadline_at,
            interview_location=slot.interview_location,
            capacity=slot.capacity,
            slot_status=slot.slot_status,
            created_at=slot.created_at,
        )

    def _get_local_date(self, value: datetime) -> date:
        return value.astimezone(KST).date()

    def _get_local_time(self, value: datetime) -> time:
        local_value = value.astimezone(KST).replace(tzinfo=None)
        return local_value.time()

    def _combine_datetime(
        self,
        interview_date: date,
        interview_time: time,
    ) -> datetime:
        return datetime.combine(interview_date, interview_time).replace(tzinfo=KST)


interview_slot_service = InterviewSlotService()
