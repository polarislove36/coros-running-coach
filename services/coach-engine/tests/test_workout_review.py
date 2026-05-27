from datetime import date

from multisport_ai_coach.analysis import CompletedWorkout, WorkoutReviewer
from multisport_ai_coach.domain import SportType, TrainingSession


def test_workout_review_marks_completed_session() -> None:
    planned = TrainingSession("Thursday", SportType.RUNNING, "控制节奏跑", 55, "tempo", "Tempo.")
    completed = CompletedWorkout(date(2026, 5, 28), SportType.RUNNING, 54, training_load=80)

    review = WorkoutReviewer().review(planned, completed, planned_load=78)

    assert review.status == "completed"
    assert review.completion_ratio == 0.98
    assert review.load_delta == 2
    assert "按原计划继续" in review.adjustment


def test_workout_review_flags_over_completion_and_high_load() -> None:
    planned = TrainingSession("Sunday", SportType.RUNNING, "长距离轻松跑", 80, "easy", "Long run.")
    completed = CompletedWorkout(date(2026, 5, 31), SportType.RUNNING, 105, training_load=150)

    review = WorkoutReviewer().review(planned, completed, planned_load=95)

    assert review.status == "over_completed"
    assert review.load_delta == 55
    assert "24-48 小时" in review.adjustment


def test_workout_review_handles_missed_session() -> None:
    planned = TrainingSession("Tuesday", SportType.CYCLING, "Endurance ride", 75, "Z2", "Endurance.")

    review = WorkoutReviewer().review(planned, None)

    assert review.status == "missed"
    assert review.completed_minutes == 0
    assert "没有完成记录" in review.notes[0]
