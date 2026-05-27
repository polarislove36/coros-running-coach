from __future__ import annotations

import argparse
from pathlib import Path

from multisport_ai_coach.data.payload_bundle import (
    create_payload_bundle,
    format_payload_bundle_summary,
    live_demo_command,
    summarize_payload_bundle,
    validate_payload_bundle,
)


def main() -> None:
    args = parse_args()
    root = Path(args.bundle)

    if args.command == "init":
        bundle = create_payload_bundle(root)
        print(f"Created COROS payload bundle: {bundle.root}")
        return

    if args.command == "validate":
        validation = validate_payload_bundle(root)
        print(f"valid={validation.valid}")
        if validation.missing_files:
            print("missing=" + ", ".join(validation.missing_files))
        print(f"activity_detail_files={len(validation.detail_files)}")
        return

    if args.command == "command":
        print(live_demo_command(root, start_date=args.start_date, output_format=args.format))
        return

    if args.command == "summary":
        print(format_payload_bundle_summary(summarize_payload_bundle(root)))
        return

    raise SystemExit(f"Unknown command: {args.command}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Manage local COROS MCP payload bundles.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="Create an empty payload bundle.")
    init_parser.add_argument("--bundle", required=True)

    validate_parser = subparsers.add_parser("validate", help="Validate a payload bundle.")
    validate_parser.add_argument("--bundle", required=True)

    command_parser = subparsers.add_parser("command", help="Print a coros_live_demo command for this bundle.")
    command_parser.add_argument("--bundle", required=True)
    command_parser.add_argument("--start-date", default="2026-05-26")
    command_parser.add_argument("--format", choices=("markdown", "json", "both"), default="markdown")

    summary_parser = subparsers.add_parser("summary", help="Print bundle completeness summary.")
    summary_parser.add_argument("--bundle", required=True)

    return parser.parse_args()


if __name__ == "__main__":
    main()
