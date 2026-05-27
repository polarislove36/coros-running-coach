from __future__ import annotations

from datetime import date

from multisport_ai_coach.domain import EventPriority, RaceEvent, SportType, TrainingSession
from multisport_ai_coach.orchestration.router import EVENT_TO_SPORT


PRIORITY_WEIGHT = {
    EventPriority.A: 100,
    EventPriority.B: 60,
    EventPriority.C: 30,
}


def sport_priority_scores(today: date, events: list[RaceEvent]) -> dict[SportType, float]:
    scores: dict[SportType, float] = {}
    for event in events:
        sport = EVENT_TO_SPORT[event.event_type]
        days_until = (event.date - today).days
        if days_until < 0:
            continue
        urgency = max(0, 90 - min(days_until, 90)) / 90 * 20
        score = PRIORITY_WEIGHT[event.priority] + urgency
        scores[sport] = max(scores.get(sport, 0), score)
    return scores


def reduction_order(sessions: list[TrainingSession], scores: dict[SportType, float]) -> list[int]:
    indexed = [
        (index, session)
        for index, session in enumerate(sessions)
        if session.duration_minutes > 30 and session.sport != SportType.RECOVERY
    ]
    return [
        index
        for index, _session in sorted(
            indexed,
            key=lambda item: (
                scores.get(item[1].sport, 0),
                session_protection_score(item[1]),
                item[1].duration_minutes,
                _day_rank(item[1].day),
            ),
        )
    ]


def session_protection_score(session: TrainingSession) -> int:
    text = " ".join(
        (
            session.title,
            session.intensity,
            session.purpose,
        )
    ).lower()
    score = 0
    if "long" in text or "time-on-feet" in text:
        score += 40
    if "uphill" in text or "climb" in text or "climbing" in text:
        score += 30
    if "tempo" in text or "threshold" in text or "sweet" in text or "interval" in text:
        score += 25
    if "cadence" in text or "skills" in text or "technical" in text:
        score += 10
    if "recovery" in text or "very easy" in text:
        score -= 10
    return score


def minimum_session_minutes(session: TrainingSession) -> int:
    score = session_protection_score(session)
    if score >= 40:
        return min(session.duration_minutes, 60)
    if score >= 25:
        return min(session.duration_minutes, 45)
    return min(session.duration_minutes, 30)


def format_sport_priority_note(scores: dict[SportType, float]) -> str | None:
    if not scores:
        return None
    ordered = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    labels = [f"{sport.value}={round(score):g}" for sport, score in ordered]
    primary = ordered[0][0].value
    return f"Sport allocation priority: {', '.join(labels)}; primary focus {primary}."


def _day_rank(day: str) -> int:
    return {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 7,
        "TBD": 99,
    }.get(day, 98)
