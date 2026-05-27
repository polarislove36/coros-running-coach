from datetime import date

from multisport_ai_coach.data import DEFAULT_DATA_SYNC_POLICY, DataSyncPolicy


def test_default_sync_policy_uses_90_day_history() -> None:
    policy = DEFAULT_DATA_SYNC_POLICY

    assert policy.history_days == 90
    assert policy.load_days == 42
    assert policy.wellness_days == 21
    assert policy.acute_days == 7
    assert policy.schedule_days == 14


def test_sync_policy_calculates_windows() -> None:
    policy = DataSyncPolicy(history_days=90, load_days=42, wellness_days=21, acute_days=7, schedule_days=14)
    today = date(2026, 5, 26)

    assert policy.history_start(today) == date(2026, 2, 25)
    assert policy.load_start(today) == date(2026, 4, 14)
    assert policy.wellness_start(today) == date(2026, 5, 5)
    assert policy.acute_start(today) == date(2026, 5, 19)
    assert policy.schedule_end(today) == date(2026, 6, 9)
