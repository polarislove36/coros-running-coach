import type { CorosDailySnapshot, ReadinessResult } from "./types";

export function evaluateReadiness(snapshot: CorosDailySnapshot): ReadinessResult {
  const riskFlags = collectRiskFlags(snapshot);

  if (snapshot.recoveryScore < 50 && snapshot.sleepScore < 55) {
    return {
      level: "stop",
      decision: "改为休息",
      summary: "恢复分和睡眠质量同时偏低，今天不建议安排跑步训练。",
      riskFlags,
      nextThreeDayPolicy: "今天休息，未来 48 小时只安排轻松跑或步行"
    };
  }

  if (riskFlags.length >= 2 || (riskFlags.length >= 1 && snapshot.latestWorkout.intensity === "quality")) {
    return {
      level: "caution",
      decision: "降低强度",
      summary: "恢复指标出现波动，下一次强度刺激需要下调。",
      riskFlags,
      nextThreeDayPolicy: "下一次强度课改为轻松跑，保留总时长的 60%-70%"
    };
  }

  return {
    level: "ready",
    decision: "按计划执行",
    summary: "恢复、睡眠和训练负荷处于可接受范围，可以按原计划训练。",
    riskFlags,
    nextThreeDayPolicy: "未来 3 天按原计划执行，不额外追加强度"
  };
}

function collectRiskFlags(snapshot: CorosDailySnapshot): string[] {
  const flags: string[] = [];
  const hrvDropRatio = (snapshot.hrvBaselineMs - snapshot.hrvMs) / snapshot.hrvBaselineMs;
  const restingHrRise = snapshot.restingHr - snapshot.restingHrBaseline;

  if (hrvDropRatio >= 0.15) {
    flags.push("HRV 低于个人基线 15% 以上");
  }

  if (restingHrRise >= 6) {
    flags.push("静息心率较基线升高 6 bpm 以上");
  }

  if (snapshot.sleepScore < 65 || snapshot.sleepHours < 6) {
    flags.push("睡眠不足或睡眠质量偏低");
  }

  if (snapshot.trainingLoadRatio >= 1.35) {
    flags.push("短期训练负荷偏高");
  }

  if (snapshot.recoveryScore < 60) {
    flags.push("今日恢复分偏低");
  }

  return flags;
}
