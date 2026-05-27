from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from multisport_ai_coach.domain import (
    DisciplineReadinessProfile,
    FatigueBudget,
    NutritionAdvice,
    RaceEvent,
    TrainingHistoryProfile,
    TrainingPlan,
    UserProfile,
)


@dataclass(frozen=True)
class CoachContext:
    recent_activities: list[dict]
    history_profile: TrainingHistoryProfile | None = None
    discipline_readiness: DisciplineReadinessProfile | None = None
    load_estimates: list | None = None


class CoachModule(ABC):
    @abstractmethod
    def build_week_plan(
        self,
        profile: UserProfile,
        events: list[RaceEvent],
        fatigue: FatigueBudget,
        nutrition: NutritionAdvice,
        context: CoachContext | None = None,
    ) -> TrainingPlan:
        """Build a sport-specific candidate plan."""
