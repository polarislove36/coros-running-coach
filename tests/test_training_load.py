from multisport_ai_coach.analysis import TrainingLoadEstimator


def test_training_load_uses_official_coros_load_first() -> None:
    estimate = TrainingLoadEstimator().estimate(
        {"training_load": 800, "duration_minutes": 402, "average_hr_bpm": 142}
    )

    assert estimate.score == 800
    assert estimate.source == "coros"


def test_training_load_estimates_cycling_tss_from_np_and_ftp() -> None:
    estimate = TrainingLoadEstimator().estimate(
        {"duration_minutes": 188, "normalized_power_watts": 127},
        ftp_watts=194,
    )

    assert estimate.source == "power"
    assert estimate.details["intensity_factor"] == 0.65
    assert 132 <= estimate.score <= 135


def test_training_load_estimates_trail_load_from_hr_duration_and_terrain() -> None:
    estimate = TrainingLoadEstimator().estimate(
        {
            "sport": "Trail Run",
            "duration_minutes": 402,
            "average_hr_bpm": 142,
            "elevation_gain_m": 1984,
        }
    )

    assert estimate.source == "heart_rate"
    assert estimate.details["terrain_factor"] > 1
    assert estimate.score > 500
