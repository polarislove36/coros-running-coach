from __future__ import annotations

from datetime import date, datetime, time, timedelta

from multisport_ai_coach.domain import SportType, TrainingPlan, TrainingSession, WorkoutStage


DAY_INDEX = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6,
}


def render_ics_calendar(
    plans: list[TrainingPlan],
    *,
    start_date: date,
    calendar_name: str = "Multi-Sport AI Coach",
) -> str:
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//multisport-ai-coach//training-plan//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{_escape(calendar_name)}",
    ]

    for week_index, plan in enumerate(plans):
        week_start = start_date + timedelta(days=week_index * 7)
        for session_index, session in enumerate(plan.sessions):
            lines.extend(_event_lines(plan, session, week_start, week_index, session_index))

    lines.append("END:VCALENDAR")
    return "\r\n".join(_fold_line(line) for line in lines) + "\r\n"


def _event_lines(
    plan: TrainingPlan,
    session: TrainingSession,
    week_start: date,
    week_index: int,
    session_index: int,
) -> list[str]:
    session_date = _session_date(week_start, session.day)
    uid = _event_uid(plan, session, session_date, week_index, session_index)
    summary = f"{_sport_label(session.sport)}: {session.title}"
    description = _description(session)
    lines = [
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
        f"SUMMARY:{_escape(summary)}",
        f"DESCRIPTION:{_escape(description)}",
    ]

    if session.duration_minutes <= 0 or session.sport == SportType.RECOVERY:
        lines.extend(
            [
                f"DTSTART;VALUE=DATE:{session_date.strftime('%Y%m%d')}",
                f"DTEND;VALUE=DATE:{(session_date + timedelta(days=1)).strftime('%Y%m%d')}",
            ]
        )
    else:
        start_at = datetime.combine(session_date, time(hour=7))
        end_at = start_at + timedelta(minutes=session.duration_minutes)
        lines.extend(
            [
                f"DTSTART:{start_at.strftime('%Y%m%dT%H%M%S')}",
                f"DTEND:{end_at.strftime('%Y%m%dT%H%M%S')}",
            ]
        )

    lines.append("END:VEVENT")
    return lines


def _session_date(week_start: date, day: str) -> date:
    target_index = DAY_INDEX.get(day, week_start.weekday())
    offset = (target_index - week_start.weekday()) % 7
    return week_start + timedelta(days=offset)


def _event_uid(
    plan: TrainingPlan,
    session: TrainingSession,
    session_date: date,
    week_index: int,
    session_index: int,
) -> str:
    seed = f"{plan.title}-{session_date.isoformat()}-{session.sport.value}-{session.title}-{week_index}-{session_index}"
    slug = "".join(char.lower() if char.isalnum() else "-" for char in seed).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return f"{slug}@multisport-ai-coach.local"


def _description(session: TrainingSession) -> str:
    stages = session.workout_stages or _fallback_workout_stages(session)
    parts = [
        f"运动项目：{_sport_label(session.sport)}",
        f"训练总时长：{_duration_label(session)}",
        "训练阶段：",
    ]
    for index, stage in enumerate(stages, start=1):
        parts.extend(_stage_lines(index, stage))
    return "\\n".join(parts)


def _duration_label(session: TrainingSession) -> str:
    if session.duration_minutes <= 0 or session.sport == SportType.RECOVERY:
        return "Rest day"
    return f"{session.duration_minutes} min"


def _fallback_target_zone(session: TrainingSession) -> str:
    if session.sport == SportType.CYCLING:
        return session.intensity or "Power/HR by coach guidance"
    if session.sport == SportType.RECOVERY:
        return "Rest"
    return session.intensity or "HR/RPE by coach guidance"


def _fallback_phases(session: TrainingSession) -> tuple[str, ...]:
    if session.duration_minutes <= 0 or session.sport == SportType.RECOVERY:
        return ("No structured training.",)
    if session.duration_minutes <= 40:
        return (
            "5 min easy warm-up",
            f"{max(session.duration_minutes - 10, 0)} min main easy work",
            "5 min easy cool-down",
        )
    return (
        "10 min easy warm-up",
        f"{max(session.duration_minutes - 15, 0)} min main set at target zone",
        "5 min easy cool-down",
    )


def _fallback_workout_stages(session: TrainingSession) -> tuple[WorkoutStage, ...]:
    phases = session.phases or _fallback_phases(session)
    stages: list[WorkoutStage] = []
    for phase in phases:
        stages.append(
            WorkoutStage(
                name=_phase_name(phase),
                duration_minutes=_phase_duration(phase),
                heart_rate_zone=_fallback_target_zone(session) if session.sport != SportType.CYCLING else None,
                power_zone=_fallback_target_zone(session) if session.sport == SportType.CYCLING else None,
                instructions=(phase,),
            )
        )
    return tuple(stages)


def _stage_lines(index: int, stage: WorkoutStage) -> list[str]:
    lines = [f"{index}. {stage.name}：{stage.duration_minutes}min"]
    intensity = _stage_intensity(stage)
    if intensity:
        lines.append(f"   强度：{intensity}")
    requirements = _stage_requirements(stage)
    if requirements:
        lines.append(f"   要求：{requirements}")
    return lines


def _stage_intensity(stage: WorkoutStage) -> str:
    values = []
    if stage.heart_rate_zone:
        values.append(f"心率 {stage.heart_rate_zone}")
    if stage.power_zone:
        values.append(f"功率 {stage.power_zone}")
    if stage.pace_zone:
        values.append(f"配速 {stage.pace_zone}")
    return " / ".join(values)


def _stage_requirements(stage: WorkoutStage) -> str:
    values = []
    if stage.cadence:
        values.append(f"踏频/步频 {stage.cadence}")
    if stage.incline:
        values.append(f"坡度 {stage.incline}")
    values.extend(stage.instructions)
    return "；".join(values)


def _phase_name(phase: str) -> str:
    lower = phase.lower()
    if "warm" in lower:
        return "Warm-up"
    if "cool" in lower:
        return "Cool-down"
    if "rest" in lower or "no structured" in lower:
        return "Rest"
    return "Main set"


def _phase_duration(phase: str) -> int:
    digits = ""
    for char in phase:
        if char.isdigit():
            digits += char
        elif digits:
            break
    return int(digits) if digits else 0


def _sport_label(sport: SportType) -> str:
    return {
        SportType.RUNNING: "Run",
        SportType.CYCLING: "Bike",
        SportType.TRAIL_RUNNING: "Trail",
        SportType.HYROX: "HYROX",
        SportType.SWIMMING: "Swim",
        SportType.STRENGTH: "Strength",
        SportType.RECOVERY: "Recovery",
    }.get(sport, sport.value)


def _escape(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("\n", "\\n")
        .replace(",", "\\,")
        .replace(";", "\\;")
    )


def _fold_line(line: str) -> str:
    if len(line) <= 75:
        return line
    chunks = [line[:75]]
    rest = line[75:]
    while rest:
        chunks.append(" " + rest[:74])
        rest = rest[74:]
    return "\r\n".join(chunks)
