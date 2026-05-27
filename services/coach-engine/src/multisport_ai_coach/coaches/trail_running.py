from __future__ import annotations

from multisport_ai_coach.coaches.base import CoachContext, CoachModule
from multisport_ai_coach.domain import (
    EventType,
    FatigueBudget,
    NutritionAdvice,
    RaceEvent,
    SportType,
    TrainingPlan,
    TrainingSession,
    UserProfile,
    WorkoutStage,
)


class TrailRunningCoach(CoachModule):
    """Builds trail-running candidate sessions.

    This first version is intentionally conservative. It creates the module
    boundary for future book-derived rules without pretending that road-running
    sessions are enough for trail racing.
    """

    def build_week_plan(
        self,
        profile: UserProfile,
        events: list[RaceEvent],
        fatigue: FatigueBudget,
        nutrition: NutritionAdvice,
        context: CoachContext | None = None,
    ) -> TrainingPlan:
        trail_events = [event for event in events if event.event_type == EventType.TRAIL_RACE]
        target = min(trail_events, key=lambda event: event.date) if trail_events else None
        elevation_note = self._elevation_note(target)
        climb_modality = self._climb_modality(profile)
        fueling_note = self._fueling_note(profile)
        terrain_gap = self._terrain_gap(profile)
        trail_readiness = context.discipline_readiness.trail if context and context.discipline_readiness else None
        climb_reps = self._climb_reps(trail_readiness)
        long_run_minutes = self._long_run_minutes(trail_readiness)
        readiness_note = self._readiness_note(trail_readiness)

        sessions = [
            TrainingSession(
                day="Tuesday",
                sport=SportType.TRAIL_RUNNING,
                title="Trail skills easy run",
                duration_minutes=45,
                intensity="easy effort; short technical practice only",
                purpose=f"Practice foot placement, relaxed descending, and hiking transitions without adding much load. {terrain_gap}",
                downgrade="If ankles, knees, or quads are sore, use flat easy running or walking instead.",
                target_zone="HR Z1-Z2 / conversational effort",
                phases=(
                    "10 min easy warm-up",
                    "20 min easy run with relaxed cadence and foot placement focus",
                    "6 x 20 sec light technique strides or hiking transitions, full easy recovery",
                    "5 min easy cool-down",
                ),
                workout_stages=(
                    WorkoutStage("Warm-up", 10, heart_rate_zone="Z1", cadence="Relaxed"),
                    WorkoutStage(
                        "Easy trail technique",
                        20,
                        heart_rate_zone="Z1-Z2",
                        cadence="Quick relaxed steps",
                        instructions=("Focus on foot placement.", "Stay smooth on turns and transitions."),
                    ),
                    WorkoutStage(
                        "Technique strides",
                        10,
                        heart_rate_zone="Z2 cap",
                        cadence="Light and quick",
                        instructions=("6 x 20 sec light strides or hiking transitions.", "Full easy recovery."),
                    ),
                    WorkoutStage("Cool-down", 5, heart_rate_zone="Z1"),
                ),
            )
        ]

        if fatigue.max_hard_sessions >= 1 and "recovery only" not in fatigue.intensity_ceiling:
            sessions.append(
                TrainingSession(
                    day="Thursday",
                    sport=SportType.TRAIL_RUNNING,
                    title=f"Uphill aerobic strength ({climb_modality})",
                    duration_minutes=climb_reps["duration"],
                    intensity=f"{climb_reps['reps']} steady uphill or treadmill incline; hike/jog down easy",
                    purpose=f"Build climbing durability for trail racing. {elevation_note} {readiness_note}",
                    nutrition="Eat carbohydrate 3 hours before training; bring fluids if outdoors.",
                    downgrade="If fatigue is high, replace climbs with 45 minutes easy on flat terrain.",
                    target_zone="HR Z2 on climbs; cap at low Z3 if using stairs",
                    phases=(
                        "15 min easy warm-up",
                        f"{climb_reps['reps']} steady uphill, easy walk/jog down recovery",
                        "10 min easy aerobic running or brisk hiking",
                        "5 min easy cool-down",
                    ),
                    workout_stages=(
                        WorkoutStage(
                            "Warm-up",
                            15,
                            heart_rate_zone="Z1-Z2",
                            incline="4% treadmill or easy stairs",
                        ),
                        WorkoutStage(
                            "重复爬坡",
                            climb_reps["work_minutes"],
                            heart_rate_zone="Z3/Z1",
                            incline="10% treadmill or stairs",
                            cadence="短步幅、快步频",
                            instructions=(climb_reps["prescription"],),
                        ),
                        WorkoutStage("Aerobic finish", 10, heart_rate_zone="Z1-Z2", incline="6%"),
                        WorkoutStage("Cool-down", 5, heart_rate_zone="Z1", incline="2%"),
                    ),
                )
            )

        if fatigue.long_session_allowed:
            sessions.append(
                TrainingSession(
                    day="Sunday",
                    sport=SportType.TRAIL_RUNNING,
                    title="Long trail run / hike-run",
                    duration_minutes=long_run_minutes,
                    intensity="mostly Z1-Z2; hike steep climbs; keep descents controlled",
                    purpose=f"Build time-on-feet, climbing rhythm, descending tolerance, and fueling practice. {readiness_note}",
                    nutrition=f"{fueling_note} Practice race food, fluid concentration, and sodium.",
                    downgrade="If load ratio is high or quads are sore, cap at 75 minutes on gentle terrain.",
                    target_zone="HR Z1-Z2; hike climbs before HR drifts high",
                    phases=(
                        "15 min easy warm-up",
                        "Main block hike-run at steady aerobic effort",
                        "Fuel every 20 min and keep descents controlled",
                        "10 min easy cool-down",
                    ),
                    workout_stages=(
                        WorkoutStage("Warm-up", 15, heart_rate_zone="Z1-Z2"),
                        WorkoutStage(
                            "Hike-run main block",
                            max(long_run_minutes - 25, 45),
                            heart_rate_zone="Z1-Z2",
                            incline="Use available climbs; treadmill 10% if indoors",
                            cadence="Short efficient uphill steps",
                            instructions=("Hike steep climbs before HR drifts high.", "Fuel every 20 min."),
                        ),
                        WorkoutStage("Cool-down", 10, heart_rate_zone="Z1"),
                    ),
                )
            )
        else:
            sessions.append(
                TrainingSession(
                    day="Saturday",
                    sport=SportType.TRAIL_RUNNING,
                    title="Short hike-run recovery",
                    duration_minutes=40,
                    intensity="very easy; avoid sustained descents",
                    purpose=f"Maintain trail movement patterns while respecting the fatigue budget. {terrain_gap}",
                    nutrition="Normal meals are enough unless starting hungry.",
                    downgrade="Replace with a walk if soreness persists.",
                    target_zone="HR Z1 / recovery effort",
                    phases=(
                        "5 min easy walk warm-up",
                        "30 min very easy hike-run or incline walk",
                        "5 min mobility and easy walking",
                    ),
                    workout_stages=(
                        WorkoutStage("Warm-up", 5, heart_rate_zone="Z1"),
                        WorkoutStage(
                            "Recovery hike-run",
                            30,
                            heart_rate_zone="Z1",
                            incline="6% treadmill or easy stairs",
                            instructions=("Keep it very easy.",),
                        ),
                        WorkoutStage("Mobility", 5, instructions=("Easy walking and light mobility.",)),
                    ),
                )
            )

        return TrainingPlan(
            title="Trail running candidate plan",
            sessions=sessions,
            notes=[
                "Trail plans should track elevation gain, descent load, technical surface, and time-on-feet.",
                "Do not treat road pace as the main control metric on trails.",
                "Downhill tolerance is a distinct stressor; add it carefully and do not chase heart-rate zones on descents.",
            ],
        )

    def _elevation_note(self, target: RaceEvent | None) -> str:
        if target is None or target.elevation_gain_m is None:
            return "Target elevation is unknown, so climbing volume should progress conservatively."
        return f"Target event has about {target.elevation_gain_m}m elevation gain."

    def _climb_modality(self, profile: UserProfile) -> str:
        if profile.environment.outdoor_climbs_available:
            return "outdoor climbs"
        options: list[str] = []
        if profile.environment.treadmill_available:
            options.append("incline treadmill")
        if profile.environment.stairs_available:
            options.append("stairs")
        if options:
            return " / ".join(options)
        return "available incline substitute"

    def _fueling_note(self, profile: UserProfile) -> str:
        low = profile.fueling.carb_tolerance_g_per_hour_min
        high = profile.fueling.carb_tolerance_g_per_hour_max
        if low and high:
            return f"Use {low}-{high}g carbohydrate/hour only on key long sessions; easier sessions can use less."
        return "Use 40-60g carbohydrate/hour for long sessions and progress based on gut tolerance."

    def _terrain_gap(self, profile: UserProfile) -> str:
        if profile.environment.outdoor_climbs_available:
            return "Use terrain similar to the race when possible."
        if profile.environment.treadmill_available or profile.environment.stairs_available:
            return "Because outdoor mountains are unavailable, treadmill/stairs cover climbing but not full downhill or technical-trail demand."
        return "Terrain specificity is limited; keep the plan conservative."

    def _climb_reps(self, trail_readiness) -> dict[str, int | str]:
        if trail_readiness is None:
            return {
                "duration": 60,
                "reps": "6 x 3 min",
                "work_minutes": 30,
                "prescription": "6*(3min Z3爬坡 + 2min Z1恢复)",
            }
        if trail_readiness.trail_activity_count == 0:
            return {
                "duration": 50,
                "reps": "5 x 2 min",
                "work_minutes": 20,
                "prescription": "5*(2min Z3爬坡 + 2min Z1恢复)",
            }
        if trail_readiness.max_elevation_gain_m >= 1500 and trail_readiness.total_trail_hours >= 10:
            return {
                "duration": 72,
                "reps": "6 x 4 min",
                "work_minutes": 42,
                "prescription": "6*(4min Z3爬坡 + 3min Z1恢复)",
            }
        return {
            "duration": 60,
            "reps": "6 x 3 min",
            "work_minutes": 30,
            "prescription": "6*(3min Z3爬坡 + 2min Z1恢复)",
        }

    def _long_run_minutes(self, trail_readiness) -> int:
        if trail_readiness is None:
            return 105
        if trail_readiness.trail_activity_count == 0:
            return 75
        if trail_readiness.max_duration_minutes >= 360:
            return 120
        if trail_readiness.max_duration_minutes >= 180:
            return 105
        return 90

    def _readiness_note(self, trail_readiness) -> str:
        if trail_readiness is None:
            return "Recent trail readiness is unknown, so progression stays conservative."
        if trail_readiness.trail_activity_count == 0:
            return "No recent trail sessions were found, so this is an intro-specificity week."
        return (
            f"Recent trail max is {trail_readiness.max_distance_km:g}km/"
            f"{round(trail_readiness.max_duration_minutes / 60, 1):g}h/"
            f"{trail_readiness.max_elevation_gain_m}m gain."
        )
