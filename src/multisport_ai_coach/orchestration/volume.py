from __future__ import annotations

from dataclasses import dataclass

from multisport_ai_coach.domain import FatigueBudget, TrainingHistoryProfile, UserProfile


@dataclass(frozen=True)
class WeeklyVolumeDecision:
    cap_minutes: int | None
    baseline_minutes: int | None
    availability_cap_minutes: int | None
    rationale: str


class WeeklyVolumeAdvisor:
    """Turns history, fatigue, and availability into a weekly duration ceiling."""

    def decide(
        self,
        profile: UserProfile,
        budget: FatigueBudget,
        history_profile: TrainingHistoryProfile | None,
    ) -> WeeklyVolumeDecision:
        availability_cap = _availability_cap_minutes(profile)
        if history_profile is None or history_profile.total_activities == 0:
            return WeeklyVolumeDecision(
                cap_minutes=availability_cap,
                baseline_minutes=None,
                availability_cap_minutes=availability_cap,
                rationale="No usable 90-day history; use availability as the ceiling.",
            )

        baseline = _history_baseline_minutes(history_profile)
        if "decrease" in budget.weekly_volume_direction:
            history_cap = int(baseline * 0.85)
            fatigue_text = "fatigue budget asks for a 15-30% decrease"
        elif "maintain" in budget.weekly_volume_direction:
            history_cap = int(baseline * 1.05)
            fatigue_text = "fatigue budget supports maintenance with only a small increase"
        else:
            history_cap = int(baseline * 1.10)
            fatigue_text = "fatigue budget allows a controlled increase"

        history_cap = max(history_cap, 120)
        cap = history_cap if availability_cap is None else min(availability_cap, history_cap)
        availability_text = (
            f"{round(availability_cap / 60, 1):g}h" if availability_cap is not None else "unknown"
        )
        rationale = (
            f"baseline {round(baseline / 60, 1):g}h from 90-day history "
            f"({history_profile.average_weekly_hours:g}h/window week, "
            f"{history_profile.active_weekly_hours:g}h/active week, "
            f"{round(history_profile.consistency_ratio * 100):g}% consistency); "
            f"{fatigue_text}; availability cap "
            f"{availability_text}"
        )
        return WeeklyVolumeDecision(
            cap_minutes=cap,
            baseline_minutes=baseline,
            availability_cap_minutes=availability_cap,
            rationale=rationale,
        )


def _availability_cap_minutes(profile: UserProfile) -> int | None:
    availability = profile.availability
    availability_hours = availability.weekly_hours_max or availability.weekly_hours or availability.weekly_hours_min
    return int(availability_hours * 60) if availability_hours is not None else None


def _history_baseline_minutes(history_profile: TrainingHistoryProfile) -> int:
    window_minutes = history_profile.average_weekly_hours * 60
    active_minutes = history_profile.active_weekly_hours * 60
    consistency = history_profile.consistency_ratio

    if active_minutes <= 0:
        return int(window_minutes)
    if consistency < 0.35:
        return int(max(window_minutes, min(active_minutes * 0.75, window_minutes + 120)))
    if consistency < 0.65:
        return int(max(window_minutes, active_minutes * 0.85))
    return int(max(window_minutes, active_minutes * 0.90))
