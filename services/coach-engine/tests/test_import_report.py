from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory

from multisport_ai_coach.analysis import TrainingLoadEstimator
from multisport_ai_coach.data.import_report import build_data_import_report, format_data_import_report
from multisport_ai_coach.data.payload_bundle import create_payload_bundle, summarize_payload_bundle
from multisport_ai_coach.domain import ReadinessSnapshot


def test_data_import_report_summarizes_bundle_and_load_sources() -> None:
    activities = [
        {
            "label_id": "1",
            "sport_code": 200,
            "duration_minutes": 188,
            "average_hr_bpm": 140,
        }
    ]
    enriched = [{**activities[0], "normalized_power_watts": 127}]
    estimates = TrainingLoadEstimator().estimate_many(enriched, ftp_watts=194)

    with TemporaryDirectory() as tmp:
        root = Path(tmp) / "coros"
        create_payload_bundle(root)
        (root / "sport_records.txt").write_text("payload", encoding="utf-8")
        summary = summarize_payload_bundle(root)
        report = build_data_import_report(
            activities=activities,
            enriched_activities=enriched,
            readiness=ReadinessSnapshot(
                date=date(2026, 5, 26),
                notes=("COROS recovery payload missing.", "COROS training load payload missing."),
            ),
            load_estimates=estimates,
            bundle_summary=summary,
        )

    notes = format_data_import_report(report)

    assert report.bundle_valid is False
    assert report.parsed_activity_count == 1
    assert report.enriched_activity_count == 1
    assert report.load_source_counts["power"] == 1
    assert "power_activities=1" in notes[1]
    assert "training_load.txt empty" in notes[1]
