from datetime import date

from multisport_ai_coach.analysis import TrainingHistoryAnalyzer
from multisport_ai_coach.domain import FatigueBudget, TrainingAvailability, UserProfile
from multisport_ai_coach.orchestration.volume import WeeklyVolumeAdvisor


def test_weekly_volume_decision_uses_active_week_average_and_consistency() -> None:
    activities = [
        {"date": date(2026, 5, 23), "sport": "Trail Run", "duration_minutes": 402},
        {"date": date(2026, 5, 17), "sport": "Cycling", "duration_minutes": 188},
    ]
    history = TrainingHistoryAnalyzer().build_profile(activities, date(2026, 2, 25), date(2026, 5, 26))
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        availability=TrainingAvailability(weekly_hours_min=8, weekly_hours_max=10),
    )
    budget = FatigueBudget(
        weekly_volume_direction="decrease 15-30%",
        max_hard_sessions=1,
        long_session_allowed=False,
        intensity_ceiling="endurance or low tempo only",
    )

    decision = WeeklyVolumeAdvisor().decide(profile, budget, history)

    assert decision.cap_minutes == 142
    assert decision.baseline_minutes == 168
    assert "15% consistency" in decision.rationale
    assert "fatigue budget asks" in decision.rationale


def test_weekly_volume_decision_falls_back_to_availability_without_history() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        availability=TrainingAvailability(weekly_hours_max=9),
    )
    budget = FatigueBudget("maintain", 2, True, "threshold allowed")

    decision = WeeklyVolumeAdvisor().decide(profile, budget, None)

    assert decision.cap_minutes == 540
    assert "No usable 90-day history" in decision.rationale


def test_weekly_volume_decision_keeps_rationale_without_availability() -> None:
    activities = [{"date": date(2026, 5, 23), "sport": "Trail Run", "duration_minutes": 180}]
    history = TrainingHistoryAnalyzer().build_profile(activities, date(2026, 2, 25), date(2026, 5, 26))
    profile = UserProfile(athlete_id="u1", timezone="Asia/Shanghai", weekly_training_days=5)
    budget = FatigueBudget("maintain or increase up to 5-10%", 2, True, "threshold allowed")

    decision = WeeklyVolumeAdvisor().decide(profile, budget, history)

    assert decision.cap_minutes is not None
    assert "baseline" in decision.rationale
    assert "availability cap unknown" in decision.rationale
