from __future__ import annotations

from collections import defaultdict
from datetime import date

from multisport_ai_coach.domain import SportHistorySummary, TrainingHistoryProfile


class TrainingHistoryAnalyzer:
    """Builds a compact athlete profile from recent COROS activities."""

    def build_profile(self, activities: list[dict], start: date, end: date) -> TrainingHistoryProfile:
        in_window = [
            activity
            for activity in activities
            if isinstance(activity.get("date"), date) and start <= activity["date"] <= end
        ]
        total_minutes = int(sum(_number(activity.get("duration_minutes")) for activity in in_window))
        window_weeks = max(1, round((end - start).days / 7))
        active_weeks = _active_week_count(in_window)
        longest_activity = _longest_activity(in_window)

        return TrainingHistoryProfile(
            start_date=start,
            end_date=end,
            total_activities=len(in_window),
            active_weeks=active_weeks,
            average_weekly_hours=round(total_minutes / 60 / window_weeks, 1),
            longest_activity=longest_activity,
            sport_summaries=tuple(_sport_summaries(in_window)),
            window_weeks=window_weeks,
            active_weekly_hours=round(total_minutes / 60 / active_weeks, 1) if active_weeks else 0,
            consistency_ratio=round(active_weeks / window_weeks, 2),
        )


def _sport_summaries(activities: list[dict]) -> list[SportHistorySummary]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for activity in activities:
        grouped[str(activity.get("sport") or "Unknown")].append(activity)

    summaries: list[SportHistorySummary] = []
    for sport, sport_activities in sorted(grouped.items()):
        summaries.append(
            SportHistorySummary(
                sport=sport,
                activity_count=len(sport_activities),
                total_duration_minutes=int(
                    sum(_number(activity.get("duration_minutes")) for activity in sport_activities)
                ),
                total_distance_km=round(sum(_number(activity.get("distance_km")) for activity in sport_activities), 2),
                total_elevation_gain_m=int(
                    sum(_number(activity.get("elevation_gain_m")) for activity in sport_activities)
                ),
                longest_duration_minutes=max(
                    [int(_number(activity.get("duration_minutes"))) for activity in sport_activities] or [0]
                ),
                longest_distance_km=round(
                    max([_number(activity.get("distance_km")) for activity in sport_activities] or [0]), 2
                ),
            )
        )
    return summaries


def _longest_activity(activities: list[dict]) -> dict:
    if not activities:
        return {}
    longest = max(activities, key=lambda activity: _number(activity.get("duration_minutes")))
    return {
        "date": longest.get("date"),
        "sport": longest.get("sport"),
        "duration_minutes": longest.get("duration_minutes"),
        "distance_km": longest.get("distance_km"),
        "elevation_gain_m": longest.get("elevation_gain_m"),
        "label_id": longest.get("label_id"),
    }


def _active_week_count(activities: list[dict]) -> int:
    return len({activity["date"].isocalendar()[:2] for activity in activities if isinstance(activity.get("date"), date)})


def _number(value) -> float:
    if isinstance(value, (int, float)):
        return value
    return 0
