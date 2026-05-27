from __future__ import annotations

from datetime import date

from multisport_ai_coach.coaches.base import CoachContext
from multisport_ai_coach.coaches.cycling import CyclingCoach
from multisport_ai_coach.coaches.placeholder import PlaceholderCoach
from multisport_ai_coach.coaches.running import RunningCoach
from multisport_ai_coach.coaches.trail_running import TrailRunningCoach
from multisport_ai_coach.domain import (
    FatigueBudget,
    DisciplineReadinessProfile,
    NutritionAdvice,
    RaceEvent,
    ReadinessSnapshot,
    SportType,
    TrainingHistoryProfile,
    TrainingPlan,
    TrainingSession,
    UserProfile,
    WorkoutStage,
)
from multisport_ai_coach.fatigue.manager import FatigueManager
from multisport_ai_coach.nutrition.advisor import NutritionAdvisor
from multisport_ai_coach.orchestration.allocation import (
    format_sport_priority_note,
    minimum_session_minutes,
    reduction_order,
    sport_priority_scores,
)
from multisport_ai_coach.orchestration.router import CoachRouter
from multisport_ai_coach.orchestration.volume import WeeklyVolumeAdvisor, WeeklyVolumeDecision
from multisport_ai_coach.orchestration.zones import enrich_sessions_with_heart_rate_zones


class PlanOrchestrator:
    def __init__(self) -> None:
        self.router = CoachRouter()
        self.fatigue_manager = FatigueManager()
        self.nutrition_advisor = NutritionAdvisor()
        self.volume_advisor = WeeklyVolumeAdvisor()

    def build_week_plan(
        self,
        today: date,
        profile: UserProfile,
        events: list[RaceEvent],
        readiness: ReadinessSnapshot,
        recent_activities: list[dict] | None = None,
        history_profile: TrainingHistoryProfile | None = None,
        discipline_readiness: DisciplineReadinessProfile | None = None,
        load_estimates: list | None = None,
    ) -> TrainingPlan:
        recent_activities = recent_activities or []
        selection = self.router.select(profile, events)
        budget = self.fatigue_manager.build_budget(readiness, recent_activities, today)
        nutrition = self.nutrition_advisor.advise(today, events, budget, profile)
        context = CoachContext(
            recent_activities=recent_activities,
            history_profile=history_profile,
            discipline_readiness=discipline_readiness,
            load_estimates=load_estimates or [],
        )

        candidate_sessions: list[TrainingSession] = []
        for sport in selection.active:
            coach = self._coach_for(sport)
            candidate_sessions.extend(coach.build_week_plan(profile, events, budget, nutrition, context).sessions)

        final_sessions = self._resolve_conflicts(candidate_sessions, budget, profile)
        volume_decision = self.volume_advisor.decide(profile, budget, history_profile)
        priority_scores = sport_priority_scores(today, events)
        final_sessions, volume_note = self._apply_volume_guard(final_sessions, volume_decision, priority_scores)
        final_sessions = enrich_sessions_with_heart_rate_zones(final_sessions, profile.heart_rate)

        plan = TrainingPlan(
            title="Multi-sport weekly plan",
            sessions=final_sessions,
            notes=[
                f"Active coaches: {', '.join(selection.active)}",
                f"Support modules: {', '.join(selection.support)}",
                f"Inactive coaches: {', '.join(selection.inactive) or 'none'}",
                f"Fatigue budget: {budget.weekly_volume_direction}; max hard sessions {budget.max_hard_sessions}.",
                f"Nutrition focus: {nutrition.phase_focus}.",
                self._availability_note(profile),
            ],
        )
        if volume_note:
            plan.notes.append(volume_note)
        priority_note = format_sport_priority_note(priority_scores)
        if priority_note:
            plan.notes.append(priority_note)
        recent_note = self._recent_activity_note(recent_activities)
        if recent_note:
            plan.notes.insert(0, recent_note)
        history_note = self._history_profile_note(history_profile)
        if history_note:
            plan.notes.insert(0, history_note)
        readiness_note = self._discipline_readiness_note(discipline_readiness)
        if readiness_note:
            plan.notes.insert(0, readiness_note)
        load_note = self._load_estimate_note(load_estimates or [])
        if load_note:
            plan.notes.insert(0, load_note)
        plan.notes.extend(budget.risk_flags)
        return plan

    def _coach_for(self, sport: SportType):
        if sport == SportType.RUNNING:
            return RunningCoach()
        if sport == SportType.CYCLING:
            return CyclingCoach()
        if sport == SportType.TRAIL_RUNNING:
            return TrailRunningCoach()
        return PlaceholderCoach(sport)

    def _resolve_conflicts(
        self,
        sessions: list[TrainingSession],
        budget: FatigueBudget,
        profile: UserProfile,
    ) -> list[TrainingSession]:
        hard_keywords = ("tempo", "threshold", "sweet", "vo2", "interval")
        run_like_sports = {SportType.RUNNING, SportType.TRAIL_RUNNING}
        hard_seen = 0
        training_days_seen: set[str] = set()
        run_like_days_seen: set[str] = set()
        resolved: list[TrainingSession] = []

        day_order = {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
            "Sunday": 7,
            "TBD": 99,
        }

        for session in sorted(sessions, key=lambda item: day_order.get(item.day, 98)):
            is_preferred_rest_day = session.day in profile.preferred_rest_days and session.duration_minutes > 0
            is_hard = any(word in session.title.lower() or word in session.intensity.lower() for word in hard_keywords)
            is_duplicate_training_day = (
                not profile.availability.accepts_two_a_day
                and session.day in training_days_seen
                and session.duration_minutes > 0
            )
            is_duplicate_run_day = session.sport in run_like_sports and session.day in run_like_days_seen

            if is_preferred_rest_day:
                resolved.append(
                    TrainingSession(
                        day=session.day,
                        sport=SportType.RECOVERY,
                        title=f"Protected rest day instead of {session.title}",
                        duration_minutes=0,
                        intensity="rest",
                        purpose="Respect the athlete's fixed rest day and protect recovery capacity.",
                        nutrition=None,
                        downgrade="Automatically removed by availability constraint.",
                        target_zone="Rest",
                        phases=("No structured training.",),
                        workout_stages=_easy_workout_stages(0, SportType.RECOVERY),
                    )
                )
                continue

            if is_duplicate_training_day:
                resolved.append(
                    TrainingSession(
                        day=session.day,
                        sport=session.sport,
                        title=f"Downgraded from {session.title}",
                        duration_minutes=min(session.duration_minutes, 30),
                        intensity="recovery only",
                        purpose="Avoid scheduling two training sessions on a day when the athlete does not accept double sessions.",
                        nutrition=session.nutrition,
                        downgrade="Automatically downgraded by availability constraint.",
                        target_zone=_easy_target_zone(session.sport),
                        phases=_easy_phases(min(session.duration_minutes, 30)),
                        workout_stages=_easy_workout_stages(min(session.duration_minutes, 30), session.sport),
                    )
                )
                continue

            if is_duplicate_run_day:
                resolved.append(
                    TrainingSession(
                        day=session.day,
                        sport=session.sport,
                        title=f"Downgraded from {session.title}",
                        duration_minutes=min(session.duration_minutes, 35),
                        intensity="very easy technique / recovery only",
                        purpose="Avoid stacking multiple run-like sessions on the same day.",
                        nutrition=session.nutrition,
                        downgrade="Automatically downgraded by cross-sport coordinator.",
                        target_zone=_easy_target_zone(session.sport),
                        phases=_easy_phases(min(session.duration_minutes, 35)),
                        workout_stages=_easy_workout_stages(min(session.duration_minutes, 35), session.sport),
                    )
                )
                continue

            if session.sport in run_like_sports:
                run_like_days_seen.add(session.day)
            if session.duration_minutes > 0:
                training_days_seen.add(session.day)

            if is_hard:
                hard_seen += 1
            if is_hard and hard_seen > budget.max_hard_sessions:
                resolved.append(
                    TrainingSession(
                        day=session.day,
                        sport=session.sport,
                        title=f"Downgraded from {session.title}",
                        duration_minutes=min(session.duration_minutes, 60),
                        intensity="easy endurance / recovery",
                        purpose="Avoid stacking more intensity than the fatigue budget allows.",
                        nutrition=session.nutrition,
                        downgrade="Automatically downgraded by cross-sport coordinator.",
                        target_zone=_easy_target_zone(session.sport),
                        phases=_easy_phases(min(session.duration_minutes, 60)),
                        workout_stages=_easy_workout_stages(min(session.duration_minutes, 60), session.sport),
                    )
                )
            else:
                resolved.append(session)

        return resolved

    def _availability_note(self, profile: UserProfile) -> str:
        availability = profile.availability
        weekly_hours = availability.weekly_hours
        two_a_day = "allowed" if profile.availability.accepts_two_a_day else "not allowed"
        if availability.weekly_hours_min is not None and availability.weekly_hours_max is not None:
            weekly_text = f"{availability.weekly_hours_min:g}-{availability.weekly_hours_max:g} hours/week"
        elif weekly_hours is not None:
            weekly_text = f"about {weekly_hours:g} hours/week"
        else:
            weekly_text = "weekly hours unknown"

        if availability.max_two_a_day_days_per_week is not None and availability.accepts_two_a_day:
            two_a_day = f"allowed up to {availability.max_two_a_day_days_per_week} days/week"

        return f"Availability: {weekly_text}; two-a-day training {two_a_day}."

    def _recent_activity_note(self, activities: list[dict]) -> str | None:
        dated = [activity for activity in activities if isinstance(activity.get("date"), date)]
        if not dated:
            return None
        latest = max(dated, key=lambda activity: activity["date"])
        sport = latest.get("sport", "activity")
        activity_date = latest["date"].isoformat()
        distance = latest.get("distance_km")
        duration = latest.get("duration_minutes")
        parts = [f"Latest COROS activity: {sport} on {activity_date}"]
        if distance is not None:
            parts.append(f"{distance:g}km")
        if duration is not None:
            parts.append(f"{duration:g}min")
        return "; ".join(parts) + "."

    def _history_profile_note(self, profile: TrainingHistoryProfile | None) -> str | None:
        if profile is None:
            return None
        sports = ", ".join(
            f"{summary.sport}: {summary.activity_count} sessions/{round(summary.total_duration_minutes / 60, 1)}h"
            for summary in profile.sport_summaries
        )
        if not sports:
            sports = "no completed activities"
        return (
            f"90-day history: {profile.total_activities} activities; "
            f"{profile.average_weekly_hours:g}h/week average; "
            f"{profile.active_weekly_hours:g}h/active week; "
            f"{profile.active_weeks}/{profile.window_weeks} active weeks "
            f"({round(profile.consistency_ratio * 100):g}% consistency); {sports}."
        )

    def _discipline_readiness_note(self, readiness: DisciplineReadinessProfile | None) -> str | None:
        if readiness is None:
            return None
        trail = readiness.trail
        cycling = readiness.cycling
        power_note = "power data present" if cycling.has_power_data else "power data missing"
        return (
            "Discipline readiness: "
            f"trail {trail.trail_activity_count} sessions/{trail.total_trail_hours:g}h/"
            f"{trail.total_elevation_gain_m}m gain, max {trail.max_distance_km:g}km/"
            f"{trail.max_elevation_gain_m}m gain; "
            f"cycling {cycling.ride_count} rides/{cycling.total_ride_hours:g}h, "
            f"max {cycling.max_distance_km:g}km, {power_note}."
        )

    def _load_estimate_note(self, estimates: list) -> str | None:
        if not estimates:
            return None
        total = round(sum(estimate.score for estimate in estimates), 1)
        sources = ", ".join(sorted({estimate.source for estimate in estimates}))
        return f"Recent activity load estimate: {total:g} total load; sources: {sources}."

    def _apply_volume_guard(
        self,
        sessions: list[TrainingSession],
        decision: WeeklyVolumeDecision,
        priority_scores: dict[SportType, float] | None = None,
    ) -> tuple[list[TrainingSession], str | None]:
        volume_cap_minutes = decision.cap_minutes
        if volume_cap_minutes is None:
            return sessions, None

        total_minutes = sum(session.duration_minutes for session in sessions)
        prefix = f"Weekly volume cap: {volume_cap_minutes} min; {decision.rationale}."
        if total_minutes <= volume_cap_minutes:
            return sessions, f"{prefix} Planned {total_minutes} min."

        overflow = total_minutes - volume_cap_minutes
        adjusted = list(sessions)
        reduce_indices = reduction_order(adjusted, priority_scores or {})
        for index in reduce_indices:
            session = adjusted[index]
            if overflow <= 0:
                break
            floor = minimum_session_minutes(session)
            if session.duration_minutes <= floor:
                continue
            reduction = min(overflow, session.duration_minutes - floor)
            overflow -= reduction
            adjusted_minutes = session.duration_minutes - reduction
            adjusted[index] = TrainingSession(
                day=session.day,
                sport=session.sport,
                title=_volume_capped_title(session.title),
                duration_minutes=adjusted_minutes,
                intensity="easy / recovery",
                purpose="Keep weekly duration within the cap derived from 90-day history and current fatigue.",
                nutrition=session.nutrition,
                downgrade="Automatically shortened by weekly volume guard.",
                target_zone=_easy_target_zone(session.sport),
                phases=_easy_phases(adjusted_minutes),
                workout_stages=_easy_workout_stages(adjusted_minutes, session.sport, session),
            )

        if overflow > 0:
            for index in reduce_indices:
                session = adjusted[index]
                if overflow <= 0:
                    break
                if session.duration_minutes <= 30:
                    continue
                reduction = min(overflow, session.duration_minutes - 30)
                overflow -= reduction
                adjusted_minutes = session.duration_minutes - reduction
                adjusted[index] = TrainingSession(
                    day=session.day,
                    sport=session.sport,
                    title=_volume_capped_title(session.title),
                    duration_minutes=adjusted_minutes,
                    intensity="easy / recovery",
                    purpose="Keep weekly duration within the cap after key-session protection was exhausted.",
                    nutrition=session.nutrition,
                    downgrade="Automatically shortened by weekly volume guard.",
                    target_zone=_easy_target_zone(session.sport),
                    phases=_easy_phases(adjusted_minutes),
                    workout_stages=_easy_workout_stages(adjusted_minutes, session.sport, session),
                )

        adjusted_total = sum(session.duration_minutes for session in adjusted)
        if overflow > 0:
            return (
                adjusted,
                f"{prefix} Adjusted from {total_minutes} to {adjusted_total} min; "
                "minimum session floors prevented reaching the cap exactly.",
            )
        return adjusted, f"{prefix} Adjusted from {total_minutes} to {adjusted_total} min."


def _volume_capped_title(title: str) -> str:
    if title.startswith("Volume-capped from "):
        return title
    return f"Volume-capped from {title}"


def _easy_target_zone(sport: SportType) -> str:
    if sport == SportType.CYCLING:
        return "Power Z1-Z2 / HR Z1-Z2"
    if sport == SportType.RECOVERY:
        return "Rest"
    return "HR Z1-Z2 / easy conversational"


def _easy_phases(duration_minutes: int) -> tuple[str, ...]:
    if duration_minutes <= 0:
        return ("No structured training.",)
    if duration_minutes <= 35:
        warmup = min(5, max(duration_minutes // 5, 3))
        cooldown = min(5, max(duration_minutes // 6, 3))
    else:
        warmup = 10
        cooldown = 5
    main = max(duration_minutes - warmup - cooldown, 0)
    if main <= 0:
        return (f"{duration_minutes} min very easy movement.",)
    return (
        f"{warmup} min easy warm-up",
        f"{main} min easy aerobic / recovery",
        f"{cooldown} min easy cool-down",
    )


def _easy_workout_stages(
    duration_minutes: int,
    sport: SportType,
    source_session: TrainingSession | None = None,
) -> tuple[WorkoutStage, ...]:
    if duration_minutes <= 0 or sport == SportType.RECOVERY:
        return (WorkoutStage("Rest", 0, instructions=("No structured training.",)),)

    phases = _easy_phase_durations(duration_minutes)
    if sport == SportType.CYCLING:
        recovery_power = _source_recovery_power_zone(source_session)
        easy_power = _source_easy_power_zone(source_session)
        return (
            WorkoutStage("Warm-up", phases[0], power_zone=recovery_power, cadence="90 rpm"),
            WorkoutStage("Easy aerobic", phases[1], power_zone=easy_power, cadence="90 rpm"),
            WorkoutStage("Cool-down", phases[2], power_zone=recovery_power, cadence="Natural easy spin"),
        )

    return (
        WorkoutStage("Warm-up", phases[0], heart_rate_zone="Z1"),
        WorkoutStage("Easy aerobic", phases[1], heart_rate_zone="Z1-Z2", cadence="Relaxed and comfortable"),
        WorkoutStage("Cool-down", phases[2], heart_rate_zone="Z1"),
    )


def _easy_phase_durations(duration_minutes: int) -> tuple[int, int, int]:
    if duration_minutes <= 35:
        warmup = min(5, max(duration_minutes // 5, 3))
        cooldown = min(5, max(duration_minutes // 6, 3))
    else:
        warmup = 10
        cooldown = 5
    main = max(duration_minutes - warmup - cooldown, 0)
    return warmup, main, cooldown


def _source_easy_power_zone(session: TrainingSession | None) -> str:
    if session is None:
        return "Z1-Z2"
    for stage in session.workout_stages:
        if stage.power_zone and stage.power_zone.startswith("Z2 ") and "recover" not in stage.power_zone:
            return stage.power_zone
    for stage in session.workout_stages:
        if stage.power_zone and ("Z2" in stage.power_zone or "W" in stage.power_zone):
            return stage.power_zone
    return session.target_zone or "Z1-Z2"


def _source_recovery_power_zone(session: TrainingSession | None) -> str:
    if session is None:
        return "Z1"
    for stage in session.workout_stages:
        if stage.power_zone and stage.power_zone.startswith("Z1 <="):
            return stage.power_zone
    for stage in session.workout_stages:
        if stage.power_zone and stage.power_zone == "Z1":
            return stage.power_zone
    return "Z1"
