from __future__ import annotations

from multisport_ai_coach.domain import CyclingReadinessProfile, DisciplineReadinessProfile, TrailReadinessProfile


class DisciplineReadinessAnalyzer:
    """Extracts sport-specific readiness signals from normalized activities."""

    def build_profile(self, activities: list[dict]) -> DisciplineReadinessProfile:
        trail_activities = [activity for activity in activities if _is_trail(activity)]
        ride_activities = [activity for activity in activities if _is_ride(activity)]
        return DisciplineReadinessProfile(
            trail=_trail_profile(trail_activities),
            cycling=_cycling_profile(ride_activities),
        )


def _trail_profile(activities: list[dict]) -> TrailReadinessProfile:
    return TrailReadinessProfile(
        trail_activity_count=len(activities),
        total_trail_hours=round(sum(_number(activity.get("duration_minutes")) for activity in activities) / 60, 1),
        total_elevation_gain_m=int(sum(_number(activity.get("elevation_gain_m")) for activity in activities)),
        max_distance_km=round(max([_number(activity.get("distance_km")) for activity in activities] or [0]), 2),
        max_duration_minutes=int(max([_number(activity.get("duration_minutes")) for activity in activities] or [0])),
        max_elevation_gain_m=int(max([_number(activity.get("elevation_gain_m")) for activity in activities] or [0])),
    )


def _cycling_profile(activities: list[dict]) -> CyclingReadinessProfile:
    return CyclingReadinessProfile(
        ride_count=len(activities),
        total_ride_hours=round(sum(_number(activity.get("duration_minutes")) for activity in activities) / 60, 1),
        max_distance_km=round(max([_number(activity.get("distance_km")) for activity in activities] or [0]), 2),
        max_duration_minutes=int(max([_number(activity.get("duration_minutes")) for activity in activities] or [0])),
        has_power_data=any(_has_power(activity) for activity in activities),
    )


def _is_trail(activity: dict) -> bool:
    sport = str(activity.get("sport") or "").lower()
    return "trail" in sport or activity.get("sport_code") == 102


def _is_ride(activity: dict) -> bool:
    sport = str(activity.get("sport") or "").lower()
    return "cycling" in sport or activity.get("sport_code") in {200, 201, 202, 203, 204, 205, 299}


def _has_power(activity: dict) -> bool:
    return any(key in activity and activity[key] is not None for key in ("average_power_watts", "normalized_power_watts"))


def _number(value) -> float:
    if isinstance(value, (int, float)):
        return value
    return 0
