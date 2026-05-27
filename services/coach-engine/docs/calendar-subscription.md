# Calendar Export and Subscription

The prototype can export a weekly training plan as an `.ics` calendar file. This supports two workflows:

- Import: add the generated events once to a calendar.
- Subscribe: point a calendar app at a stable URL so future generated plans can refresh.

## Generate a Demo Calendar

```bash
PYTHONPATH=src python3 -m multisport_ai_coach.demo \
  --weeks 1 \
  --format ics \
  --output outputs/training-plan-demo.ics
```

The demo calendar uses the sample athlete profile from the prototype: 2026-07-17 120km trail A race, 2026-10-24 90km bike B race, 8-10 weekly training hours, Saturday rest day, FTP 194W, and the recent high-load trail race context.

Generated files under `outputs/` are ignored by Git because they may contain personal training details.

## Calendar Event Content

Calendar descriptions are intentionally limited to the workout prescription:

- Total duration.
- Stage-by-stage duration.
- Heart-rate, power, or pace zone for each stage when available.
- Execution requirements such as cycling cadence, running cadence, treadmill incline, or short technique cues.

Planning rationale, fatigue-management notes, downgrade rules, and nutrition explanations stay in the full weekly plan output instead of the calendar event.

## Local Subscription Test

Serve the generated file from the project root:

```bash
python3 -m http.server 8765 --directory outputs
```

Then subscribe from a calendar app on the same computer:

```text
http://127.0.0.1:8765/training-plan-demo.ics
```

Apple Calendar can usually subscribe to this local URL from the same Mac:

```text
File > New Calendar Subscription > paste the local URL
```

Google Calendar usually cannot subscribe to `127.0.0.1` because Google needs to fetch the calendar from a public URL. For Google Calendar, the project will need a hosted private calendar URL.

## Real Subscription Model

For a production workflow, the calendar subscription should use:

- A stable private URL per user.
- A signed token in the URL rather than exposing user identity.
- Daily regeneration after COROS sync and plan adjustment.
- Stable event UIDs so calendar apps update existing sessions instead of creating duplicates.
- A privacy warning because calendar files can reveal race dates, training locations, and health-related training load.

## COROS Payload Calendar

When a captured COROS payload bundle is available, generate a plan calendar from the imported data:

```bash
PYTHONPATH=src python3 -m multisport_ai_coach.coros_live_demo \
  --bundle payloads/coros-2026-05-26 \
  --format ics \
  --output outputs/coros-training-plan.ics
```
