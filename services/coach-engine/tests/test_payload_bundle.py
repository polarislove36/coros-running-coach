from pathlib import Path
from tempfile import TemporaryDirectory

from multisport_ai_coach.data.payload_bundle import (
    activity_detail_specs,
    create_payload_bundle,
    format_payload_bundle_summary,
    live_demo_command,
    summarize_payload_bundle,
    validate_payload_bundle,
)


def test_payload_bundle_init_and_validate() -> None:
    with TemporaryDirectory() as tmp:
        root = Path(tmp) / "coros"
        create_payload_bundle(root)
        validation = validate_payload_bundle(root)

        assert validation.valid is True
        assert (root / "recovery.txt").exists()
        assert (root / "training_load.txt").exists()
        assert (root / "sport_records.txt").exists()
        assert (root / "activity_details").exists()
        assert summarize_payload_bundle(root).valid is False


def test_live_demo_command_includes_detail_specs() -> None:
    with TemporaryDirectory() as tmp:
        root = Path(tmp) / "coros"
        create_payload_bundle(root)
        detail = root / "activity_details" / "477684059653308615_102.txt"
        detail.write_text("Workout Time: 6:41:47", encoding="utf-8")

        command = live_demo_command(root, start_date="2026-05-26", output_format="json")

        assert "--format json" in command
        assert f"--bundle {root}" in command
        assert activity_detail_specs(root)[0][0] == "477684059653308615"


def test_payload_bundle_summary_detects_filled_required_files() -> None:
    with TemporaryDirectory() as tmp:
        root = Path(tmp) / "coros"
        create_payload_bundle(root)
        for filename in ("recovery.txt", "training_load.txt", "sport_records.txt"):
            (root / filename).write_text("payload", encoding="utf-8")

        summary = summarize_payload_bundle(root)

        assert summary.valid is True
        assert summary.empty_files == ()
        assert all(status.bytes > 0 for status in summary.required_files)


def test_payload_bundle_summary_formats_status() -> None:
    with TemporaryDirectory() as tmp:
        root = Path(tmp) / "coros"
        create_payload_bundle(root)

        text = format_payload_bundle_summary(summarize_payload_bundle(root))

        assert "valid=False" in text
        assert "recovery.txt: empty" in text
