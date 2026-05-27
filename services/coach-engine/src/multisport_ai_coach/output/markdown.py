from __future__ import annotations

from multisport_ai_coach.domain import TrainingPlan


def render_markdown(plan: TrainingPlan) -> str:
    lines = [f"# {plan.title}", ""]

    if plan.notes:
        lines.append("## Notes")
        for note in plan.notes:
            lines.append(f"- {note}")
        lines.append("")

    lines.extend(
        [
            "## Sessions",
            "| Day | Sport | Session | Duration | Intensity | Purpose | Nutrition |",
            "|---|---|---|---:|---|---|---|",
        ]
    )

    for session in plan.sessions:
        nutrition = session.nutrition or ""
        if session.downgrade:
            nutrition = f"{nutrition} Downgrade: {session.downgrade}".strip()
        lines.append(
            f"| {session.day} | {session.sport.value} | {session.title} | "
            f"{session.duration_minutes} min | {session.intensity} | {session.purpose} | {nutrition} |"
        )

    return "\n".join(lines)

