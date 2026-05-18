# COROS Running Coach

`coros-running-coach` is a Codex skill for adaptive road-running coaching. It reads COROS data when available, reviews recent training, and generates practical 5K, 10K, half-marathon, marathon, taper, recovery, strength, and cross-training plans.

The skill is designed for Chinese-language coaching output by default, with concrete dates, paces, heart-rate guidance, weekly mileage, strength exercises, and adjustment rules.

## What It Does

- Guides users through COROS MCP setup and authorization.
- Reads COROS recovery, HRV, sleep, resting heart rate, training load, activity records, and training schedule when tools are available.
- Reviews the latest workout and gives a coach decision: keep plan, reduce volume, remove intensity, cross-train, or rest.
- Produces multi-week plans with periodization: aerobic base, intensity development, race-specific consolidation, and taper.
- Uses pace anchors, historical workout heart rate, and COROS zones when available.
- Includes detailed runner strength sessions with exercises, sets, reps, and intensity.
- Suggests a daily recurring coaching task after COROS authorization, but only creates one after explicit user confirmation.

## Install

Clone this repository into your Codex skills folder:

```powershell
git clone https://github.com/<your-user>/coros-running-coach.git "$env:USERPROFILE\.codex\skills\coros-running-coach"
```

Or on macOS/Linux:

```bash
git clone https://github.com/<your-user>/coros-running-coach.git ~/.codex/skills/coros-running-coach
```

Restart Codex after installing.

## COROS MCP Setup

For mainland China, add this to `~/.codex/config.toml`:

```toml
[mcp_servers.coros]
url = "https://mcpcn.coros.com/mcp"
enabled = true
```

Then restart Codex and authorize COROS:

```powershell
codex mcp login coros
```

Complete login in the browser, restart Codex again, and confirm the connection by asking the skill to read COROS recovery or devices.

The current COROS MCP integration is read-only: the skill can read data and generate plans, but it cannot write workouts back to COROS.

## Usage Examples

```text
使用 $coros-running-coach，根据我的高驰数据生成未来 4 周半马训练计划。
```

```text
使用 $coros-running-coach，复盘我上一次训练，并给我未来三天调整建议。
```

```text
使用 $coros-running-coach，我没有高驰数据，请通过问卷帮我生成 8 周 10K 计划。
```

```text
使用 $coros-running-coach，为我设置每天早上 7 点读取高驰数据并调整未来三天训练。
```

## Output Style

Plans normally include:

- Data snapshot and missing data.
- Coaching judgment.
- Week heading such as `第 1 周｜有氧能力建设基础期｜周跑量 36km`.
- Daily table with date, weekday, training item, reference pace/heart rate, and purpose.
- Strength training with exact exercises, sets, reps, and intensity.
- Downgrade and stop rules.
- COROS write-back limitation at the end.

## Skill Structure

```text
coros-running-coach/
├─ SKILL.md
├─ agents/
│  └─ openai.yaml
└─ references/
   ├─ coros-data-workflow.md
   ├─ coros-mcp-setup.md
   ├─ intake-questions.md
   ├─ pace-zones-and-workout-library.md
   ├─ strength-training-for-runners.md
   ├─ training-book-principles.md
   └─ training-principles.md
```

## Notes

This is coaching guidance, not medical diagnosis. Stop training and seek professional advice for chest pain, fainting, acute injury, fever, worsening pain, or symptoms that feel unsafe.

This project is not affiliated with COROS.
