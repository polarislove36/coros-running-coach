from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TrainingLoadEstimate:
    score: float
    source: str
    method: str
    details: dict


class TrainingLoadEstimator:
    """Estimates activity load with transparent fallbacks."""

    def estimate(self, activity: dict, *, ftp_watts: int | None = None) -> TrainingLoadEstimate:
        official = _number_or_none(activity.get("training_load"))
        if official is not None:
            return TrainingLoadEstimate(
                score=round(official, 1),
                source="coros",
                method="official COROS training load",
                details={},
            )

        duration_hours = _duration_hours(activity)
        if duration_hours is None:
            return TrainingLoadEstimate(
                score=0,
                source="missing",
                method="insufficient duration data",
                details={},
            )

        normalized_power = _number_or_none(activity.get("normalized_power_watts"))
        if normalized_power is not None and ftp_watts:
            intensity_factor = normalized_power / ftp_watts
            score = duration_hours * intensity_factor * intensity_factor * 100
            return TrainingLoadEstimate(
                score=round(score, 1),
                source="power",
                method="cycling TSS estimate from NP and FTP",
                details={
                    "duration_hours": round(duration_hours, 2),
                    "ftp_watts": ftp_watts,
                    "normalized_power_watts": normalized_power,
                    "intensity_factor": round(intensity_factor, 2),
                },
            )

        average_hr = _number_or_none(activity.get("average_hr_bpm"))
        if average_hr is not None:
            intensity_factor = _heart_rate_intensity_factor(average_hr)
            terrain_factor = _terrain_factor(activity)
            score = duration_hours * 100 * intensity_factor * terrain_factor
            return TrainingLoadEstimate(
                score=round(score, 1),
                source="heart_rate",
                method="heart-rate duration load estimate",
                details={
                    "duration_hours": round(duration_hours, 2),
                    "average_hr_bpm": average_hr,
                    "intensity_factor": intensity_factor,
                    "terrain_factor": terrain_factor,
                },
            )

        score = duration_hours * 50
        return TrainingLoadEstimate(
            score=round(score, 1),
            source="duration",
            method="duration-only conservative load estimate",
            details={"duration_hours": round(duration_hours, 2)},
        )

    def estimate_many(self, activities: list[dict], *, ftp_watts: int | None = None) -> list[TrainingLoadEstimate]:
        return [self.estimate(activity, ftp_watts=ftp_watts) for activity in activities]


def _duration_hours(activity: dict) -> float | None:
    minutes = _number_or_none(activity.get("duration_minutes"))
    if minutes is None:
        return None
    return minutes / 60


def _heart_rate_intensity_factor(average_hr: float) -> float:
    if average_hr < 130:
        return 0.6
    if average_hr < 145:
        return 0.75
    if average_hr < 160:
        return 0.9
    return 1.1


def _terrain_factor(activity: dict) -> float:
    sport = str(activity.get("sport") or "").lower()
    elevation_gain = _number_or_none(activity.get("elevation_gain_m")) or 0
    if "trail" not in sport and activity.get("sport_code") != 102:
        return 1.0
    return round(1 + min(elevation_gain / 1000 * 0.08, 0.25), 2)


def _number_or_none(value) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    return None
