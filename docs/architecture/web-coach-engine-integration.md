# Web and Coach Engine Integration

日期：2026-05-27

## 目标

把 `apps/web` 的用户流程和 `services/coach-engine` 的训练决策能力连接起来。短期不重写训练逻辑，前端只消费训练引擎输出的结构化 JSON。

## 当前仓库结构

```text
coros-running-coach/
  web/                    # Vite 前端原型
  services/coach-engine/  # Python 多运动训练引擎
  docs/
  references/
```

## 第一阶段接口

前端最先需要一个生成计划接口：

```http
POST /api/plans/generate
```

请求体：

```json
{
  "weekStartDate": "2026-06-01",
  "profile": {
    "targetRace": "半马",
    "raceDate": "2026-09-20",
    "currentPb": "1:48:30",
    "goalTime": "1:42:00",
    "weeklyTrainingDays": 5,
    "preferredLongRunDay": "周日",
    "trainingStyle": "standard",
    "wantsStrength": true,
    "acceptsCrossTraining": true,
    "recentIssue": "无"
  },
  "coros": {
    "connectionStatus": "authorized",
    "payloadBundleId": "latest"
  }
}
```

响应体使用 `services/coach-engine` 的 `TrainingPlan` JSON 结构：

```json
{
  "title": "Multi-sport weekly plan - week 1",
  "sessions": [
    {
      "day": "Tuesday",
      "sport": "running",
      "title": "控制节奏跑",
      "duration_minutes": 55,
      "intensity": "upper Z2 to low Z3",
      "purpose": "Keep race-specific rhythm while respecting fatigue.",
      "nutrition": "Eat carbohydrate 3 hours before the session.",
      "downgrade": "If HRV or sleep is poor, change to 40 minutes easy.",
      "target_zone": "HR Z2-Z3",
      "phases": ["15 min easy warm-up"],
      "workout_stages": [
        {
          "name": "热身跑",
          "duration_minutes": 15,
          "heart_rate_zone": "Z1-Z2 111-148 bpm",
          "power_zone": null,
          "pace_zone": null,
          "cadence": null,
          "incline": null,
          "instructions": []
        }
      ]
    }
  ],
  "notes": []
}
```

前端适配入口：

```text
web/src/domain/coachEngine.ts
```

它把训练引擎 JSON 转成当前页面表格使用的 `TrainingDay[]`。

## 第二阶段接口

每日复盘接口：

```http
POST /api/reviews/daily
```

职责：

- 读取最新 COROS 数据。
- 找到最近一次已完成训练。
- 与计划训练对比。
- 输出昨日训练评价、今日身体状态、未来 3 天调整建议。

日历接口：

```http
GET /api/calendar.ics?token=<private-token>
```

职责：

- 返回用户最新计划的 ICS。
- 使用稳定 UID，避免日历重复创建事件。
- token 不能包含用户明文身份。

## 不做

- 前端不直接调用 COROS MCP。
- 前端不自己实现训练计划算法。
- 训练引擎不负责登录、支付和网页状态。
- V1 不开放多运动 UI，只把多运动能力保留在引擎层。

