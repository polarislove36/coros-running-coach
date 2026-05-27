from datetime import date

from multisport_ai_coach.domain import SportType, TrainingPlan, TrainingSession, WorkoutStage
from multisport_ai_coach.output.ics import render_ics_calendar


def test_ics_calendar_renders_training_and_rest_events() -> None:
    plan = TrainingPlan(
        title="Week 1",
        sessions=[
            TrainingSession(
                day="Tuesday",
                sport=SportType.TRAIL_RUNNING,
                title="Trail skills easy run",
                duration_minutes=45,
                intensity="easy",
                purpose="Practice foot placement.",
                downgrade="Walk instead if sore.",
                target_zone="HR Z1-Z2",
                phases=("10 min warm-up", "30 min easy trail run", "5 min cool-down"),
                workout_stages=(
                    WorkoutStage("Warm-up", 10, heart_rate_zone="Z1"),
                    WorkoutStage(
                        "Trail run",
                        30,
                        heart_rate_zone="Z1-Z2",
                        cadence="Quick relaxed steps",
                        instructions=("Focus on foot placement.",),
                    ),
                    WorkoutStage("Cool-down", 5, heart_rate_zone="Z1"),
                ),
            ),
            TrainingSession(
                day="Saturday",
                sport=SportType.RECOVERY,
                title="Protected rest day",
                duration_minutes=0,
                intensity="rest",
                purpose="Recovery.",
                target_zone="Rest",
                phases=("No structured training.",),
                workout_stages=(WorkoutStage("Rest", 0, instructions=("No structured training.",)),),
            ),
        ],
    )

    ics = _unfold(render_ics_calendar([plan], start_date=date(2026, 5, 26)))

    assert "BEGIN:VCALENDAR" in ics
    assert "SUMMARY:Trail: Trail skills easy run" in ics
    assert "DTSTART:20260526T070000" in ics
    assert "DTEND:20260526T074500" in ics
    assert "SUMMARY:Recovery: Protected rest day" in ics
    assert "DTSTART;VALUE=DATE:20260530" in ics
    assert "运动项目：Trail" in ics
    assert "训练总时长：45 min" in ics
    assert "训练阶段：" in ics
    assert "1. Warm-up：10min" in ics
    assert "2. Trail run：30min" in ics
    assert "强度：心率 Z1-Z2" in ics
    assert "要求：踏频/步频 Quick relaxed steps；Focus on foot placement." in ics
    assert "Purpose:" not in ics
    assert "Downgrade:" not in ics


def test_ics_calendar_maps_next_week_sessions() -> None:
    plans = [
        TrainingPlan(
            title="Week 1",
            sessions=[
                TrainingSession("Tuesday", SportType.CYCLING, "Ride", 60, "easy", "Endurance."),
            ],
        ),
        TrainingPlan(
            title="Week 2",
            sessions=[
                TrainingSession("Tuesday", SportType.CYCLING, "Ride", 60, "easy", "Endurance."),
            ],
        ),
    ]

    ics = _unfold(render_ics_calendar(plans, start_date=date(2026, 5, 26)))

    assert "DTSTART:20260526T070000" in ics
    assert "DTSTART:20260602T070000" in ics


def test_ics_calendar_renders_precise_power_targets() -> None:
    plan = TrainingPlan(
        title="Bike week",
        sessions=[
            TrainingSession(
                day="Wednesday",
                sport=SportType.CYCLING,
                title="Endurance ride",
                duration_minutes=30,
                intensity="easy",
                purpose="Endurance.",
                workout_stages=(
                    WorkoutStage("Warm-up", 5, power_zone="Z1 <= 107W", cadence="90 rpm"),
                    WorkoutStage("Endurance", 20, power_zone="Z2 109-146W", cadence="90 rpm"),
                    WorkoutStage("Cool-down", 5, power_zone="Z1 <= 107W", cadence="Natural easy spin"),
                ),
            )
        ],
    )

    ics = _unfold(render_ics_calendar([plan], start_date=date(2026, 5, 26)))

    assert "强度：功率 Z1 <= 107W" in ics
    assert "强度：功率 Z2 109-146W" in ics


def test_ics_calendar_renders_compact_repeat_prescription() -> None:
    plan = TrainingPlan(
        title="Trail week",
        sessions=[
            TrainingSession(
                day="Thursday",
                sport=SportType.TRAIL_RUNNING,
                title="Hill reps",
                duration_minutes=72,
                intensity="hill reps",
                purpose="Climbing.",
                workout_stages=(
                    WorkoutStage(
                        "重复爬坡",
                        42,
                        heart_rate_zone="Z3/Z1",
                        incline="10%",
                        cadence="短步幅、快步频",
                        instructions=("6*(4min Z3爬坡 + 3min Z1恢复)",),
                    ),
                ),
            )
        ],
    )

    ics = _unfold(render_ics_calendar([plan], start_date=date(2026, 5, 26)))

    assert "1. 重复爬坡：42min" in ics
    assert "6*(4min Z3爬坡 + 3min Z1恢复)" in ics
    assert "坡度 10%" in ics


def test_ics_calendar_avoids_ambiguous_execution_ranges() -> None:
    plan = TrainingPlan(
        title="Precision week",
        sessions=[
            TrainingSession(
                day="Thursday",
                sport=SportType.TRAIL_RUNNING,
                title="Precise hill reps",
                duration_minutes=62,
                intensity="hill reps",
                purpose="Climbing.",
                workout_stages=(
                    WorkoutStage("Warm-up", 15, heart_rate_zone="Z1-Z2", incline="4%"),
                    WorkoutStage(
                        "重复爬坡",
                        42,
                        heart_rate_zone="Z3/Z1",
                        incline="10%",
                        cadence="短步幅、快步频",
                        instructions=("6*(4min Z3爬坡 + 3min Z1恢复)",),
                    ),
                    WorkoutStage("Cool-down", 5, heart_rate_zone="Z1", incline="2%"),
                ),
            )
        ],
    )

    ics = _unfold(render_ics_calendar([plan], start_date=date(2026, 5, 26)))

    for ambiguous in ("2-3", "5-10", "10-15", "8-15%", "85-95 rpm", "100-110 rpm", "90-100 rpm"):
        assert ambiguous not in ics


def test_structured_stage_durations_match_session_total() -> None:
    session = TrainingSession(
        day="Thursday",
        sport=SportType.TRAIL_RUNNING,
        title="Precise hill reps",
        duration_minutes=72,
        intensity="hill reps",
        purpose="Climbing.",
        workout_stages=(
            WorkoutStage("Warm-up", 15, heart_rate_zone="Z1-Z2", incline="4%"),
            WorkoutStage(
                "重复爬坡",
                42,
                heart_rate_zone="Z3/Z1",
                incline="10%",
                cadence="短步幅、快步频",
                instructions=("6*(4min Z3爬坡 + 3min Z1恢复)",),
            ),
            WorkoutStage("Aerobic finish", 10, heart_rate_zone="Z1-Z2", incline="6%"),
            WorkoutStage("Cool-down", 5, heart_rate_zone="Z1", incline="2%"),
        ),
    )

    assert sum(stage.duration_minutes for stage in session.workout_stages) == session.duration_minutes


def _unfold(value: str) -> str:
    return value.replace("\r\n ", "")
