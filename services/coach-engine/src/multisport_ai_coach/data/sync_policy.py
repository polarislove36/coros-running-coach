from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta


@dataclass(frozen=True)
class DataSyncPolicy:
    """Default lookback windows for COROS-backed coaching decisions."""

    history_days: int = 90
    load_days: int = 42
    wellness_days: int = 21
    acute_days: int = 7
    schedule_days: int = 14

    def history_start(self, today: date) -> date:
        return today - timedelta(days=self.history_days)

    def load_start(self, today: date) -> date:
        return today - timedelta(days=self.load_days)

    def wellness_start(self, today: date) -> date:
        return today - timedelta(days=self.wellness_days)

    def acute_start(self, today: date) -> date:
        return today - timedelta(days=self.acute_days)

    def schedule_end(self, today: date) -> date:
        return today + timedelta(days=self.schedule_days)


DEFAULT_DATA_SYNC_POLICY = DataSyncPolicy()
