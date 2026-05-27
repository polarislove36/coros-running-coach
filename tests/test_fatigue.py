from datetime import date

from multisport_ai_coach.domain import ReadinessSnapshot
from multisport_ai_coach.fatigue.manager import FatigueManager


def test_excessive_load_caps_hard_sessions() -> None:
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=97, load_ratio=2.0)

    budget = FatigueManager().build_budget(readiness)

    assert budget.max_hard_sessions == 1
    assert budget.long_session_allowed is False
    assert "decrease" in budget.weekly_volume_direction


def test_recent_long_activity_adds_risk_flag() -> None:
    readiness = ReadinessSnapshot(date=date(2026, 5, 26), recovery_percent=97, load_ratio=1.0)
    recent_activities = [
        {
            "date": date(2026, 5, 23),
            "sport": "Trail Run",
            "duration_minutes": 402,
            "distance_km": 36.62,
        }
    ]

    budget = FatigueManager().build_budget(readiness, recent_activities, date(2026, 5, 26))

    assert budget.max_hard_sessions == 1
    assert any("recent long trail run" in flag for flag in budget.risk_flags)
