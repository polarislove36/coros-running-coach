from multisport_ai_coach.data import CorosConnectionStatus, check_coros_connection, onboarding_steps


def test_connection_reports_not_configured() -> None:
    check = check_coros_connection(configured=False)

    assert check.status == CorosConnectionStatus.NOT_CONFIGURED
    assert check.can_read_data is False
    assert "codex mcp login coros" in check.next_action


def test_connection_reports_authorized_when_probe_succeeds() -> None:
    check = check_coros_connection(configured=True, probe=lambda: {"recovery": 100})

    assert check.status == CorosConnectionStatus.AUTHORIZED
    assert check.can_read_data is True
    assert onboarding_steps(check)[0] == "COROS is connected."


def test_connection_classifies_auth_errors() -> None:
    def probe() -> None:
        raise RuntimeError("Unauthorized: login required")

    check = check_coros_connection(configured=True, probe=probe)

    assert check.status == CorosConnectionStatus.NEEDS_LOGIN
    assert "browser authorization" in check.next_action


def test_connection_classifies_expired_token_errors() -> None:
    def probe() -> None:
        raise RuntimeError("refresh token expired")

    check = check_coros_connection(configured=True, probe=probe)

    assert check.status == CorosConnectionStatus.EXPIRED
    assert onboarding_steps(check)[0] == 'Run "codex mcp login coros".'
