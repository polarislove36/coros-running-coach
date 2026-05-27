from multisport_ai_coach.analysis import PlanQualityValidator
from multisport_ai_coach.domain import SportType, TrainingPlan, TrainingSession, WorkoutStage


def test_plan_quality_passes_precise_structured_session() -> None:
    plan = TrainingPlan(
        title="Run week",
        sessions=[
            TrainingSession(
                day="Thursday",
                sport=SportType.RUNNING,
                title="控制节奏跑",
                duration_minutes=55,
                intensity="tempo",
                purpose="Tempo.",
                workout_stages=(
                    WorkoutStage("热身跑", 15, heart_rate_zone="Z1-Z2"),
                    WorkoutStage(
                        "节奏跑主课",
                        24,
                        heart_rate_zone="Z3/Z1",
                        instructions=("2*(10min Z3节奏跑 + 4min Z1慢跑恢复)",),
                    ),
                    WorkoutStage("有氧衔接跑", 6, heart_rate_zone="Z2"),
                    WorkoutStage("放松跑", 10, heart_rate_zone="Z1"),
                ),
            )
        ],
    )

    report = PlanQualityValidator().validate(plan)

    assert report.passed
    assert report.issues == ()


def test_plan_quality_flags_duration_mismatch_and_ambiguous_execution_range() -> None:
    plan = TrainingPlan(
        title="Bad week",
        sessions=[
            TrainingSession(
                day="Wednesday",
                sport=SportType.CYCLING,
                title="Bike workout",
                duration_minutes=60,
                intensity="endurance",
                purpose="Endurance.",
                workout_stages=(
                    WorkoutStage("Warm-up", 10, power_zone="Z1", cadence="85-95 rpm"),
                    WorkoutStage("Endurance", 40, power_zone="Z2"),
                ),
            )
        ],
    )

    report = PlanQualityValidator().validate(plan)

    assert not report.passed
    messages = [issue.message for issue in report.issues]
    assert any("阶段时长合计 50min" in message for message in messages)
    assert any("模糊范围" in message for message in messages)


def test_plan_quality_warns_when_stage_has_no_intensity_target() -> None:
    plan = TrainingPlan(
        title="Technique week",
        sessions=[
            TrainingSession(
                day="Tuesday",
                sport=SportType.RUNNING,
                title="Technique",
                duration_minutes=20,
                intensity="easy",
                purpose="Technique.",
                workout_stages=(WorkoutStage("Drills", 20, instructions=("轻松技术练习。",)),),
            )
        ],
    )

    report = PlanQualityValidator().validate(plan)

    assert report.passed
    assert report.issues[0].severity == "warning"
