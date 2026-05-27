from __future__ import annotations

from multisport_ai_coach.coaches.base import CoachContext, CoachModule
from multisport_ai_coach.domain import (
    FatigueBudget,
    NutritionAdvice,
    RaceEvent,
    SportType,
    TrainingPlan,
    TrainingSession,
    UserProfile,
    WorkoutStage,
)


class RunningCoach(CoachModule):
    def build_week_plan(
        self,
        profile: UserProfile,
        events: list[RaceEvent],
        fatigue: FatigueBudget,
        nutrition: NutritionAdvice,
        context: CoachContext | None = None,
    ) -> TrainingPlan:
        hard_allowed = fatigue.max_hard_sessions >= 1 and "recovery only" not in fatigue.intensity_ceiling
        sessions = [
            TrainingSession(
                day="Tuesday",
                sport=SportType.RUNNING,
                title="轻松跑",
                duration_minutes=45,
                intensity="Z1-Z2 / conversational",
                purpose="Maintain run frequency without adding much fatigue.",
                target_zone="HR Z1-Z2 / conversational",
                phases=(
                    "10 min easy warm-up",
                    "30 min relaxed aerobic running",
                    "5 min easy cool-down",
                ),
                workout_stages=(
                    WorkoutStage("热身跑", 10, heart_rate_zone="Z1"),
                    WorkoutStage(
                        "有氧轻松跑",
                        30,
                        heart_rate_zone="Z1-Z2",
                        instructions=("全程保持可完整说话的强度。",),
                    ),
                    WorkoutStage("放松跑", 5, heart_rate_zone="Z1"),
                ),
            )
        ]

        if hard_allowed:
            sessions.append(
                TrainingSession(
                    day="Thursday",
                    sport=SportType.RUNNING,
                    title="控制节奏跑",
                    duration_minutes=55,
                    intensity="upper Z2 to low Z3; avoid all-out threshold",
                    purpose="Keep race-specific rhythm while respecting the weekly fatigue budget.",
                    nutrition="Eat carbohydrate 3 hours before the session.",
                    downgrade="If HRV or sleep is poor, change to 40 minutes easy.",
                    target_zone="HR Z2-Z3",
                    phases=(
                        "15 min easy warm-up",
                        "2 x 10 min controlled tempo, 4 min easy jog recovery between efforts",
                        "6 min steady easy running",
                        "10 min easy cool-down",
                    ),
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
            )

        if fatigue.long_session_allowed:
            sessions.append(
                TrainingSession(
                    day="Sunday",
                    sport=SportType.RUNNING,
                    title="长距离轻松跑",
                    duration_minutes=80,
                    intensity="Z2, relaxed form",
                    purpose="Build aerobic durability for road races.",
                    nutrition="Carry fluids; add carbohydrate if longer than 75 minutes.",
                    target_zone="HR Z2 / relaxed aerobic",
                    phases=(
                        "10 min easy warm-up",
                        "60 min steady Z2 running",
                        "10 min easy cool-down",
                    ),
                    workout_stages=(
                        WorkoutStage("热身跑", 10, heart_rate_zone="Z1"),
                        WorkoutStage(
                            "稳定有氧跑",
                            60,
                            heart_rate_zone="Z2",
                            instructions=("避免突然加速。",),
                        ),
                        WorkoutStage("放松跑", 10, heart_rate_zone="Z1"),
                    ),
                )
            )

        return TrainingPlan(title="Running candidate plan", sessions=sessions)
