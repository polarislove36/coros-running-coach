from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from multisport_ai_coach.domain import SportType, TrainingSession


@dataclass(frozen=True)
class CompletedWorkout:
    date: date
    sport: SportType
    duration_minutes: int
    distance_km: float | None = None
    training_load: float | None = None
    average_hr_bpm: int | None = None
    average_power_watts: int | None = None
    notes: str = ""


@dataclass(frozen=True)
class WorkoutReview:
    status: str
    planned_minutes: int
    completed_minutes: int
    completion_ratio: float
    load_delta: float | None
    adjustment: str
    notes: tuple[str, ...]


class WorkoutReviewer:
    """Compares one planned session with the completed workout."""

    def review(
        self,
        planned: TrainingSession,
        completed: CompletedWorkout | None,
        *,
        planned_load: float | None = None,
    ) -> WorkoutReview:
        if completed is None:
            return WorkoutReview(
                status="missed",
                planned_minutes=planned.duration_minutes,
                completed_minutes=0,
                completion_ratio=0,
                load_delta=None,
                adjustment="把下一次关键课前的训练降为轻松有氧，先确认疲劳、时间和伤病原因。",
                notes=("没有完成记录。",),
            )

        ratio = _completion_ratio(planned.duration_minutes, completed.duration_minutes)
        status = _status_from_ratio(ratio)
        load_delta = _load_delta(planned_load, completed.training_load)
        notes = _review_notes(planned, completed, ratio, load_delta)
        return WorkoutReview(
            status=status,
            planned_minutes=planned.duration_minutes,
            completed_minutes=completed.duration_minutes,
            completion_ratio=ratio,
            load_delta=load_delta,
            adjustment=_adjustment(status, load_delta),
            notes=notes,
        )


def _completion_ratio(planned_minutes: int, completed_minutes: int) -> float:
    if planned_minutes <= 0:
        return 1.0 if completed_minutes <= 0 else 0
    return round(completed_minutes / planned_minutes, 2)


def _status_from_ratio(ratio: float) -> str:
    if ratio < 0.8:
        return "under_completed"
    if ratio > 1.2:
        return "over_completed"
    return "completed"


def _load_delta(planned_load: float | None, completed_load: float | None) -> float | None:
    if planned_load is None or completed_load is None:
        return None
    return round(completed_load - planned_load, 1)


def _review_notes(
    planned: TrainingSession,
    completed: CompletedWorkout,
    ratio: float,
    load_delta: float | None,
) -> tuple[str, ...]:
    notes = [
        f"计划 {planned.duration_minutes}min，实际 {completed.duration_minutes}min，完成比例 {ratio:.0%}。",
    ]
    if completed.sport != planned.sport:
        notes.append(f"项目不一致：计划 {planned.sport.value}，实际 {completed.sport.value}。")
    if load_delta is not None:
        direction = "高于" if load_delta > 0 else "低于" if load_delta < 0 else "等于"
        notes.append(f"实际训练负荷{direction}计划 {abs(load_delta):g}。")
    return tuple(notes)


def _adjustment(status: str, load_delta: float | None) -> str:
    if status == "missed":
        return "不要直接补课；优先保持本周关键课之间的恢复间隔。"
    if status == "under_completed":
        return "下一次训练保持原计划或轻微降低，不用在同一天补齐缺口。"
    if status == "over_completed" or (load_delta is not None and load_delta > 30):
        return "未来 24-48 小时避免高强度，下一次训练优先降为 Z1-Z2。"
    return "按原计划继续，保留常规恢复监控。"
