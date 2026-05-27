from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


REQUIRED_PAYLOAD_FILES = ("recovery.txt", "training_load.txt", "sport_records.txt")
DETAILS_DIR = "activity_details"


@dataclass(frozen=True)
class PayloadBundle:
    root: Path

    @property
    def recovery(self) -> Path:
        return self.root / "recovery.txt"

    @property
    def training_load(self) -> Path:
        return self.root / "training_load.txt"

    @property
    def sport_records(self) -> Path:
        return self.root / "sport_records.txt"

    @property
    def details_dir(self) -> Path:
        return self.root / DETAILS_DIR


@dataclass(frozen=True)
class PayloadBundleValidation:
    valid: bool
    missing_files: tuple[str, ...]
    detail_files: tuple[Path, ...]


@dataclass(frozen=True)
class PayloadFileStatus:
    path: Path
    exists: bool
    bytes: int
    empty: bool


@dataclass(frozen=True)
class PayloadBundleSummary:
    root: Path
    valid: bool
    required_files: tuple[PayloadFileStatus, ...]
    missing_files: tuple[str, ...]
    empty_files: tuple[str, ...]
    detail_file_count: int


def create_payload_bundle(root: Path) -> PayloadBundle:
    bundle = PayloadBundle(root=root)
    bundle.root.mkdir(parents=True, exist_ok=True)
    bundle.details_dir.mkdir(parents=True, exist_ok=True)
    for filename in REQUIRED_PAYLOAD_FILES:
        path = bundle.root / filename
        if not path.exists():
            path.write_text("", encoding="utf-8")
    readme = bundle.root / "README.md"
    if not readme.exists():
        readme.write_text(_bundle_readme(), encoding="utf-8")
    return bundle


def validate_payload_bundle(root: Path) -> PayloadBundleValidation:
    bundle = PayloadBundle(root=root)
    missing = tuple(filename for filename in REQUIRED_PAYLOAD_FILES if not (bundle.root / filename).exists())
    detail_files = tuple(sorted(bundle.details_dir.glob("*.txt"))) if bundle.details_dir.exists() else ()
    return PayloadBundleValidation(valid=not missing, missing_files=missing, detail_files=detail_files)


def summarize_payload_bundle(root: Path) -> PayloadBundleSummary:
    bundle = PayloadBundle(root=root)
    required_statuses = tuple(_file_status(bundle.root / filename) for filename in REQUIRED_PAYLOAD_FILES)
    missing = tuple(status.path.name for status in required_statuses if not status.exists)
    empty = tuple(status.path.name for status in required_statuses if status.exists and status.empty)
    detail_count = len(tuple(bundle.details_dir.glob("*.txt"))) if bundle.details_dir.exists() else 0
    return PayloadBundleSummary(
        root=root,
        valid=not missing and not empty,
        required_files=required_statuses,
        missing_files=missing,
        empty_files=empty,
        detail_file_count=detail_count,
    )


def format_payload_bundle_summary(summary: PayloadBundleSummary) -> str:
    lines = [
        f"bundle={summary.root}",
        f"valid={summary.valid}",
    ]
    for status in summary.required_files:
        state = "missing" if not status.exists else ("empty" if status.empty else "ok")
        lines.append(f"{status.path.name}: {state} ({status.bytes} bytes)")
    lines.append(f"activity_detail_files={summary.detail_file_count}")
    return "\n".join(lines)


def live_demo_command(root: Path, *, start_date: str = "2026-05-26", output_format: str = "markdown") -> str:
    bundle = PayloadBundle(root=root)
    parts = [
        "PYTHONPATH=src python3 -m multisport_ai_coach.coros_live_demo",
        f"--bundle {bundle.root}",
        f"--start-date {start_date}",
        f"--format {output_format}",
    ]
    return " \\\n  ".join(parts)


def activity_detail_specs(root: Path) -> tuple[tuple[str, int, Path], ...]:
    bundle = PayloadBundle(root=root)
    if not bundle.details_dir.exists():
        return ()
    specs: list[tuple[str, int, Path]] = []
    for detail in sorted(bundle.details_dir.glob("*.txt")):
        spec = _detail_spec_from_filename(detail)
        if spec:
            label_id, sport_type_text = spec.split(":", 1)
            specs.append((label_id, int(sport_type_text), detail))
    return tuple(specs)


def _detail_spec_from_filename(path: Path) -> str | None:
    stem = path.stem
    pieces = stem.split("_")
    if len(pieces) < 2:
        return None
    label_id = pieces[0]
    sport_type = pieces[1]
    if not label_id.isdigit() or not sport_type.isdigit():
        return None
    return f"{label_id}:{sport_type}"


def _file_status(path: Path) -> PayloadFileStatus:
    exists = path.exists()
    size = path.stat().st_size if exists else 0
    return PayloadFileStatus(path=path, exists=exists, bytes=size, empty=exists and size == 0)


def _bundle_readme() -> str:
    return """# COROS Payload Bundle

Paste captured COROS MCP text outputs into:

- recovery.txt
- training_load.txt
- sport_records.txt

Optional activity details go into activity_details/ using:

LABELID_SPORTTYPE.txt

Example:

477684059653308615_102.txt
"""
