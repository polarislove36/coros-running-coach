from datetime import date

from multisport_ai_coach.data import CorosTextPayloadDataSource, parse_activity_detail_text


def test_coros_text_payload_maps_readiness() -> None:
    source = CorosTextPayloadDataSource(
        recovery_text="Recovery Status\nRecovery: 100%\nLevel: Heavy training allowed",
        training_load_text=(
            "Training Load Assessment\n\n"
            "2026-05-26\n"
            "Comment: Excessive\n"
            "Short-Term Load: 96\n"
            "Long-Term Load: 54\n"
            "Load Ratio: 1.77\n"
        ),
    )

    readiness = source.get_readiness(date(2026, 5, 26))

    assert readiness.recovery_percent == 100
    assert readiness.short_term_load == 96
    assert readiness.long_term_load == 54
    assert readiness.load_ratio == 1.77
    assert "COROS load comment: Excessive" in readiness.notes


def test_coros_text_payload_maps_recent_activities() -> None:
    source = CorosTextPayloadDataSource(
        sport_records_text=(
            "Sport Records — 2026-05-12 to 2026-05-26 (2 records)\n\n"
            "1. Trail Run — 2026-05-23\n"
            "   Location: Dalian Trail Run\n"
            "   Duration: 6:41:47 | Distance: 36.62 km\n"
            "   Average Pace: 10:58 /km | Avg HR: 142 bpm | Calories: 3531 kcal\n"
            "   LabelId: 477684059653308615 | SportType: 102\n\n"
            "2. Cycling — 2026-05-17\n"
            "   Location: Shanghai Road Cycling\n"
            "   Duration: 3:07:32 | Distance: 89.78 km\n"
            "   Average Speed: 28.7 km/h | Avg HR: 161 bpm | Calories: 1459 kcal\n"
            "   LabelId: 477544674276442313 | SportType: 200\n"
        )
    )

    rides = source.get_recent_activities(date(2026, 5, 12), date(2026, 5, 26), (200,))
    runs = source.get_recent_activities(date(2026, 5, 12), date(2026, 5, 26), (102,))

    assert len(rides) == 1
    assert rides[0]["distance_km"] == 89.78
    assert rides[0]["duration_minutes"] == 188
    assert rides[0]["average_speed_kmh"] == 28.7
    assert runs[0]["average_pace"] == "10:58 /km"
    assert source.get_activity_detail("477544674276442313", 200)["average_hr_bpm"] == 161


def test_parse_activity_detail_text_extracts_load_and_elevation() -> None:
    detail = parse_activity_detail_text(
        "477684059653308615",
        102,
        (
            "Trail Run Activity Details\n"
            "Workout Time: 6:41:47\n"
            "Distance: 36.62 km\n"
            "Average Pace: 10:58 /km\n"
            "Average Heart Rate: 142 bpm\n"
            "Elevation Gain / Loss: 1984 m / 1875 m\n"
            "Calories: 3531 kcal\n"
            "Training Load: 800\n"
        ),
    )

    assert detail["duration_minutes"] == 402
    assert detail["elevation_gain_m"] == 1984
    assert detail["training_load"] == 800


def test_parse_activity_detail_text_extracts_cycling_power() -> None:
    detail = parse_activity_detail_text(
        "477544674276442313",
        200,
        (
            "Cycling Activity Details\n"
            "Workout Time: 3:07:32\n"
            "Distance: 89.78 km\n"
            "Average Power: 119 W\n"
            "NP: 127 W\n"
            "Maximum 20 minute Power: 166 W\n"
        ),
    )

    assert detail["average_power_watts"] == 119
    assert detail["normalized_power_watts"] == 127
    assert detail["max_20_min_power_watts"] == 166
