# COROS Data Workflow

Use this when COROS MCP tools are available.

Core rule: for COROS users, read first and ask later. Do not ask the user to provide data that these tools can retrieve or reasonably infer.

## Data to Query

For short-term planning:

- Recovery status: current readiness.
- Fitness assessment overview: VO2max, running level, threshold pace, and race predictions when available.
- Training load assessment: 21-42 days.
- HRV assessment: 21-42 days.
- Resting heart rate: 14-21 days.
- Sleep data: 14-21 days.
- Daily health data: 14-21 days.
- Training schedule: requested date range.
- Sport records: recent 3-14 days for the latest completed activity and recent training rhythm.

For activity-level coaching:

- Query sport records/activity list or schedule when available.
- Use activity detail only for important recent sessions, hard workouts, long runs, or races.
- If the current COROS MCP does not expose activity lists, PBs, or race records, state the limitation before asking the user for those values.

## Interpretation

Look for:

- Current recovery percentage and level.
- Short-term vs long-term training load and load ratio.
- HRV relative to normal range and baseline.
- Sleep duration/score and recent consistency.
- Stress, resting HR, steps, exercise time, and signs of life load.
- Current scheduled workouts that may need to be modified.

## Planning Rules

- If COROS says "heavy training allowed" but the athlete is in race taper, still reduce volume.
- If COROS schedule has high load too close to a race, explain why you are overriding it.
- If data is inconsistent or missing, say which metrics are missing and lean conservative.
- Keep the user's race goal, available terrain, and injury report above watch-generated suggestions.

## Daily Automation Review

When running as a daily recurring task, output a compact but complete Chinese review:

1. Data snapshot: latest activity, recovery, HRV, sleep, training load ratio, and missing data.
2. Latest activity review: what the runner did, whether pace/HR/load matched the intended purpose, and any risk signal.
3. Readiness judgment: keep, downgrade, or rest.
4. Next three days: a table with date, training item, reference pace/HR, purpose, and adjustment reason.
5. Stop/downgrade rules.
6. End with the read-only COROS write-back limitation.

Make the readiness judgment directly from available data. Do not write conditional advice such as `如果今天静息心率偏高就自己降级` when resting HR, HRV, recovery, and sleep are available. Instead, state the decision:

- `保持计划`: recovery normal/high, HRV normal or above baseline, resting HR not meaningfully elevated, sleep acceptable, load ratio controlled.
- `降级为轻松跑`: resting HR meaningfully above recent baseline, HRV below normal, poor sleep, elevated load ratio, or latest workout looked harder than intended.
- `休息/交叉训练`: multiple red flags, illness, pain, very poor sleep, very low recovery, unusual muscle soreness, or obvious weakness.

If a metric is missing, name the missing metric and make a conservative coach decision from the remaining data.

If the first COROS authorization succeeds, suggest a daily automation once. Suggested wording:

> 可以把这个设成每天早上的定时任务：读取上一次运动记录、恢复/HRV/睡眠/负荷，并给出未来三天是否需要调整。需要我帮你设吗？

Do not create the automation unless the user explicitly asks or confirms.
