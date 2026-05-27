from datetime import date
from tempfile import TemporaryDirectory
from pathlib import Path

from multisport_ai_coach.analysis import CompletedWorkout
from multisport_ai_coach.data import LocalJsonStore
from multisport_ai_coach.demo import build_demo_events, build_demo_profile
from multisport_ai_coach.domain import SportType, TrainingPlan, TrainingSession


def test_local_store_saves_and_loads_profile_event_and_plan() -> None:
    with TemporaryDirectory() as tmp:
        store = LocalJsonStore(Path(tmp))
        profile = build_demo_profile()
        events = build_demo_events()
        plan = TrainingPlan(
            "Week 1",
            sessions=[TrainingSession("Tuesday", SportType.RUNNING, "轻松跑", 45, "easy", "Frequency.")],
        )

        store.save("profiles", profile.athlete_id, profile)
        store.save("events", profile.athlete_id, events)
        store.save("plans", "2026-05-26", plan)

        loaded_profile = store.load("profiles", "demo-athlete")
        loaded_events = store.load("events", "demo-athlete")
        loaded_plan = store.load("plans", "2026-05-26")

        assert loaded_profile["body"]["height_cm"] == 178
        assert loaded_events[0]["event_type"] == "trail_race"
        assert loaded_plan["sessions"][0]["sport"] == "running"
        assert store.list_keys("plans") == ("2026-05-26",)


def test_local_store_appends_completed_workouts() -> None:
    with TemporaryDirectory() as tmp:
        store = LocalJsonStore(Path(tmp))

        store.append_record(
            "completed_workouts",
            "demo-athlete",
            CompletedWorkout(date(2026, 5, 28), SportType.RUNNING, 55, training_load=88),
        )
        store.append_record(
            "completed_workouts",
            "demo-athlete",
            CompletedWorkout(date(2026, 5, 29), SportType.CYCLING, 60, training_load=70),
        )

        loaded = store.load("completed_workouts", "demo-athlete")

        assert len(loaded) == 2
        assert loaded[0]["date"] == "2026-05-28"
        assert loaded[1]["sport"] == "cycling"
