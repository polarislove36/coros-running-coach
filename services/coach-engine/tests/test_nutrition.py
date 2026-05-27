from datetime import date

from multisport_ai_coach.domain import (
    BodyMetrics,
    FuelingProfile,
    ReadinessSnapshot,
    TrainingAvailability,
    UserProfile,
)
from multisport_ai_coach.fatigue.manager import FatigueManager
from multisport_ai_coach.nutrition.advisor import NutritionAdvisor


def test_nutrition_uses_body_weight_goal_and_fueling_tolerance() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        body=BodyMetrics(height_cm=178, weight_kg=70, birth_year=1986, weight_goal="lose_weight"),
        availability=TrainingAvailability(weekly_hours_min=8, weekly_hours_max=10),
        fueling=FuelingProfile(carb_tolerance_g_per_hour_min=80, carb_tolerance_g_per_hour_max=90),
    )
    budget = FatigueManager().build_budget(ReadinessSnapshot(date=date(2026, 5, 26), load_ratio=1.0))

    advice = NutritionAdvisor().advise(date(2026, 5, 26), [], budget, profile)

    assert any("112-140g/day" in item for item in advice.daily_guidance)
    assert any("deficit small" in item for item in advice.daily_guidance)
    assert any("80-90g carbohydrate/hour" in item for item in advice.workout_fueling)

