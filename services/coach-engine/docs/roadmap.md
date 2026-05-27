# Roadmap

## Phase 1: Local Prototype

- Define domain models.
- Implement Coach Router.
- Implement fatigue budget.
- Implement nutrition advisor.
- Implement running, cycling, and trail-running candidate coaches.
- Render weekly plan as Markdown.
- Add plan quality checks for structured workout stages and precise calendar instructions.
- Add local JSON persistence for prototype user state, events, plans, and completed workouts.

## Phase 2: COROS Integration

- Wrap COROS MCP reads behind a `CorosDataSource` adapter.
- Persist normalized activities and readiness snapshots.
- Add activity detail analyzers for run, bike, and trail.
- Use real recent training data in weekly plan generation.
- Compare completed workouts with planned sessions and produce adjustment guidance.

## Phase 3: Calendar Output

- Generate ICS calendar events from training sessions.
- Keep event descriptions focused on executable workout instructions.
- Support a subscription URL or static ICS export.

## Phase 4: More Coach Modules

- Expand trail running with book-derived rules for elevation, downhill load, technical terrain, hiking strategy, and trail fueling.
- Add HYROX module.
- Add swimming module.
- Add strength and mobility module.
- Add nutrition periodization by event type.

## Phase 5: Daily Adjustment Loop

- Read latest COROS data each morning.
- Compare planned vs completed training.
- Adjust next 3-7 days.
- Notify the user when a workout should be downgraded, moved, or skipped.
