from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Callable


class CorosConnectionStatus(str, Enum):
    NOT_CONFIGURED = "not_configured"
    NEEDS_LOGIN = "needs_login"
    AUTHORIZED = "authorized"
    EXPIRED = "expired"
    UNAVAILABLE = "unavailable"


@dataclass(frozen=True)
class CorosConnectionCheck:
    status: CorosConnectionStatus
    message: str
    next_action: str

    @property
    def can_read_data(self) -> bool:
        return self.status == CorosConnectionStatus.AUTHORIZED


ProbeFn = Callable[[], object]


def check_coros_connection(*, configured: bool, probe: ProbeFn | None = None) -> CorosConnectionCheck:
    """Return a user-facing connection state without exposing MCP internals.

    The caller owns the actual MCP probe because Codex, a web backend, and a
    local CLI will each call COROS differently. This function standardizes the
    decision and wording around that probe.
    """

    if not configured:
        return CorosConnectionCheck(
            status=CorosConnectionStatus.NOT_CONFIGURED,
            message="COROS MCP is not configured.",
            next_action='Add the COROS MCP server, then run "codex mcp login coros".',
        )

    if probe is None:
        return CorosConnectionCheck(
            status=CorosConnectionStatus.NEEDS_LOGIN,
            message="COROS MCP is configured, but authorization has not been verified.",
            next_action='Run "codex mcp login coros", then verify recovery or device data.',
        )

    try:
        probe()
    except Exception as exc:  # noqa: BLE001 - probe errors come from external MCP clients.
        return _classify_probe_error(exc)

    return CorosConnectionCheck(
        status=CorosConnectionStatus.AUTHORIZED,
        message="COROS MCP is connected and readable.",
        next_action="Read recovery, load, sleep, HRV, and recent activities.",
    )


def onboarding_steps(check: CorosConnectionCheck) -> tuple[str, ...]:
    if check.status == CorosConnectionStatus.AUTHORIZED:
        return ("COROS is connected.", "Continue to data sync and plan generation.")
    if check.status == CorosConnectionStatus.NOT_CONFIGURED:
        return (
            "Add the COROS MCP server URL to the app configuration.",
            'Run "codex mcp login coros".',
            "Complete COROS authorization in the browser.",
            "Verify by reading recovery status or devices.",
        )
    if check.status in {CorosConnectionStatus.NEEDS_LOGIN, CorosConnectionStatus.EXPIRED}:
        return (
            'Run "codex mcp login coros".',
            "Complete COROS authorization in the browser.",
            "Verify by reading recovery status or devices.",
        )
    return (
        "Retry the COROS MCP connection.",
        "If it still fails, continue with conservative questionnaire mode.",
    )


def _classify_probe_error(exc: Exception) -> CorosConnectionCheck:
    text = str(exc).lower()
    if any(marker in text for marker in ("expired", "refresh token", "token expired")):
        return CorosConnectionCheck(
            status=CorosConnectionStatus.EXPIRED,
            message="COROS authorization appears to be expired.",
            next_action='Run "codex mcp login coros" again.',
        )
    if any(marker in text for marker in ("unauthorized", "forbidden", "login", "auth")):
        return CorosConnectionCheck(
            status=CorosConnectionStatus.NEEDS_LOGIN,
            message="COROS MCP needs user authorization.",
            next_action='Run "codex mcp login coros" and complete browser authorization.',
        )
    return CorosConnectionCheck(
        status=CorosConnectionStatus.UNAVAILABLE,
        message="COROS MCP is configured but not currently readable.",
        next_action="Retry later or continue with questionnaire mode.",
    )
