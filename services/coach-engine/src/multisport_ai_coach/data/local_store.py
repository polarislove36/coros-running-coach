from __future__ import annotations

import json
from dataclasses import asdict, is_dataclass
from datetime import date
from enum import Enum
from pathlib import Path
from typing import Any


class LocalJsonStore:
    """Small file-backed store for the local prototype."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, collection: str, key: str, value: Any) -> Path:
        path = self._path(collection, key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(_to_jsonable(value), ensure_ascii=False, indent=2), encoding="utf-8")
        return path

    def load(self, collection: str, key: str) -> dict[str, Any]:
        path = self._path(collection, key)
        return json.loads(path.read_text(encoding="utf-8"))

    def list_keys(self, collection: str) -> tuple[str, ...]:
        folder = self.root / collection
        if not folder.exists():
            return ()
        return tuple(sorted(path.stem for path in folder.glob("*.json")))

    def append_record(self, collection: str, key: str, record: Any) -> Path:
        records = []
        path = self._path(collection, key)
        if path.exists():
            loaded = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(loaded, list):
                raise ValueError(f"{path} does not contain a JSON list")
            records = loaded
        records.append(_to_jsonable(record))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
        return path

    def _path(self, collection: str, key: str) -> Path:
        safe_collection = _safe_name(collection)
        safe_key = _safe_name(key)
        return self.root / safe_collection / f"{safe_key}.json"


def _safe_name(value: str) -> str:
    safe = "".join(char if char.isalnum() or char in ("-", "_") else "-" for char in value.strip())
    while "--" in safe:
        safe = safe.replace("--", "-")
    return safe.strip("-") or "default"


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
