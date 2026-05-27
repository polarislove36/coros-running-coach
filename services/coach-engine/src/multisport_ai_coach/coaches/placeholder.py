from __future__ import annotations

from multisport_ai_coach.coaches.base import CoachContext, CoachModule
from multisport_ai_coach.domain import FatigueBudget, NutritionAdvice, RaceEvent, SportType, TrainingPlan, TrainingSession, UserProfile


class PlaceholderCoach(CoachModule):
    def __init__(self, sport: SportType) -> None:
        self.sport = sport

    def build_week_plan(
        self,
        profile: UserProfile,
        events: list[RaceEvent],
        fatigue: FatigueBudget,
        nutrition: NutritionAdvice,
        context: CoachContext | None = None,
    ) -> TrainingPlan:
        return TrainingPlan(
            title=f"{self.sport.value} placeholder plan",
            sessions=[
                TrainingSession(
                    day="TBD",
                    sport=self.sport,
                    title="Coach module not implemented yet",
                    duration_minutes=0,
                    intensity="n/a",
                    purpose="Reserve interface for future sport-specific coaching logic.",
                )
            ],
        )
