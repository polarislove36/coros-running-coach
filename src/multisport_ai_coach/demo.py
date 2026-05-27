from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
from typing import Iterable

from multisport_ai_coach.analysis import DisciplineReadinessAnalyzer, TrainingHistoryAnalyzer, TrainingLoadEstimator
from multisport_ai_coach.domain import (
    BodyMetrics,
    EventPriority,
    EventType,
    FuelingProfile,
    HeartRateProfile,
    HeartRateZone,
    RaceEvent,
    ReadinessSnapshot,
    SportType,
    TrainingAvailability,
    TrainingEnvironment,
    TrailRunningExperience,
    UserProfile,
)
from multisport_ai_coach.data import DEFAULT_DATA_SYNC_POLICY, CorosDataSource, InMemoryCorosDataSource
from multisport_ai_coach.orchestration.orchestrator import PlanOrchestrator
from multisport_ai_coach.output.json import render_json
from multisport_ai_coach.output.ics import render_ics_calendar
from multisport_ai_coach.output.markdown import render_markdown

RECENT_DEMO_SPORT_CODES = (100, 102, 200, 201)


def build_demo_profile() -> UserProfile:
    return UserProfile(
        athlete_id="demo-athlete",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        preferred_rest_days=("Saturday",),
        body=BodyMetrics(height_cm=178, weight_kg=70, birth_year=1986, weight_goal="lose_weight"),
        availability=TrainingAvailability(
            weekly_hours_min=8,
            weekly_hours_max=10,
            accepts_two_a_day=True,
            max_two_a_day_days_per_week=3,
            two_a_day_allowed_days=("Monday", "Tuesday", "Wednesday"),
        ),
        environment=TrainingEnvironment(
            outdoor_climbs_available=False,
            treadmill_available=True,
            stairs_available=True,
            notes=("No regular outdoor climbing access.",),
        ),
        fueling=FuelingProfile(
            carb_tolerance_g_per_hour_min=80,
            carb_tolerance_g_per_hour_max=90,
            preferred_sources=("gel", "glucose+maltodextrin drink", "some solid food"),
            solid_food_ok=True,
            notes=("No known GI issues during races.",),
        ),
        trail_experience=TrailRunningExperience(
            longest_distance_km=100,
            max_elevation_gain_m=6000,
            longest_duration_hours_min=6,
            longest_duration_hours_max=10,
            tune_up_races_as_training=True,
        ),
        current_soreness=("normal quadriceps soreness",),
        primary_sports=(SportType.RUNNING, SportType.CYCLING),
        ftp_watts=194,
        threshold_pace="4:44/km",
        heart_rate=HeartRateProfile(
            max_hr_bpm=185,
            zones=(
                HeartRateZone("Z1", 111, 130),
                HeartRateZone("Z2", 131, 148),
                HeartRateZone("Z3", 149, 166),
                HeartRateZone("Z4", 167, 176),
                HeartRateZone("Z5", 177, 185),
            ),
        ),
    )


def build_demo_events() -> list[RaceEvent]:
    return [
        RaceEvent(
            name="July 120K Trail Race",
            event_type=EventType.TRAIL_RACE,
            date=date(2026, 7, 17),
            priority=EventPriority.A,
            target="finish within 30 hours",
            distance_km=120,
            elevation_gain_m=8000,
        ),
        RaceEvent(
            name="October Triathlon Relay Bike Leg",
            event_type=EventType.ROAD_CYCLING,
            date=date(2026, 10, 24),
            priority=EventPriority.B,
            target="90km non-drafting bike leg within 2:45",
            distance_km=90,
        ),
    ]


def build_demo_readiness() -> ReadinessSnapshot:
    return ReadinessSnapshot(
        date=date(2026, 5, 26),
        recovery_percent=100,
        hrv_status="normal",
        sleep_score=61,
        short_term_load=800,
        long_term_load=452,
        load_ratio=1.77,
        notes=("Recent 36.62km trail race caused high short-term load.",),
    )


def build_demo_coros_source() -> CorosDataSource:
    return InMemoryCorosDataSource(
        readiness=build_demo_readiness(),
        activities=[
            {
                "date": date(2026, 5, 23),
                "sport": "Trail Run",
                "sport_code": 102,
                "duration_minutes": 402,
                "distance_km": 36.62,
                "elevation_gain_m": 1984,
                "training_load": 800,
                "average_pace": "10:58 /km",
                "average_hr_bpm": 142,
                "label_id": "477684059653308615",
            },
            {
                "date": date(2026, 5, 17),
                "sport": "Cycling",
                "sport_code": 200,
                "duration_minutes": 188,
                "distance_km": 89.78,
                "elevation_gain_m": 146,
                "average_power_watts": 119,
                "normalized_power_watts": 127,
                "average_speed_kmh": 28.7,
                "average_hr_bpm": 161,
                "label_id": "477544674276442313",
            },
        ],
    )


def build_demo_plans(start_date: date, weeks: int) -> list:
    profile = build_demo_profile()
    events = build_demo_events()
    coros_source = build_demo_coros_source()
    orchestrator = PlanOrchestrator()
    history_analyzer = TrainingHistoryAnalyzer()
    readiness_analyzer = DisciplineReadinessAnalyzer()
    load_estimator = TrainingLoadEstimator()
    plans = []

    for week_index in range(weeks):
        week_start = date.fromordinal(start_date.toordinal() + week_index * 7)
        readiness = coros_source.get_readiness(week_start)
        history_start = DEFAULT_DATA_SYNC_POLICY.history_start(week_start)
        recent_activities = coros_source.get_recent_activities(
            history_start, week_start, RECENT_DEMO_SPORT_CODES
        )
        history_profile = history_analyzer.build_profile(recent_activities, history_start, week_start)
        discipline_readiness = readiness_analyzer.build_profile(recent_activities)
        load_estimates = load_estimator.estimate_many(recent_activities, ftp_watts=profile.ftp_watts)
        plan = orchestrator.build_week_plan(
            week_start,
            profile,
            events,
            readiness,
            recent_activities,
            history_profile,
            discipline_readiness,
            load_estimates,
        )
        plan.title = f"Multi-sport weekly plan - week {week_index + 1}"
        plan.notes.insert(0, f"Week start: {week_start.isoformat()}")
        plans.append(plan)

    return plans


def render_plans(plans: Iterable, output_format: str, *, start_date: date | None = None) -> str:
    plan_list = list(plans)
    if output_format == "ics":
        if start_date is None:
            raise ValueError("start_date is required for ICS output")
        return render_ics_calendar(plan_list, start_date=start_date)

    if output_format == "json":
        if len(plan_list) == 1:
            return render_json(plan_list[0])
        return render_json({"plans": plan_list})

    rendered = []
    for plan in plan_list:
        rendered.append(render_markdown(plan))
    markdown = "\n\n---\n\n".join(rendered)
    if output_format == "both":
        json_output = render_json(plan_list[0] if len(plan_list) == 1 else {"plans": plan_list})
        return f"{markdown}\n\n---\n\n```json\n{json_output}\n```"
    return markdown


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a demo multi-sport AI coach training plan.")
    parser.add_argument("--weeks", type=int, default=1, help="Number of future weeks to generate.")
    parser.add_argument(
        "--start-date",
        default="2026-05-26",
        help="Plan start date in YYYY-MM-DD format. Defaults to the demo date.",
    )
    parser.add_argument(
        "--format",
        choices=("markdown", "json", "both", "ics"),
        default="markdown",
        help="Output format.",
    )
    parser.add_argument("--output", help="Optional output file path. Prints to stdout when omitted.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.weeks < 1:
        raise SystemExit("--weeks must be 1 or greater")

    plans = build_demo_plans(date.fromisoformat(args.start_date), args.weeks)
    start_date = date.fromisoformat(args.start_date)
    output = render_plans(plans, args.format, start_date=start_date)
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output, encoding="utf-8")
    else:
        print(output)


if __name__ == "__main__":
    main()
