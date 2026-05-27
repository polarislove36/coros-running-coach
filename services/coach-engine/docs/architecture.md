# Architecture Notes

## Product Idea

Multi-Sport AI Coach is a dynamic season-planning system for athletes who train and race across multiple sports. It uses COROS data as the main signal source, combines it with a race calendar and user profile, then activates only the coach modules required by the user's goals.

## Core Loop

```mermaid
flowchart LR
    A["Collect COROS data"] --> B["Update user state"]
    B --> C["Analyze fatigue and load"]
    C --> D["Route to relevant coaches"]
    D --> E["Generate candidate plans"]
    E --> F["Coordinate cross-sport conflicts"]
    F --> G["Render plan / calendar"]
    G --> A
```

## Modules

### COROS Data Collection

Responsible for retrieving:

- Devices and available sensors.
- Training records and activity details.
- Recovery, HRV, sleep, resting heart rate, stress, and training load.
- Sport-specific metrics such as pace, elevation, cadence, FTP, power, normalized power, and load when available.

The first implementation should wrap COROS MCP tools. The internal application should depend on a stable data-source interface, not on tool names directly.

### User Profile

Stores stable and semi-stable context:

- Basic body metrics and timezone: height, weight, sex, age or birth year, and weight goal.
- Primary sports and training background.
- Performance anchors such as running threshold pace and cycling FTP.
- Weekly training availability: total training hours, per-day time windows, and whether two-a-day training is acceptable.
- Training environment: outdoor climbs, treadmill, stairs, gym, route limitations, and safe long-session options.
- Sport background: longest distance, maximum elevation gain, longest duration, and whether tune-up races are treated as training.
- Fueling profile: carbohydrate tolerance, preferred sources, solid-food tolerance, and known GI issues.
- Injuries, preferences, equipment, and nutrition constraints.

The first availability intake should ask:

- What are your height, weight, sex, age or birth year, and current body-weight goal?
- How many hours can you train in a normal week? A range such as 8-10 hours is acceptable.
- How is that time distributed across days?
- Can you accept two training sessions in one day? If yes, how many days per week and which days are realistic?
- Which terrain and facilities are available for your target events?
- What is your longest relevant event/training history?
- What fueling strategy can you actually tolerate during long sessions?

### Race Calendar

Stores target races and priorities. The Coach Router uses it to decide which sport coaches run in active mode.

### Coach Router

Maps event types to active coach modules:

- Half marathon and marathon -> running.
- Road cycling events -> cycling.
- Trail races -> trail running.
- HYROX -> HYROX.
- Swim events -> swimming.

Sports without target races can still appear as support modules when they are part of the user's normal training or useful for recovery.

### Fatigue Manager

Converts readiness signals into a weekly training budget:

- Volume direction.
- Maximum hard-session count.
- Whether a long session is allowed.
- Intensity ceiling.
- Risk flags.

### Nutrition Advisor

Generates nutrition guidance based on phase, recovery status, training duration, intensity, and event demands.

It should influence the plan, not only append notes. For example, a long ride that cannot be fueled should be downgraded.

### Sport Coaches

Each coach module owns sport-specific logic and references:

- Running.
- Cycling.
- Trail running.
- HYROX.
- Swimming.
- Strength and mobility.

Each module returns candidate sessions and constraints. It does not make final cross-sport decisions.

Trail running is intentionally separate from road running because it needs its own controls: elevation gain, descent load, technical terrain, time-on-feet, hiking strategy, equipment, and fueling tolerance.

### Cross-Sport Coordinator

Resolves conflicts between candidate plans:

- Too many hard lower-body sessions.
- Long ride too close to key run.
- Strength session interfering with race taper.
- Recovery signals contradicting planned intensity.
- Nutrition constraints making a session unrealistic.

### Plan Quality Gate

Checks the final plan before calendar delivery:

- Structured stages exist for each non-rest session.
- Stage durations add up to the session total.
- Execution instructions avoid ambiguous ranges.
- Each stage has a heart-rate, power, or pace target unless intentionally technique-only.

### Workout Review

Compares completed workouts against planned sessions:

- Completion ratio.
- Planned-versus-actual load delta.
- Sport mismatch.
- Short adjustment guidance for the next 24-48 hours.

### Output

Initial output is Markdown. The next practical format should be ICS/iCal because it syncs naturally to calendar apps.
