# Design Context From Initial User Conversation

This file captures the product decisions and user language from the initial design conversation for `coros-running-coach`. Use it when updating the skill so future changes preserve the intended behavior.

## Product Positioning

The first version should focus only on COROS users and road running.

- Start with COROS watch users.
- If the user has COROS, guide them through COROS MCP setup and authorization.
- If the user does not have COROS or COROS data is unavailable, assume no wearable data and use an intake questionnaire.
- Do not support trail running in this version. Trail/ultra is a future special case.
- Do not attempt broad support for Garmin, Suunto, Huawei, Apple Watch, Xiaomi, or other platforms yet.

## COROS Data Principle

For COROS users, the core experience is:

> 先读取、先分析、再提问。

Do not ask the user for anything that can be read or reasonably inferred from COROS MCP data.

Read available COROS data first:

- recovery
- HRV
- sleep
- training load
- daily health
- training schedule
- device status

Only ask for subjective or unavailable information:

- target race
- target time
- weekly training availability
- pain/injury not visible in data
- strength/cross-training preference
- data the current MCP does not expose, such as PB records or complete historical race/activity lists

If a metric may exist in the COROS app but the current MCP does not expose it, say that limitation before asking.

## Onboarding Flow

When data access is unclear, start by asking:

> 你有高驰 COROS 手表并愿意授权我读取训练数据吗？如果有，我可以先带你安装/授权 COROS MCP；如果没有，我会用问卷方式生成保守训练计划。

If the user has COROS but no MCP:

1. Add COROS MCP to Codex config.
2. Restart Codex.
3. Run `codex mcp login coros`.
4. Complete browser authorization.
5. Restart Codex again.
6. Confirm with a low-risk query such as devices or recovery.

## Write-Back Boundary

Current COROS MCP is read-only.

The skill can:

- read COROS data
- review yesterday's training
- evaluate current recovery and readiness
- generate plans
- adjust today's workout

The skill cannot currently:

- write workouts back to the COROS watch
- modify the COROS calendar
- create structured workouts inside COROS

Important user preference:

- Do not mention this limitation during intake or halfway through asking questions.
- Put the limitation at the end of a complete generated plan.

Preferred wording:

> 最后提醒：我可以读取高驰数据、每天复盘并调整训练计划，但目前不能把训练直接写回高驰手表；你需要手动照着执行，或自己在高驰里创建训练。

## Daily Automation Concept

The user wants the skill to support recurring daily coaching.

Daily task behavior:

1. Read COROS data every morning.
2. Review yesterday's training.
3. Check recovery, HRV, sleep, training load, daily health, and today's schedule.
4. Decide whether to keep, reduce, remove intensity, replace with cross-training, or rest.
5. Output today's adjusted plan.

Suggested user prompt:

> 使用 $coros-running-coach，为我设置每天早上 7 点读取高驰数据并调整今日训练。

The recurring task should not be created unless the user explicitly asks for it.

## Training Scope

Current scope:

- 5K
- 10K
- half marathon
- marathon
- weekly road-running plans
- race taper
- race recovery
- base building
- strength once or twice weekly as appropriate
- cross-training with swimming, cycling, elliptical, walking, or mobility

Out of scope for now:

- trail running
- ultra running
- trail-specific climbing/descending
- elevation-specific planning
- multi-brand wearable integrations

## Terminology Preference

Do not use unexplained English running jargon in Chinese outputs.

The user specifically rejected `strides` and asked to call it:

> 短时间冲刺跑

Definition for planning:

- 4-8 repetitions
- 15-20 seconds each
- fast but smooth
- full easy jog/walk recovery
- not all-out, not to exhaustion
- used after easy runs for running form, cadence, and neuromuscular sharpness

Avoid calling it `strides`, `短加速跑`, or `放松加速跑` unless the user later changes the wording.

## Question Design

For non-COROS users or missing data, ask only what is necessary.

Keep intake lightweight. Avoid asking everything at once.

Minimum useful questions:

- target race date and distance
- goal: finish, PB, target time, speed, endurance, recovery
- weekly availability
- recent mileage if no COROS data
- injury/pain
- training modes available
- strength preference

The user removed road/surface type from required questions. Ask about environment only when there are constraints, such as treadmill-only or track-only training.

## Runner Shorthand

For marathon PBs and targets:

- `357` usually means `3:57`
- `330` usually means `3:30`

Confirm only when ambiguous.

## Desired Output Style

Default output language: Chinese.

Tone:

- clear
- practical
- not overly technical
- no unexplained English terms
- concise but specific

Each plan should include:

- snapshot of data used
- coaching judgment
- plan table
- purpose of each workout
- adjustment rules based on HRV/sleep/recovery/pain/load
- strength/cross-training guidance
- final write-back limitation note

## Sources And Principles Discussed

The skill can reference these principles when needed:

- Most endurance training should be easy aerobic work with limited moderate/hard work.
- Build training volume gradually from recent baseline.
- Taper by reducing volume while keeping small controlled intensity touches.
- Strength training can help running economy and durability, but heavy lower-body work should not be near an A race.
- HRV should be one signal among several, not the sole decision maker.

Public references used during design:

- Seiler, training intensity distribution: https://pubmed.ncbi.nlm.nih.gov/20861519/
- Tapering meta-analysis: https://pubmed.ncbi.nlm.nih.gov/17762369/
- Strength training and running economy: https://pubmed.ncbi.nlm.nih.gov/26694507/
- HRV-guided training: https://pubmed.ncbi.nlm.nih.gov/33143175/
