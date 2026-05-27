from datetime import date

from multisport_ai_coach.analysis import DisciplineReadinessAnalyzer
from multisport_ai_coach.domain import (
    EventPriority,
    EventType,
    RaceEvent,
    ReadinessSnapshot,
    SportType,
    UserProfile,
)
from multisport_ai_coach.orchestration.orchestrator import PlanOrchestrator


def test_discipline_readiness_summarizes_trail_and_cycling() -> None:
    activities = [
        {
            "date": date(2026, 5, 23),
            "sport": "Trail Run",
            "sport_code": 102,
            "duration_minutes": 402,
            "distance_km": 36.62,
            "elevation_gain_m": 1984,
        },
        {
            "date": date(2026, 5, 17),
            "sport": "Cycling",
            "sport_code": 200,
            "duration_minutes": 188,
            "distance_km": 89.78,
            "average_power_watts": 119,
        },
    ]

    readiness = DisciplineReadinessAnalyzer().build_profile(activities)

    assert readiness.trail.trail_activity_count == 1
    assert readiness.trail.max_elevation_gain_m == 1984
    assert readiness.cycling.ride_count == 1
    assert readiness.cycling.max_distance_km == 89.78
    assert readiness.cycling.has_power_data is True


def test_plan_notes_include_discipline_readiness() -> None:
    activities = [
        {
            "date": date(2026, 5, 23),
            "sport": "Trail Run",
            "duration_minutes": 402,
            "distance_km": 36.62,
            "elevation_gain_m": 1984,
        }
    ]
    discipline_readiness = DisciplineReadinessAnalyzer().build_profile(activities)
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        primary_sports=(SportType.TRAIL_RUNNING,),
    )
    events = [RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A)]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(
        date(2026, 5, 26),
        profile,
        events,
        readiness,
        activities,
        history_profile=None,
        discipline_readiness=discipline_readiness,
    )

    assert any("Discipline readiness" in note for note in plan.notes)


def test_cycling_coach_uses_recent_power_data_for_watt_targets() -> None:
    activities = [
        {
            "date": date(2026, 5, 17),
            "sport": "Cycling",
            "sport_code": 200,
            "duration_minutes": 188,
            "distance_km": 89.78,
            "average_power_watts": 119,
            "normalized_power_watts": 127,
        },
        {
            "date": date(2026, 5, 10),
            "sport": "Indoor Cycling",
            "sport_code": 201,
            "duration_minutes": 75,
            "distance_km": 35,
            "average_power_watts": 130,
        },
    ]
    discipline_readiness = DisciplineReadinessAnalyzer().build_profile(activities)
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        primary_sports=(SportType.CYCLING,),
        ftp_watts=194,
    )
    events = [RaceEvent("Bike", EventType.ROAD_CYCLING, date(2026, 10, 24), EventPriority.B)]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(
        date(2026, 5, 26),
        profile,
        events,
        readiness,
        recent_activities=activities,
        discipline_readiness=discipline_readiness,
    )

    assert any("109-146W" in session.intensity for session in plan.sessions)
    assert any("Recent power data is present" in session.purpose for session in plan.sessions)
    assert any(
        stage.power_zone == "Z2 109-146W"
        for session in plan.sessions
        for stage in session.workout_stages
    )
