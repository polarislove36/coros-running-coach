from multisport_ai_coach.domain import HeartRateProfile, HeartRateZone, SportType, TrainingSession, WorkoutStage
from multisport_ai_coach.orchestration.zones import (
    enrich_sessions_with_heart_rate_zones,
    resolve_heart_rate_zone,
)


def test_resolve_heart_rate_zone_uses_manual_bpm_ranges() -> None:
    profile = HeartRateProfile(
        zones=(
            HeartRateZone("Z1", 111, 130),
            HeartRateZone("Z2", 131, 148),
        )
    )

    assert resolve_heart_rate_zone("Z1-Z2", profile) == "Z1 111-130 bpm / Z2 131-148 bpm"


def test_resolve_heart_rate_zone_preserves_prescription_order() -> None:
    profile = HeartRateProfile(
        zones=(
            HeartRateZone("Z1", 111, 130),
            HeartRateZone("Z3", 149, 166),
        )
    )

    assert resolve_heart_rate_zone("Z3/Z1", profile) == "Z3 149-166 bpm / Z1 111-130 bpm"


def test_resolve_heart_rate_zone_can_derive_from_max_hr() -> None:
    profile = HeartRateProfile(max_hr_bpm=185)

    assert resolve_heart_rate_zone("Z2, low Z3 cap", profile) == "Z2 130-148 bpm / Z3 148-166 bpm (low cap)"


def test_enrich_sessions_with_heart_rate_zones_updates_workout_stages() -> None:
    session = TrainingSession(
        day="Thursday",
        sport=SportType.TRAIL_RUNNING,
        title="Hill reps",
        duration_minutes=45,
        intensity="Z2",
        purpose="Climbing.",
        workout_stages=(WorkoutStage("Uphill", 30, heart_rate_zone="Z2"),),
    )

    enriched = enrich_sessions_with_heart_rate_zones(
        [session],
        HeartRateProfile(zones=(HeartRateZone("Z2", 131, 148),)),
    )

    assert enriched[0].workout_stages[0].heart_rate_zone == "Z2 131-148 bpm"
