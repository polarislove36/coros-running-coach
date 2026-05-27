from datetime import date

from multisport_ai_coach.domain import (
    EventPriority,
    EventType,
    RaceEvent,
    ReadinessSnapshot,
    SportType,
    TrainingAvailability,
    TrainingSession,
    UserProfile,
)
from multisport_ai_coach.orchestration.allocation import (
    format_sport_priority_note,
    minimum_session_minutes,
    reduction_order,
    session_protection_score,
    sport_priority_scores,
)
from multisport_ai_coach.orchestration.orchestrator import PlanOrchestrator


def test_sport_priority_scores_prefer_near_a_race_over_later_b_race() -> None:
    events = [
        RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A),
        RaceEvent("Bike", EventType.ROAD_CYCLING, date(2026, 10, 24), EventPriority.B),
    ]

    scores = sport_priority_scores(date(2026, 5, 26), events)

    assert scores[SportType.TRAIL_RUNNING] > scores[SportType.CYCLING]
    assert "primary focus trail_running" in format_sport_priority_note(scores)


def test_volume_guard_reduces_lower_priority_sport_first() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        preferred_rest_days=("Saturday",),
        availability=TrainingAvailability(weekly_hours_max=2.4, accepts_two_a_day=True),
        primary_sports=(SportType.TRAIL_RUNNING, SportType.CYCLING),
    )
    events = [
        RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A, elevation_gain_m=8000),
        RaceEvent("Bike", EventType.ROAD_CYCLING, date(2026, 10, 24), EventPriority.B),
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness)
    cycling_minutes = sum(session.duration_minutes for session in plan.sessions if session.sport == SportType.CYCLING)
    trail_minutes = sum(session.duration_minutes for session in plan.sessions if session.sport == SportType.TRAIL_RUNNING)

    assert trail_minutes > cycling_minutes
    assert any("Sport allocation priority" in note for note in plan.notes)


def test_volume_guard_still_reaches_cap_when_key_session_floors_are_exhausted() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        preferred_rest_days=("Saturday",),
        availability=TrainingAvailability(weekly_hours_max=2.37, accepts_two_a_day=True),
        primary_sports=(SportType.TRAIL_RUNNING, SportType.CYCLING),
    )
    events = [
        RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A, elevation_gain_m=8000),
        RaceEvent("Bike", EventType.ROAD_CYCLING, date(2026, 10, 24), EventPriority.B),
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness)

    assert sum(session.duration_minutes for session in plan.sessions) == 150
    assert any("minimum session floors" in note for note in plan.notes)


def test_key_sessions_are_more_protected_within_the_same_sport() -> None:
    easy = TrainingSession(
        day="Tuesday",
        sport=SportType.TRAIL_RUNNING,
        title="Trail skills easy run",
        duration_minutes=45,
        intensity="easy",
        purpose="Practice skills.",
    )
    uphill = TrainingSession(
        day="Thursday",
        sport=SportType.TRAIL_RUNNING,
        title="Uphill aerobic strength",
        duration_minutes=60,
        intensity="6 x 3 min steady uphill",
        purpose="Build climbing durability.",
    )
    long = TrainingSession(
        day="Sunday",
        sport=SportType.TRAIL_RUNNING,
        title="Long trail run / hike-run",
        duration_minutes=120,
        intensity="easy",
        purpose="Build time-on-feet.",
    )

    order = reduction_order(
        [long, uphill, easy],
        {SportType.TRAIL_RUNNING: 100},
    )

    assert order == [2, 1, 0]
    assert session_protection_score(long) > session_protection_score(uphill) > session_protection_score(easy)
    assert minimum_session_minutes(long) == 60
    assert minimum_session_minutes(uphill) == 45
