from __future__ import annotations

import re
from dataclasses import replace

from multisport_ai_coach.domain import HeartRateProfile, HeartRateZone, TrainingSession, WorkoutStage


DEFAULT_MAX_HR_ZONE_PERCENTAGES = {
    "Z1": (0.60, 0.70),
    "Z2": (0.70, 0.80),
    "Z3": (0.80, 0.90),
    "Z4": (0.90, 0.95),
    "Z5": (0.95, 1.00),
}


def enrich_sessions_with_heart_rate_zones(
    sessions: list[TrainingSession],
    heart_rate: HeartRateProfile,
) -> list[TrainingSession]:
    if not heart_rate.max_hr_bpm and not heart_rate.zones:
        return sessions

    return [_enrich_session(session, heart_rate) for session in sessions]


def _enrich_session(session: TrainingSession, heart_rate: HeartRateProfile) -> TrainingSession:
    if not session.workout_stages:
        return session

    stages = tuple(_enrich_stage(stage, heart_rate) for stage in session.workout_stages)
    return replace(session, workout_stages=stages)


def _enrich_stage(stage: WorkoutStage, heart_rate: HeartRateProfile) -> WorkoutStage:
    if not stage.heart_rate_zone:
        return stage
    resolved = resolve_heart_rate_zone(stage.heart_rate_zone, heart_rate)
    return replace(stage, heart_rate_zone=resolved)


def resolve_heart_rate_zone(zone_text: str, heart_rate: HeartRateProfile) -> str:
    zone_names = _extract_zone_names(zone_text)
    if not zone_names:
        return zone_text

    resolved = [_format_zone(name, heart_rate) for name in zone_names]
    resolved = [item for item in resolved if item]
    if not resolved:
        return zone_text

    extra = zone_text
    for name in zone_names:
        extra = extra.replace(name, "").strip(" ,;/-")
    extra = " ".join(extra.split())
    suffix = f" ({extra})" if extra else ""
    return " / ".join(resolved) + suffix


def _extract_zone_names(value: str) -> list[str]:
    upper = value.upper().replace("ZONE", "Z")
    names = []
    for match in re.finditer(r"Z[1-5]", upper):
        name = match.group(0)
        if name not in names:
            names.append(name)
    return names


def _format_zone(name: str, heart_rate: HeartRateProfile) -> str | None:
    zone = _find_manual_zone(name, heart_rate.zones)
    if zone is not None:
        return _format_manual_zone(zone)
    if heart_rate.max_hr_bpm is None:
        return None
    percentages = DEFAULT_MAX_HR_ZONE_PERCENTAGES.get(name)
    if percentages is None:
        return None
    low, high = percentages
    return f"{name} {round(heart_rate.max_hr_bpm * low)}-{round(heart_rate.max_hr_bpm * high)} bpm"


def _find_manual_zone(name: str, zones: tuple[HeartRateZone, ...]) -> HeartRateZone | None:
    for zone in zones:
        if zone.name.upper() == name:
            return zone
    return None


def _format_manual_zone(zone: HeartRateZone) -> str:
    if zone.lower_bpm is not None and zone.upper_bpm is not None:
        return f"{zone.name.upper()} {zone.lower_bpm}-{zone.upper_bpm} bpm"
    if zone.lower_bpm is not None:
        return f"{zone.name.upper()} >= {zone.lower_bpm} bpm"
    if zone.upper_bpm is not None:
        return f"{zone.name.upper()} <= {zone.upper_bpm} bpm"
    return zone.name.upper()
