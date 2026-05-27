from datetime import date

from multisport_ai_coach.analysis import TrainingHistoryAnalyzer
from multisport_ai_coach.domain import EventPriority, EventType, RaceEvent, ReadinessSnapshot, SportType, UserProfile
from multisport_ai_coach.orchestration.orchestrator import PlanOrchestrator


def test_training_history_profile_summarizes_90_day_window() -> None:
    activities = [
        {
            "date": date(2026, 5, 23),
            "sport": "Trail Run",
            "duration_minutes": 402,
            "distance_km": 36.62,
            "elevation_gain_m": 1984,
        },
        {
            "date": date(2026, 5, 17),
            "sport": "Cycling",
            "duration_minutes": 188,
            "distance_km": 89.78,
        },
        {
            "date": date(2026, 1, 1),
            "sport": "Cycling",
            "duration_minutes": 60,
            "distance_km": 30,
        },
    ]

    profile = TrainingHistoryAnalyzer().build_profile(activities, date(2026, 2, 25), date(2026, 5, 26))

    assert profile.total_activities == 2
    assert profile.active_weeks == 2
    assert profile.average_weekly_hours == 0.8
    assert profile.window_weeks == 13
    assert profile.active_weekly_hours == 4.9
    assert profile.consistency_ratio == 0.15
    assert profile.longest_activity["sport"] == "Trail Run"
    assert {summary.sport for summary in profile.sport_summaries} == {"Cycling", "Trail Run"}


def test_plan_notes_include_90_day_history_profile() -> None:
    activities = [
        {"date": date(2026, 5, 23), "sport": "Trail Run", "duration_minutes": 402, "distance_km": 36.62}
    ]
    history_profile = TrainingHistoryAnalyzer().build_profile(activities, date(2026, 2, 25), date(2026, 5, 26))
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=5,
        primary_sports=(SportType.TRAIL_RUNNING,),
    )
    events = [RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A)]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(
        date(2026, 5, 26), profile, events, readiness, activities, history_profile
    )

    assert any("90-day history" in note for note in plan.notes)


def test_history_profile_caps_weekly_volume_when_load_is_high() -> None:
    activities = [
        {"date": date(2026, 5, 23), "sport": "Trail Run", "duration_minutes": 402, "distance_km": 36.62},
        {"date": date(2026, 5, 17), "sport": "Cycling", "duration_minutes": 188, "distance_km": 89.78},
    ]
    history_profile = TrainingHistoryAnalyzer().build_profile(activities, date(2026, 2, 25), date(2026, 5, 26))
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        primary_sports=(SportType.TRAIL_RUNNING, SportType.CYCLING),
    )
    events = [
        RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A),
        RaceEvent("Bike", EventType.ROAD_CYCLING, date(2026, 10, 24), EventPriority.B),
    ]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=100, load_ratio=1.77)

    plan = PlanOrchestrator().build_week_plan(
        date(2026, 5, 26), profile, events, readiness, activities, history_profile
    )

    assert sum(session.duration_minutes for session in plan.sessions) <= 180
    assert any("Weekly volume cap" in note for note in plan.notes)
    assert any(session.downgrade == "Automatically shortened by weekly volume guard." for session in plan.sessions)


def test_history_profile_notes_include_active_week_average_and_consistency() -> None:
    activities = [
        {"date": date(2026, 5, 23), "sport": "Trail Run", "duration_minutes": 240, "distance_km": 24},
        {"date": date(2026, 5, 17), "sport": "Cycling", "duration_minutes": 180, "distance_km": 80},
        {"date": date(2026, 5, 10), "sport": "Outdoor Run", "duration_minutes": 120, "distance_km": 20},
    ]
    history_profile = TrainingHistoryAnalyzer().build_profile(activities, date(2026, 2, 25), date(2026, 5, 26))
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        primary_sports=(SportType.TRAIL_RUNNING,),
    )
    events = [RaceEvent("Trail", EventType.TRAIL_RACE, date(2026, 7, 17), EventPriority.A)]
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=90, load_ratio=1.0)

    plan = PlanOrchestrator().build_week_plan(
        date(2026, 5, 26), profile, events, readiness, activities, history_profile
    )

    assert any("h/active week" in note and "consistency" in note for note in plan.notes)
