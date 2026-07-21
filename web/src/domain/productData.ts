import type { DeviceConnection, RaceGoal, ReviewRecord, TrainingDay } from "./types";

export const multisportWeek: TrainingDay[] = [
  {
    date: "2026-07-06",
    weekday: "周一",
    title: "休息",
    session: "休息",
    pace: "-",
    heartRate: "-",
    purpose: "恢复",
    sport: "rest",
    durationMinutes: 0,
    status: "completed"
  },
  {
    date: "2026-07-07",
    weekday: "周二",
    title: "Z2 有氧骑",
    session: "热身 10 分钟 + Z2 骑行 55 分钟 + 放松 5 分钟",
    pace: "踏频 85-95 rpm；功率 130-155 W",
    heartRate: "Z2 118-132 bpm",
    purpose: "建立低压力有氧容量",
    sport: "bike",
    durationMinutes: 70,
    status: "completed"
  },
  {
    date: "2026-07-07",
    weekday: "周二",
    title: "轻松跑",
    session: "轻松跑 35 分钟，结束后 4 组 x 15 秒短时间冲刺跑，组间走/慢跑 75 秒",
    pace: "轻松跑 6'15-6'45/km；冲刺跑 4'45-5'05/km",
    heartRate: "轻松跑 Z2 132-148 bpm；冲刺段不看心率",
    purpose: "保持跑步经济性和动作节奏",
    sport: "run",
    durationMinutes: 42,
    status: "completed"
  },
  {
    date: "2026-07-08",
    weekday: "周三",
    title: "越野技术跑",
    session: "轻松热身 15 分钟 + 缓坡上下坡技术练习 6 组 x 3 分钟，组间慢跑 2 分钟 + 放松 10 分钟",
    pace: "不追求配速，保持 RPE 4-5；下坡以动作稳定为先",
    heartRate: "Z1-Z2 132-148 bpm",
    purpose: "练习爬坡节奏和下坡动作，同时补充低压力有氧",
    sport: "trail",
    durationMinutes: 55,
    status: "completed"
  },
  {
    date: "2026-07-09",
    weekday: "周四",
    title: "节奏跑",
    session: "热身跑 15 分钟 + 3 组 x 8 分钟节奏跑，组间慢跑 3 分钟 + 放松跑 12 分钟",
    pace: "热身/放松 6'25-6'55/km；节奏段 5'05-5'20/km",
    heartRate: "热身/放松 Z1-Z2；节奏段 Z3-Z4 149-165 bpm",
    purpose: "提升乳酸阈值和持续配速能力",
    sport: "run",
    durationMinutes: 60,
    status: "completed"
  },
  {
    date: "2026-07-10",
    weekday: "周五",
    title: "Z2 恢复骑",
    session: "室内或户外平路骑行 70 分钟，全程保持稳定输出",
    pace: "踏频 85-95 rpm；功率 130-155 W",
    heartRate: "Z2 118-132 bpm",
    purpose: "保留低压力有氧，避免叠加跑步冲击",
    sport: "bike",
    durationMinutes: 70,
    status: "adjusted"
  },
  {
    date: "2026-07-11",
    weekday: "周六",
    title: "长距离骑行",
    session: "Z2 长骑 2 小时 30 分钟，每小时补充 60-75g 碳水和 500-750ml 液体",
    pace: "功率 Z2，爬坡不持续超过 Z3",
    heartRate: "Z2 为主，短坡可进入 Z3",
    purpose: "发展长距离耐力并练习比赛补给",
    sport: "bike",
    durationMinutes: 150,
    status: "planned"
  },
  {
    date: "2026-07-12",
    weekday: "周日",
    title: "轻松长跑",
    session: "轻松长跑 80 分钟，前 60 分钟保持稳定，最后 20 分钟不主动加速",
    pace: "6'20-6'50/km",
    heartRate: "Z2 132-148 bpm",
    purpose: "积累跑步耐力，控制周末双长课总压力",
    sport: "run",
    durationMinutes: 80,
    status: "planned"
  }
];

export const raceGoals: RaceGoal[] = [
  {
    id: "event-a",
    name: "上海铁人三项赛",
    date: "2026-11-08",
    discipline: "奥运距离铁三",
    priority: "A",
    goal: "稳定完赛，跑步段保持节奏",
    status: "active"
  },
  {
    id: "event-b",
    name: "环太湖公路自行车赛",
    date: "2026-09-20",
    discipline: "公路骑行 120km",
    priority: "B",
    goal: "作为长距离能力检验",
    status: "support"
  },
  {
    id: "event-c",
    name: "苏州半程马拉松",
    date: "2026-10-18",
    discipline: "半程马拉松",
    priority: "C",
    goal: "以训练赛完成，不追求 PB",
    status: "support"
  }
];

export const deviceConnections: DeviceConnection[] = [
  {
    id: "coros",
    name: "COROS",
    status: "connected",
    lastSync: "今天 07:06",
    dataScopes: ["训练记录", "恢复", "HRV", "睡眠", "静息心率", "训练负荷"]
  },
  {
    id: "garmin",
    name: "Garmin",
    status: "planned",
    dataScopes: ["训练记录", "健康数据", "训练负荷"]
  },
  {
    id: "apple",
    name: "Apple Health",
    status: "planned",
    dataScopes: ["训练记录", "心率", "睡眠"]
  }
];

export const reviewHistory: ReviewRecord[] = [
  {
    date: "7月9日",
    sport: "run",
    title: "节奏跑",
    summary: "3 组节奏段全部完成，后两组心率稳定，没有出现明显掉速。",
    score: 88,
    load: 82,
    duration: "59分钟",
    decision: "完成良好，下一次跑步强度按计划保留"
  },
  {
    date: "7月8日",
    sport: "trail",
    title: "越野技术跑",
    summary: "爬坡节奏稳定，下坡后半段落脚略重，动作稳定性仍可改善。",
    score: 79,
    load: 38,
    duration: "54分钟",
    decision: "维持技术优先，不增加爬坡强度"
  },
  {
    date: "7月7日",
    sport: "bike",
    title: "Z2 有氧骑",
    summary: "功率输出稳定，心率漂移较小，补给和踏频符合计划。",
    score: 92,
    load: 66,
    duration: "1小时10分",
    decision: "长骑可以按计划执行"
  },
  {
    date: "7月7日",
    sport: "run",
    title: "轻松跑",
    summary: "轻松段配速合理，短时间冲刺跑动作放松，没有额外疲劳信号。",
    score: 86,
    load: 41,
    duration: "42分钟",
    decision: "保持当前跑量，不追加训练"
  }
];

export const bodyTrend = [
  { day: "7/4", recovery: 72, load: 56 },
  { day: "7/5", recovery: 76, load: 40 },
  { day: "7/6", recovery: 84, load: 18 },
  { day: "7/7", recovery: 79, load: 78 },
  { day: "7/8", recovery: 75, load: 42 },
  { day: "7/9", recovery: 68, load: 82 },
  { day: "7/10", recovery: 82, load: 34 }
];
