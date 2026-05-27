from __future__ import annotations

from dataclasses import dataclass

from multisport_ai_coach.data.payload_bundle import PayloadBundleSummary
from multisport_ai_coach.domain import ReadinessSnapshot


@dataclass(frozen=True)
class DataImportReport:
    bundle_valid: bool | None
    parsed_activity_count: int
    enriched_activity_count: int
    missing_recovery_payload: bool
    missing_training_load_payload: bool
    load_source_counts: dict[str, int]
    power_activity_count: int
    heart_rate_activity_count: int
    payload_gaps: tuple[str, ...]


def build_data_import_report(
    *,
    activities: list[dict],
    enriched_activities: list[dict],
    readiness: ReadinessSnapshot,
    load_estimates: list,
    bundle_summary: PayloadBundleSummary | None = None,
) -> DataImportReport:
    missing_recovery = _has_note(readiness, "COROS recovery payload missing.")
    missing_training_load = _has_note(readiness, "COROS training load payload missing.")
    gaps: list[str] = []

    if bundle_summary is not None:
        gaps.extend(f"{name} missing" for name in bundle_summary.missing_files)
        gaps.extend(f"{name} empty" for name in bundle_summary.empty_files)
    if missing_recovery and "recovery.txt empty" not in gaps:
        gaps.append("recovery payload missing")
    if missing_training_load and "training_load.txt empty" not in gaps:
        gaps.append("training load payload missing")

    return DataImportReport(
        bundle_valid=bundle_summary.valid if bundle_summary is not None else None,
        parsed_activity_count=len(activities),
        enriched_activity_count=_count_enriched_activities(activities, enriched_activities),
        missing_recovery_payload=missing_recovery,
        missing_training_load_payload=missing_training_load,
        load_source_counts=_count_load_sources(load_estimates),
        power_activity_count=sum(1 for activity in enriched_activities if _has_power(activity)),
        heart_rate_activity_count=sum(1 for activity in enriched_activities if activity.get("average_hr_bpm") is not None),
        payload_gaps=tuple(gaps),
    )


def format_data_import_report(report: DataImportReport) -> tuple[str, ...]:
    bundle_state = "not provided" if report.bundle_valid is None else ("valid" if report.bundle_valid else "incomplete")
    gaps = ", ".join(report.payload_gaps) if report.payload_gaps else "none"
    sources = ", ".join(
        f"{source}={count}" for source, count in sorted(report.load_source_counts.items()) if count
    ) or "none"
    return (
        (
            "Data import: "
            f"bundle={bundle_state}; parsed_activities={report.parsed_activity_count}; "
            f"enriched_activity_details={report.enriched_activity_count}."
        ),
        (
            "Data quality: "
            f"power_activities={report.power_activity_count}; "
            f"heart_rate_activities={report.heart_rate_activity_count}; payload_gaps={gaps}."
        ),
        f"Training-load sources: {sources}.",
    )


def _has_note(readiness: ReadinessSnapshot, text: str) -> bool:
    return any(text in note for note in readiness.notes)


def _count_enriched_activities(activities: list[dict], enriched_activities: list[dict]) -> int:
    count = 0
    for original, enriched in zip(activities, enriched_activities):
        if set(enriched) - set(original):
            count += 1
    return count


def _count_load_sources(load_estimates: list) -> dict[str, int]:
    counts: dict[str, int] = {}
    for estimate in load_estimates:
        source = getattr(estimate, "source", "unknown")
        counts[source] = counts.get(source, 0) + 1
    return counts


def _has_power(activity: dict) -> bool:
    return activity.get("average_power_watts") is not None or activity.get("normalized_power_watts") is not None
