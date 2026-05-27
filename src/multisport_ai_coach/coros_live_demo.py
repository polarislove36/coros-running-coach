from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
from typing import Iterable

from multisport_ai_coach.analysis import DisciplineReadinessAnalyzer, TrainingHistoryAnalyzer, TrainingLoadEstimator
from multisport_ai_coach.data import (
    DEFAULT_DATA_SYNC_POLICY,
    CorosTextPayloadDataSource,
    build_data_import_report,
    format_data_import_report,
)
from multisport_ai_coach.data.coros import parse_activity_detail_text
from multisport_ai_coach.data.payload_bundle import (
    PayloadBundle,
    activity_detail_specs,
    format_payload_bundle_summary,
    summarize_payload_bundle,
)
from multisport_ai_coach.demo import RECENT_DEMO_SPORT_CODES, build_demo_events, build_demo_profile, render_plans
from multisport_ai_coach.orchestration.orchestrator import PlanOrchestrator


def main() -> None:
    args = parse_args()
    start_date = date.fromisoformat(args.start_date)
    profile = build_demo_profile()
    events = build_demo_events()
    bundle = PayloadBundle(Path(args.bundle)) if args.bundle else None
    bundle_summary = summarize_payload_bundle(bundle.root) if bundle is not None else None
    if bundle is not None and not args.allow_incomplete:
        if bundle_summary is not None and not bundle_summary.valid:
            raise SystemExit(
                "Payload bundle is incomplete. Use --allow-incomplete to run anyway.\n"
                + format_payload_bundle_summary(bundle_summary)
            )
    source = CorosTextPayloadDataSource(
        recovery_text=_read_optional(args.recovery or (str(bundle.recovery) if bundle else None)),
        training_load_text=_read_optional(args.training_load or (str(bundle.training_load) if bundle else None)),
        sport_records_text=_read_required(args.sport_records or (str(bundle.sport_records) if bundle else None)),
        activity_details=_load_activity_details(args.activity_detail, bundle),
    )

    history_start = DEFAULT_DATA_SYNC_POLICY.history_start(start_date)
    recent_activities = source.get_recent_activities(history_start, start_date, RECENT_DEMO_SPORT_CODES)
    enriched_activities = _enrich_activities(source, recent_activities)

    readiness = source.get_readiness(start_date)
    history_profile = TrainingHistoryAnalyzer().build_profile(enriched_activities, history_start, start_date)
    discipline_readiness = DisciplineReadinessAnalyzer().build_profile(enriched_activities)
    load_estimates = TrainingLoadEstimator().estimate_many(enriched_activities, ftp_watts=profile.ftp_watts)
    import_report = build_data_import_report(
        activities=recent_activities,
        enriched_activities=enriched_activities,
        readiness=readiness,
        load_estimates=load_estimates,
        bundle_summary=bundle_summary,
    )

    plan = PlanOrchestrator().build_week_plan(
        start_date,
        profile,
        events,
        readiness,
        enriched_activities,
        history_profile,
        discipline_readiness,
        load_estimates,
    )
    plan.title = "COROS live-data weekly plan"
    plan.notes.insert(0, f"Week start: {start_date.isoformat()}")
    for note in reversed(format_data_import_report(import_report)):
        plan.notes.insert(1, note)
    output = render_plans([plan], args.format, start_date=start_date)
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output, encoding="utf-8")
    else:
        print(output)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a plan from captured COROS MCP text payloads.")
    parser.add_argument("--bundle", help="Path to a standard COROS payload bundle.")
    parser.add_argument("--recovery", help="Path to queryRecoveryStatus text output.")
    parser.add_argument("--training-load", help="Path to queryTrainingLoadAssessment text output.")
    parser.add_argument("--sport-records", help="Path to querySportRecords text output.")
    parser.add_argument(
        "--activity-detail",
        action="append",
        default=[],
        metavar="LABEL_ID:SPORT_TYPE:PATH",
        help="Optional activity detail payload. Can be repeated.",
    )
    parser.add_argument("--start-date", default="2026-05-26", help="Plan start date in YYYY-MM-DD format.")
    parser.add_argument("--format", choices=("markdown", "json", "both", "ics"), default="markdown")
    parser.add_argument("--output", help="Optional output file path. Prints to stdout when omitted.")
    parser.add_argument("--allow-incomplete", action="store_true", help="Allow running with missing or empty bundle files.")
    return parser.parse_args()


def _read_optional(path: str | None) -> str:
    if path is None:
        return ""
    return Path(path).read_text(encoding="utf-8")


def _read_required(path: str | None) -> str:
    if path is None:
        raise SystemExit("Either --bundle or --sport-records is required.")
    return Path(path).read_text(encoding="utf-8")


def _load_activity_details(specs: Iterable[str], bundle: PayloadBundle | None) -> dict[tuple[str, int], dict]:
    details: dict[tuple[str, int], dict] = {}
    if bundle is not None:
        for label_id, sport_type, path in activity_detail_specs(bundle.root):
            details[(label_id, sport_type)] = parse_activity_detail_text(
                label_id, sport_type, path.read_text(encoding="utf-8")
            )
    for spec in specs:
        label_id, sport_type_text, path = spec.split(":", 2)
        sport_type = int(sport_type_text)
        details[(label_id, sport_type)] = parse_activity_detail_text(
            label_id, sport_type, Path(path).read_text(encoding="utf-8")
        )
    return details


def _enrich_activities(source: CorosTextPayloadDataSource, activities: list[dict]) -> list[dict]:
    enriched: list[dict] = []
    for activity in activities:
        label_id = activity.get("label_id")
        sport_code = activity.get("sport_code")
        if not label_id or sport_code is None:
            enriched.append(activity)
            continue
        try:
            detail = source.get_activity_detail(str(label_id), int(sport_code))
        except KeyError:
            enriched.append(activity)
            continue
        enriched.append({**activity, **detail})
    return enriched


if __name__ == "__main__":
    main()
