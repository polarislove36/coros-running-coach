from __future__ import annotations

from datetime import date

from multisport_ai_coach.domain import FatigueBudget, ReadinessSnapshot


class FatigueManager:
    """Turns recovery and load signals into a weekly training budget."""

    def build_budget(
        self,
        readiness: ReadinessSnapshot,
        recent_activities: list[dict] | None = None,
        today: date | None = None,
    ) -> FatigueBudget:
        flags: list[str] = []
        ratio = readiness.load_ratio
        flags.extend(_activity_risk_flags(recent_activities or [], today or readiness.date))

        if ratio is not None and ratio >= 1.5:
            flags.append("short-term load is excessive")
            return FatigueBudget(
                weekly_volume_direction="decrease 15-30%",
                max_hard_sessions=1,
                long_session_allowed=False,
                intensity_ceiling="endurance or low tempo only",
                risk_flags=tuple(flags),
            )

        if readiness.recovery_percent is not None and readiness.recovery_percent < 60:
            flags.append("recovery is low")
            return FatigueBudget(
                weekly_volume_direction="decrease 20-40%",
                max_hard_sessions=0,
                long_session_allowed=False,
                intensity_ceiling="recovery only",
                risk_flags=tuple(flags),
            )

        if readiness.sleep_score is not None and readiness.sleep_score < 60:
            flags.append("sleep quality is poor")

        return FatigueBudget(
            weekly_volume_direction="maintain or increase up to 5-10%",
            max_hard_sessions=2 if not flags else 1,
            long_session_allowed=True,
            intensity_ceiling="threshold allowed if other signals are stable",
            risk_flags=tuple(flags),
        )


def _activity_risk_flags(activities: list[dict], today: date) -> list[str]:
    flags: list[str] = []
    latest = _latest_activity(activities)
    if latest is None:
        return flags

    activity_date = latest.get("date")
    if not isinstance(activity_date, date):
        return flags

    days_since = (today - activity_date).days
    duration = latest.get("duration_minutes") or 0
    distance = latest.get("distance_km") or 0
    sport = latest.get("sport") or "activity"
    is_recent = 0 <= days_since <= 7
    is_long = duration >= 180 or distance >= 30

    if is_recent and is_long:
        flags.append(
            f"recent long {str(sport).lower()} {days_since} days ago: "
            f"{distance:g}km / {duration:g}min"
        )

    return flags


def _latest_activity(activities: list[dict]) -> dict | None:
    dated = [activity for activity in activities if isinstance(activity.get("date"), date)]
    if not dated:
        return None
    return max(dated, key=lambda activity: activity["date"])
