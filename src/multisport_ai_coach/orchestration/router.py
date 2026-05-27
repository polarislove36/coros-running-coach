from __future__ import annotations

from multisport_ai_coach.domain import CoachSelection, EventType, RaceEvent, SportType, UserProfile


EVENT_TO_SPORT = {
    EventType.HALF_MARATHON: SportType.RUNNING,
    EventType.MARATHON: SportType.RUNNING,
    EventType.ROAD_CYCLING: SportType.CYCLING,
    EventType.TRAIL_RACE: SportType.TRAIL_RUNNING,
    EventType.HYROX: SportType.HYROX,
    EventType.SWIM: SportType.SWIMMING,
}


class CoachRouter:
    """Selects only the coach modules needed for the current event calendar."""

    all_coaches = (
        SportType.RUNNING,
        SportType.CYCLING,
        SportType.TRAIL_RUNNING,
        SportType.HYROX,
        SportType.SWIMMING,
    )

    def select(self, profile: UserProfile, events: list[RaceEvent]) -> CoachSelection:
        active = {EVENT_TO_SPORT[event.event_type] for event in events}
        support = {SportType.STRENGTH, SportType.RECOVERY}

        for sport in profile.primary_sports:
            if sport not in active:
                support.add(sport)

        inactive = set(self.all_coaches) - active - support

        return CoachSelection(
            active=tuple(sorted(active)),
            support=tuple(sorted(support)),
            inactive=tuple(sorted(inactive)),
        )

