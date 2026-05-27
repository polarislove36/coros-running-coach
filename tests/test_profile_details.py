from multisport_ai_coach.domain import (
    BodyMetrics,
    FuelingProfile,
    HeartRateProfile,
    HeartRateZone,
    TrainingEnvironment,
    TrailRunningExperience,
    UserProfile,
)


def test_profile_captures_environment_trail_experience_and_fueling() -> None:
    profile = UserProfile(
        athlete_id="u1",
        timezone="Asia/Shanghai",
        weekly_training_days=6,
        body=BodyMetrics(height_cm=178, weight_kg=70, sex="male", age_years=35, weight_goal="maintain"),
        environment=TrainingEnvironment(
            outdoor_climbs_available=False,
            treadmill_available=True,
            stairs_available=True,
        ),
        trail_experience=TrailRunningExperience(
            longest_distance_km=100,
            max_elevation_gain_m=6000,
            longest_duration_hours_min=6,
            longest_duration_hours_max=10,
            tune_up_races_as_training=True,
        ),
        fueling=FuelingProfile(
            carb_tolerance_g_per_hour_min=80,
            carb_tolerance_g_per_hour_max=90,
            preferred_sources=("gel", "glucose+maltodextrin drink"),
            solid_food_ok=True,
        ),
        heart_rate=HeartRateProfile(
            max_hr_bpm=185,
            zones=(HeartRateZone("Z2", 131, 148),),
        ),
    )

    assert profile.environment.treadmill_available is True
    assert profile.body.weight_kg == 70
    assert profile.trail_experience.max_elevation_gain_m == 6000
    assert profile.fueling.carb_tolerance_g_per_hour_max == 90
    assert profile.heart_rate.max_hr_bpm == 185
    assert profile.heart_rate.zones[0].upper_bpm == 148


def test_body_metrics_are_in_intake_questions() -> None:
    from multisport_ai_coach.domain.questionnaire import PROFILE_INTAKE_QUESTIONS

    ids = {question["id"] for question in PROFILE_INTAKE_QUESTIONS}

    assert "body_metrics" in ids
    assert "heart_rate_profile" in ids
