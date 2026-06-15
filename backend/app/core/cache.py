import time
from typing import Any

_store: dict[tuple, tuple[Any, float]] = {}


def get(key: tuple) -> Any | None:
    entry = _store.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.monotonic() > expires_at:
        del _store[key]
        return None
    return value


def set(key: tuple, value: Any, ttl: float = 30.0) -> None:
    _store[key] = (value, time.monotonic() + ttl)


def invalidate_prefix(prefix: str) -> None:
    keys = [k for k in _store if k[0] == prefix]
    for k in keys:
        del _store[k]
