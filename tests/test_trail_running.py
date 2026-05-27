from datetime import date

from multisport_ai_coach.domain import (
    EventPriority,
    EventType,
    RaceEvent,
    ReadinessSnapshot,
    SportType,
    UserProfile,
)
from multisport_ai_coach.orchestration.orchestrator import PlanOrchestrator
from multisport_ai_coach.analysis import DisciplineReadinessAnalyzer


def test_trail_race_uses_trail_running_coach() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        primary_sports=(SportType.RUNNING,),
    )
    events = [
        RaceEvent(
            "Trail",
            EventType.TRAIL_RACE,
            date(2026, 8, 1),
            EventPriority.A,
            distance_km=35,
            elevation_gain_m=1800,
        )
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness)

    assert any(session.sport == SportType.TRAIL_RUNNING for session in plan.sessions)
    assert any("Uphill" in session.title for session in plan.sessions)
    assert not any("Coach module not implemented yet" in session.title for session in plan.sessions)


def test_trail_coach_uses_indoor_climb_substitutes_and_fueling_tolerance() -> None:
    from multisport_ai_coach.domain import FuelingProfile, TrainingAvailability, TrainingEnvironment

    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        availability=TrainingAvailability(accepts_two_a_day=True),
        environment=TrainingEnvironment(
            outdoor_climbs_available=False,
            treadmill_available=True,
            stairs_available=True,
        ),
        fueling=FuelingProfile(carb_tolerance_g_per_hour_min=80, carb_tolerance_g_per_hour_max=90),
    )
    events = [
        RaceEvent(
            "Trail",
            EventType.TRAIL_RACE,
            date(2026, 8, 1),
            EventPriority.A,
            distance_km=120,
            elevation_gain_m=8000,
        )
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness)

    assert any("incline treadmill / stairs" in session.title for session in plan.sessions)
    assert any("80-90g carbohydrate/hour" in (session.nutrition or "") for session in plan.sessions)


def test_coordinator_downgrades_same_day_run_and_trail_sessions() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        primary_sports=(SportType.RUNNING,),
    )
    events = [
        RaceEvent("Half", EventType.HALF_MARATHON, date(2026, 6, 1), EventPriority.A),
        RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 8, 1), EventPriority.B),
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness)

    duplicate_day_downgrades = [
        session
        for session in plan.sessions
        if "same day" in (session.purpose or "") or "two training sessions" in (session.purpose or "")
    ]
    assert duplicate_day_downgrades


def test_plan_notes_include_latest_coros_activity() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        primary_sports=(SportType.RUNNING,),
    )
    events = [RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A)]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)
    recent_activities = [
        {
            "date": date(2026, 5, 23),
            "sport": "Trail Run",
            "duration_minutes": 402,
            "distance_km": 36.62,
        }
    ]

    plan = PlanOrchestrator().build_week_plan(date(2026, 5, 26), profile, events, readiness, recent_activities)

    assert any("Latest COROS activity: Trail Run on 2026-05-23" in note for note in plan.notes)


def test_trail_coach_uses_recent_trail_readiness_for_long_run() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        primary_sports=(SportType.TRAIL_RUNNING,),
    )
    events = [RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A)]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)
    activities = [
        {
            "date": date(2026, 5, 23),
            "sport": "Trail Run",
            "sport_code": 102,
            "duration_minutes": 402,
            "distance_km": 36.62,
            "elevation_gain_m": 1984,
        }
    ]

    plan = PlanOrchestrator().build_week_plan(
        date(2026, 5, 26),
        profile,
        events,
        readiness,
        recent_activities=activities,
        discipline_readiness=DisciplineReadinessAnalyzer().build_profile(activities),
    )

    long_runs = [session for session in plan.sessions if session.title == "Long trail run / hike-run"]
    assert long_runs[0].duration_minutes == 120
    assert "Recent trail max is 36.62km" in long_runs[0].purpose
