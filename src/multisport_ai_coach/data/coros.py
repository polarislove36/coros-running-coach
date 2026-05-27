from __future__ import annotations

from datetime import date
import re
from typing import Protocol

from multisport_ai_coach.domain import ReadinessSnapshot


class CorosDataSource(Protocol):
    """Stable interface for a future COROS MCP adapter."""

    def get_readiness(self, on_date: date) -> ReadinessSnapshot:
        """Return recovery, HRV, sleep, resting HR, and load summary."""

    def get_recent_activities(self, start: date, end: date, sport_codes: tuple[int, ...]) -> list[dict]:
        """Return normalized activity summaries for the requested sports."""

    def get_activity_detail(self, label_id: str, sport_type: int) -> dict:
        """Return normalized activity-level detail."""


class InMemoryCorosDataSource:
    """Tiny test double until the real COROS MCP adapter is implemented."""

    def __init__(self, readiness: ReadinessSnapshot, activities: list[dict] | None = None) -> None:
        self.readiness = readiness
        self.activities = activities or []

    def get_readiness(self, on_date: date) -> ReadinessSnapshot:
        return self.readiness

    def get_recent_activities(self, start: date, end: date, sport_codes: tuple[int, ...]) -> list[dict]:
        return [
            activity
            for activity in self.activities
            if start <= activity.get("date", start) <= end and activity.get("sport_code") in sport_codes
        ]

    def get_activity_detail(self, label_id: str, sport_type: int) -> dict:
        for activity in self.activities:
            if activity.get("label_id") == label_id and activity.get("sport_code") == sport_type:
                return activity
        raise KeyError(f"Activity not found: {label_id}/{sport_type}")


class CorosTextPayloadDataSource:
    """Adapter for text payloads returned by the current COROS MCP tools.

    The Codex MCP tools are available to the agent, not directly to this Python
    package. This adapter gives the application a stable boundary: a caller can
    pass captured MCP text into the project and receive normalized domain data.
    """

    def __init__(
        self,
        *,
        recovery_text: str = "",
        training_load_text: str = "",
        sport_records_text: str = "",
        activity_details: dict[tuple[str, int], dict] | None = None,
    ) -> None:
        self.recovery_text = recovery_text
        self.training_load_text = training_load_text
        self.sport_records_text = sport_records_text
        self.activity_details = activity_details or {}

    def get_readiness(self, on_date: date) -> ReadinessSnapshot:
        recovery_percent = _first_int(r"Recovery:\s*(\d+)%", self.recovery_text)
        load_entry = _parse_training_load_entry(self.training_load_text, on_date)
        notes: list[str] = []

        if load_entry.get("comment"):
            notes.append(f"COROS load comment: {load_entry['comment']}")
        if not self.training_load_text:
            notes.append("COROS training load payload missing.")
        if not self.recovery_text:
            notes.append("COROS recovery payload missing.")

        return ReadinessSnapshot(
            date=on_date,
            recovery_percent=recovery_percent,
            short_term_load=load_entry.get("short_term_load"),
            long_term_load=load_entry.get("long_term_load"),
            load_ratio=load_entry.get("load_ratio"),
            notes=tuple(notes),
        )

    def get_recent_activities(self, start: date, end: date, sport_codes: tuple[int, ...]) -> list[dict]:
        activities = _parse_sport_records(self.sport_records_text)
        return [
            activity
            for activity in activities
            if start <= activity["date"] <= end and (not sport_codes or activity["sport_code"] in sport_codes)
        ]

    def get_activity_detail(self, label_id: str, sport_type: int) -> dict:
        key = (label_id, sport_type)
        if key in self.activity_details:
            return self.activity_details[key]
        for activity in _parse_sport_records(self.sport_records_text):
            if activity.get("label_id") == label_id and activity.get("sport_code") == sport_type:
                return activity
        raise KeyError(f"Activity not found: {label_id}/{sport_type}")


def parse_activity_detail_text(label_id: str, sport_type: int, payload: str) -> dict:
    activity = {
        "label_id": label_id,
        "sport_code": sport_type,
        "duration": _first_text(r"Workout Time:\s*([^\n]+)", payload),
        "duration_minutes": _duration_to_minutes(_first_text(r"Workout Time:\s*([^\n]+)", payload)),
        "distance_km": _first_float(r"Distance:\s*(\d+(?:\.\d+)?)\s*km", payload),
        "average_pace": _first_text(r"Average Pace:\s*([^\n]+)", payload),
        "moving_average_pace": _first_text(r"Moving Average Pace:\s*([^\n]+)", payload),
        "adjusted_pace": _first_text(r"Adjusted Pace:\s*([^\n]+)", payload),
        "average_speed_kmh": _first_float(r"Average Speed:\s*(\d+(?:\.\d+)?)\s*km/h", payload),
        "moving_average_speed_kmh": _first_float(r"Moving Average Speed:\s*(\d+(?:\.\d+)?)\s*km/h", payload),
        "average_power_watts": _first_int(r"Average Power:\s*(\d+)\s*(?:W|watts?)", payload),
        "normalized_power_watts": _first_int(r"(?:Normalized Power|NP):\s*(\d+)\s*(?:W|watts?)", payload),
        "max_20_min_power_watts": _first_int(r"Max(?:imum)? 20 min(?:ute)? Power:\s*(\d+)\s*(?:W|watts?)", payload),
        "average_hr_bpm": _first_int(r"Average Heart Rate:\s*(\d+)\s*bpm", payload),
        "average_cadence": _first_int(r"Average Cadence:\s*(\d+)", payload),
        "elevation_gain_m": _first_int(r"Elevation Gain / Loss:\s*(\d+)\s*m", payload),
        "calories": _first_int(r"Calories:\s*(\d+)\s*kcal", payload),
        "training_load": _first_float(r"Training Load:\s*(\d+(?:\.\d+)?)", payload),
        "efficiency_factor": _first_float(r"Efficiency Factor:\s*(\d+(?:\.\d+)?)", payload),
        "variation_index": _first_float(r"Variation Index:\s*(\d+(?:\.\d+)?)", payload),
    }
    return {key: value for key, value in activity.items() if value is not None}


def _parse_training_load_entry(payload: str, target_date: date) -> dict:
    date_text = target_date.isoformat()
    pattern = (
        rf"{re.escape(date_text)}\s+"
        r"Comment:\s*(?P<comment>[^\n]+)\s+"
        r"Short-Term Load:\s*(?P<short>\d+)\s+"
        r"Long-Term Load:\s*(?P<long>\d+)\s+"
        r"Load Ratio:\s*(?P<ratio>\d+(?:\.\d+)?)"
    )
    match = re.search(pattern, payload)
    if not match:
        return {}
    return {
        "comment": match.group("comment").strip(),
        "short_term_load": int(match.group("short")),
        "long_term_load": int(match.group("long")),
        "load_ratio": float(match.group("ratio")),
    }


def _parse_sport_records(payload: str) -> list[dict]:
    activities: list[dict] = []
    blocks = re.split(r"\n\s*\d+\.\s+", "\n" + payload)

    for block in blocks:
        header = re.search(r"(?P<sport>[A-Za-z ]+)\s+(?:--|—)\s+(?P<date>\d{4}-\d{2}-\d{2})", block)
        label_id = _first_text(r"LabelId:\s*(\d+)", block)
        sport_code = _first_int(r"SportType:\s*(\d+)", block)
        if not header or not label_id or sport_code is None:
            continue

        activity = {
            "date": date.fromisoformat(header.group("date")),
            "sport": header.group("sport").strip(),
            "sport_code": sport_code,
            "label_id": label_id,
            "location": _first_text(r"Location:\s*([^\n]+)", block),
            "duration": _first_text(r"Duration:\s*([^|]+)", block),
            "duration_minutes": _duration_to_minutes(_first_text(r"Duration:\s*([^|]+)", block)),
            "distance_km": _first_float(r"Distance:\s*(\d+(?:\.\d+)?)\s*km", block),
            "average_pace": _first_text(r"Average Pace:\s*([^|]+)", block),
            "average_speed_kmh": _first_float(r"Average Speed:\s*(\d+(?:\.\d+)?)\s*km/h", block),
            "average_hr_bpm": _first_int(r"Avg HR:\s*(\d+)\s*bpm", block),
            "calories": _first_int(r"Calories:\s*(\d+)\s*kcal", block),
        }
        activities.append(activity)

    return activities


def _duration_to_minutes(value: str | None) -> int | None:
    if not value:
        return None
    parts = [int(part) for part in value.strip().split(":")]
    if len(parts) == 3:
        hours, minutes, seconds = parts
    elif len(parts) == 2:
        hours, minutes, seconds = 0, parts[0], parts[1]
    else:
        return None
    return round(hours * 60 + minutes + seconds / 60)


def _first_text(pattern: str, payload: str) -> str | None:
    match = re.search(pattern, payload)
    return match.group(1).strip() if match else None


def _first_int(pattern: str, payload: str) -> int | None:
    value = _first_text(pattern, payload)
    return int(value) if value is not None else None


def _first_float(pattern: str, payload: str) -> float | None:
    value = _first_text(pattern, payload)
    return float(value) if value is not None else None
