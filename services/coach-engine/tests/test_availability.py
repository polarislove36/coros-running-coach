from datetime import date

from multisport_ai_coach.domain import (
    EventPriority,
    EventType,
    RaceEvent,
    ReadinessSnapshot,
    SportType,
    TrainingAvailability,
    UserProfile,
)
from multisport_ai_coach.domain.questionnaire import PROFILE_INTAKE_QUESTIONS
from multisport_ai_coach.orchestration.orchestrator import PlanOrchestrator


def test_profile_intake_includes_weekly_time_and_two_a_day_questions() -> None:
    ids = {question["id"] for question in PROFILE_INTAKE_QUESTIONS}

    assert "weekly_training_time" in ids
    assert "two_a_day_acceptance" in ids


def test_availability_blocks_double_session_days_when_not_accepted() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        availability=TrainingAvailability(weekly_hours_min=8, weekly_hours_max=10, accepts_two_a_day=False),
        primary_sports=(SportType.RUNNING, SportType.CYCLING),
    )
    events = [
        RaceEvent("Half", EventType.HALF_MARATHON, date(2026, 6, 1), EventPriority.A),
        RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 8, 1), EventPriority.B),
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness)

    assert any("does not accept double sessions" in session.purpose for session in plan.sessions)


def test_availability_supports_weekly_range_and_double_session_limit() -> None:
    availability = TrainingAvailability(
        weekly_hours_min=8,
        weekly_hours_max=10,
        accepts_two_a_day=True,
        max_two_a_day_days_per_week=3,
    )

    assert availability.weekly_hours_min == 8
    assert availability.weekly_hours_max == 10
    assert availability.max_two_a_day_days_per_week == 3


def test_preferred_rest_day_is_protected() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        preferred_rest_days=("Saturday",),
        availability=TrainingAvailability(weekly_hours_min=8, weekly_hours_max=10, accepts_two_a_day=True),
        primary_sports=(SportType.TRAIL_RUNNING,),
    )
    events = [
        RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A, elevation_gain_m=8000)
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=100, load_ratio=1.77)

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness)

    saturday_sessions = [session for session in plan.sessions if session.day == "Saturday"]
    assert saturday_sessions
    assert all(session.duration_minutes == 0 for session in saturday_sessions)
    assert all(session.sport == SportType.RECOVERY for session in saturday_sessions)
