# Trail Running Coach Module

The trail-running module is separate from road running because trail performance is not controlled by road pace alone.

## Current Inputs

- Target trail event date.
- Event distance.
- Event elevation gain when known.
- User injury constraints.
- Fatigue budget from the fatigue manager.
- Nutrition advice from the nutrition module.

## Current Outputs

- Trail skills easy run.
- Uphill aerobic strength session.
- Long trail run / hike-run when fatigue allows.
- Short hike-run recovery session when long sessions are not allowed.
- Downgrade rules for ankle, knee, quad, and high-load risk.

## Trail-Specific Controls

The module should eventually track:

- Weekly elevation gain.
- Descent exposure and eccentric load.
- Technical surface difficulty.
- Time-on-feet.
- Hike-run strategy.
- Poles and gear.
- Fueling tolerance.
- Heat, altitude, and remote-route safety.

## Future Reference Integration

Initial reference integration has started in [`docs/references/trail-running-principles.md`](references/trail-running-principles.md). When additional trail-running books or papers are added, convert them into concise coaching rules rather than long quotations. Likely areas:

- Uphill progression.
- Downhill tolerance and injury risk.
- Technical terrain skill sessions.
- Ultra/trail fueling.
- Strength for trail running.
- Race-specific taper and recovery.
