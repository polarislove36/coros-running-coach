from __future__ import annotations

from datetime import date

from multisport_ai_coach.domain import FatigueBudget, NutritionAdvice, RaceEvent, UserProfile


class NutritionAdvisor:
    """Produces nutrition guidance tied to period, training load, and events."""

    def advise(
        self,
        today: date,
        events: list[RaceEvent],
        budget: FatigueBudget,
        profile: UserProfile | None = None,
    ) -> NutritionAdvice:
        next_event = min(events, key=lambda event: event.date) if events else None
        days_to_event = (next_event.date - today).days if next_event else None

        if days_to_event is not None and days_to_event <= 10:
            phase_focus = "race-week fueling and familiar foods"
        elif "decrease" in budget.weekly_volume_direction:
            phase_focus = "recovery nutrition and glycogen restoration"
        else:
            phase_focus = "support base/build training with adequate carbohydrate and protein"

        daily_guidance = (
            "Keep regular meals; avoid stacking hard training with aggressive calorie restriction.",
            "Anchor each meal with carbohydrate, protein, and fluids during build weeks.",
        )
        workout_fueling = (
            "For sessions over 90 minutes, start fueling early with 40-60g carbohydrate per hour.",
            "For high-intensity bike or run sessions, eat carbohydrate 3 hours before training.",
        )
        recovery_guidance = (
            "After long or hard sessions, combine carbohydrate with 20-40g protein.",
            "Prioritize fluids and electrolytes when heat, sweat loss, or high stress is present.",
        )

        if profile and profile.body.weight_kg:
            protein_min = round(profile.body.weight_kg * 1.6)
            protein_max = round(profile.body.weight_kg * 2.0)
            daily_guidance = daily_guidance + (
                f"Use body weight to personalize nutrition; a typical endurance protein range is about {protein_min}-{protein_max}g/day.",
            )
            if profile.body.weight_goal in {"lose_weight", "weight_loss", "减重"}:
                daily_guidance = daily_guidance + (
                    "If weight loss is a goal near an A race, keep the deficit small and avoid restricting fuel around key sessions.",
                )

        if profile and profile.fueling.carb_tolerance_g_per_hour_min and profile.fueling.carb_tolerance_g_per_hour_max:
            workout_fueling = workout_fueling + (
                f"Known gut tolerance: {profile.fueling.carb_tolerance_g_per_hour_min}-{profile.fueling.carb_tolerance_g_per_hour_max}g carbohydrate/hour for long events.",
            )

        return NutritionAdvice(
            phase_focus=phase_focus,
            daily_guidance=daily_guidance,
            workout_fueling=workout_fueling,
            recovery_guidance=recovery_guidance,
        )
