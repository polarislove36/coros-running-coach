from __future__ import annotations

import json
from dataclasses import asdict, is_dataclass
from datetime import date
from enum import Enum
from typing import Any

from multisport_ai_coach.domain import TrainingPlan


def plan_to_dict(plan: TrainingPlan) -> dict[str, Any]:
    return _to_jsonable(plan)


def render_json(value: Any, *, indent: int = 2) -> str:
    return json.dumps(_to_jsonable(value), ensure_ascii=False, indent=indent)


def _to_jsonable(value: Any) -> Any:
    if is_dataclass(value):
        return {key: _to_jsonable(item) for key, item in asdict(value).items()}
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, tuple):
        return [_to_jsonable(item) for item in value]
    if isinstance(value, list):
        return [_to_jsonable(item) for item in value]
    if isinstance(value, dict):
        return {str(key): _to_jsonable(item) for key, item in value.items()}
    return value
