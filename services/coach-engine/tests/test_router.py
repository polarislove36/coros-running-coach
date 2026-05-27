from datetime import date

from multisport_ai_coach.domain import EventPriority, EventType, RaceEvent, SportType, UserProfile
from multisport_ai_coach.orchestration.router import CoachRouter


def test_router_activates_only_event_relevant_coaches() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        primary_sports=(SportType.RUNNING, SportType.CYCLING),
    )
    events = [
        RaceEvent("Half", EventType.HALF_MARATHON, date(2026, 6, 1), EventPriority.A),
        RaceEvent("Bike", EventType.ROAD_CYCLING, date(2026, 7, 1), EventPriority.B),
    ]

    selection = CoachRouter().select(profile, events)

    assert SportType.RUNNING in selection.active
    assert SportType.CYCLING in selection.active
    assert SportType.HYROX in selection.inactive
    assert SportType.SWIMMING in selection.inactive
    assert SportType.STRENGTH in selection.support

