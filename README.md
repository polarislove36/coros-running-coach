# COROS Running Coach / 高驰跑步教练

`coros-running-coach` is a Codex skill for adaptive road-running coaching with optional COROS data integration.

`coros-running-coach` 是一个 Codex skill，用于基于高驰 COROS 数据生成跑步训练计划、复盘训练，并给出未来训练调整建议。

## 中文说明

### 功能

这个 skill 主要面向高驰 COROS 手表用户。授权 COROS MCP 后，它可以读取手表里的训练、恢复、HRV、睡眠、静息心率、训练负荷和运动记录等数据，并结合你的目标赛事、当前 PB、目标完赛时间、可训练时间和伤病情况，生成可执行的跑步训练计划。

它也支持每日复盘：读取你上一次运动记录和当天恢复状态，评价训练完成情况，并根据恢复、HRV、睡眠、静息心率和训练负荷，实时调整未来几天的训练安排。

具体能力包括：

- 根据高驰数据和目标赛事生成 5K、10K、半马、全马训练计划。
- 根据当前 PB 和目标完赛时间，给出参考配速、参考心率和阶段安排。
- 复盘上一次运动，判断训练是否符合计划目的。
- 每日读取恢复数据，判断是否保持计划、减少跑量、取消强度、改交叉训练或休息。

### 安装

把这个仓库克隆到 Codex skills 目录：

```powershell
git clone https://github.com/polarislove36/coros-running-coach.git "$env:USERPROFILE\.codex\skills\coros-running-coach"
```

macOS / Linux：

```bash
git clone https://github.com/polarislove36/coros-running-coach.git ~/.codex/skills/coros-running-coach
```

安装后重启 Codex。

### COROS MCP 配置

中国大陆用户可以在 `~/.codex/config.toml` 中加入：

```toml
[mcp_servers.coros]
url = "https://mcpcn.coros.com/mcp"
enabled = true
```

然后重启 Codex，并在普通终端中运行：

```powershell
codex mcp login coros
```

在浏览器中完成 COROS 登录和授权后，再次重启 Codex。之后可以让 skill 读取设备或恢复状态，确认授权成功。

当前 COROS MCP 是只读能力：可以读取数据、复盘训练、生成计划，但不能把训练写回 COROS 手表或训练日历。

### 使用示例

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

### 输出格式

训练计划通常包含：

- 数据快照和缺失数据说明。
- 教练判断。
- 每周标题：阶段 + 周跑量。
- 每日训练表：日期、周几、训练项目、参考配速/心率、目的。
- 详细力量训练：动作、组数、次数、强度。
- 降级、停止或休息规则。
- 最后说明当前不能写回 COROS。

### 免责声明

本 skill 提供训练建议，不提供医疗诊断。若出现胸痛、晕厥、急性损伤、发热、疼痛加重或其他不安全症状，请停止训练并咨询专业人士。

本项目与 COROS 官方无隶属关系。

## English

### What It Does

This skill is built for COROS watch users. After COROS MCP authorization, it can read watch data such as training history, recovery, HRV, sleep, resting heart rate, training load, and recent activity records. It combines that data with the user's target race, current PB, target finish time, training availability, and injury status to generate practical running plans.

It also supports daily review: it reads the latest workout and current recovery state, evaluates whether the workout matched its purpose, and adjusts the next few days based on recovery, HRV, sleep, resting heart rate, and training load.

Core capabilities:

- Generate 5K, 10K, half-marathon, and marathon plans from COROS data and race goals.
- Use current PB and target finish time to provide reference paces, heart-rate guidance, and training phases.
- Review the latest workout and judge whether it matched the planned purpose.
- Make daily coaching decisions: keep the plan, reduce volume, remove intensity, cross-train, or rest.
- Output concrete dates, weekdays, sessions, reference pace, reference heart-rate guidance, and purpose.
- Place weekly mileage in the week heading, such as `Week 1 | Aerobic Base | 36 km`.
- Include detailed runner strength work with exercises, sets, reps, and intensity.

### Install

Clone the repository into your Codex skills folder:

```powershell
git clone https://github.com/polarislove36/coros-running-coach.git "$env:USERPROFILE\.codex\skills\coros-running-coach"
```

On macOS / Linux:

```bash
git clone https://github.com/polarislove36/coros-running-coach.git ~/.codex/skills/coros-running-coach
```

Restart Codex after installing.

### COROS MCP Setup

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

Complete authorization in the browser, restart Codex again, and confirm the connection by asking the skill to read COROS devices or recovery status.

The current COROS MCP integration is read-only: the skill can read data and generate plans, but it cannot write workouts back to COROS.

### Usage Examples

```text
Use $coros-running-coach to create a 4-week half-marathon plan from my COROS data.
```

```text
Use $coros-running-coach to review my latest workout and adjust the next three days.
```

```text
Use $coros-running-coach without COROS data and create an 8-week 10K plan through intake questions.
```

```text
Use $coros-running-coach to set a daily 7 AM COROS review and adjust the next three days.
```

### Output Style

Plans usually include:

- Data snapshot and missing-data notes.
- Coach decision.
- Weekly heading with phase and mileage.
- Daily table with date, weekday, session, reference pace/heart rate, and purpose.
- Detailed strength training with exercises, sets, reps, and intensity.
- Downgrade, stop, and rest rules.
- Final note about the current COROS read-only limitation.

### Disclaimer

This skill provides coaching guidance, not medical diagnosis. Stop training and seek professional advice for chest pain, fainting, acute injury, fever, worsening pain, or symptoms that feel unsafe.

This project is not affiliated with COROS.

## Repository Structure

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
