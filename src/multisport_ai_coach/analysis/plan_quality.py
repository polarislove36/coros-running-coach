from __future__ import annotations

import re
from dataclasses import dataclass

from multisport_ai_coach.domain import SportType, TrainingPlan, TrainingSession


AMBIGUOUS_EXECUTION_RANGE = re.compile(
    r"\b\d+\s*(?:-|~|到|至)\s*\d+\s*(?:min|分钟|秒|s|rpm|%|hours?|小时)?\b",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class PlanQualityIssue:
    severity: str
    session_title: str
    field: str
    message: str


@dataclass(frozen=True)
class PlanQualityReport:
    issues: tuple[PlanQualityIssue, ...]

    @property
    def passed(self) -> bool:
        return not any(issue.severity == "error" for issue in self.issues)


class PlanQualityValidator:
    """Checks whether a plan is executable enough for calendar delivery."""

    def validate(self, plan: TrainingPlan) -> PlanQualityReport:
        issues: list[PlanQualityIssue] = []
        for session in plan.sessions:
            issues.extend(self._validate_session(session))
        return PlanQualityReport(issues=tuple(issues))

    def _validate_session(self, session: TrainingSession) -> list[PlanQualityIssue]:
        issues: list[PlanQualityIssue] = []
        if session.sport == SportType.RECOVERY or session.duration_minutes <= 0:
            return issues

        if not session.workout_stages:
            issues.append(_issue(session, "error", "workout_stages", "缺少结构化训练阶段。"))
            return issues

        stage_total = sum(stage.duration_minutes for stage in session.workout_stages)
        if stage_total != session.duration_minutes:
            issues.append(
                _issue(
                    session,
                    "error",
                    "duration_minutes",
                    f"阶段时长合计 {stage_total}min 与训练总时长 {session.duration_minutes}min 不一致。",
                )
            )

        for stage in session.workout_stages:
            if stage.duration_minutes < 0:
                issues.append(_issue(session, "error", stage.name, "阶段时长不能为负数。"))
            if not (stage.heart_rate_zone or stage.power_zone or stage.pace_zone):
                issues.append(_issue(session, "warning", stage.name, "阶段缺少心率、功率或配速目标。"))
            for field, value in _stage_text_fields(stage):
                if _has_ambiguous_execution_range(value):
                    issues.append(_issue(session, "error", field, f"执行指令含模糊范围：{value}"))

        return issues


def _stage_text_fields(stage) -> tuple[tuple[str, str], ...]:
    values: list[tuple[str, str]] = []
    for field in ("cadence", "incline"):
        value = getattr(stage, field)
        if value:
            values.append((f"{stage.name}.{field}", value))
    for index, instruction in enumerate(stage.instructions, start=1):
        values.append((f"{stage.name}.instructions[{index}]", instruction))
    return tuple(values)


def _has_ambiguous_execution_range(value: str) -> bool:
    return bool(AMBIGUOUS_EXECUTION_RANGE.search(value))


def _issue(session: TrainingSession, severity: str, field: str, message: str) -> PlanQualityIssue:
    return PlanQualityIssue(severity=severity, session_title=session.title, field=field, message=message)
