import { describe, expect, it } from "vitest";
import { evaluateReadiness } from "./readiness";
import type { CorosDailySnapshot } from "./types";

const baseSnapshot: CorosDailySnapshot = {
  date: "2026-05-27",
  recoveryScore: 88,
  hrvMs: 52,
  hrvBaselineMs: 50,
  restingHr: 58,
  restingHrBaseline: 59,
  sleepScore: 82,
  sleepHours: 7.2,
  trainingLoadRatio: 0.96,
  latestWorkout: {
    date: "2026-05-26",
    name: "轻松跑",
    distanceKm: 7.2,
    avgPace: "6'18/km",
    avgHr: 136,
    intensity: "easy"
  }
};

describe("evaluateReadiness", () => {
  it("keeps the planned workout when recovery indicators are normal", () => {
    const result = evaluateReadiness(baseSnapshot);

    expect(result.level).toBe("ready");
    expect(result.decision).toBe("按计划执行");
    expect(result.riskFlags).toEqual([]);
  });

  it("downgrades the next intensity session when HRV drops and resting heart rate rises", () => {
    const result = evaluateReadiness({
      ...baseSnapshot,
      hrvMs: 39,
      restingHr: 66,
      sleepScore: 61,
      latestWorkout: {
        ...baseSnapshot.latestWorkout,
        name: "节奏跑",
        intensity: "quality",
        avgHr: 166
      }
    });

    expect(result.level).toBe("caution");
    expect(result.decision).toBe("降低强度");
    expect(result.riskFlags).toContain("HRV 低于个人基线 15% 以上");
    expect(result.nextThreeDayPolicy).toBe("下一次强度课改为轻松跑，保留总时长的 60%-70%");
  });

  it("recommends rest when recovery score and sleep are both poor", () => {
    const result = evaluateReadiness({
      ...baseSnapshot,
      recoveryScore: 42,
      sleepScore: 48,
      sleepHours: 4.8,
      trainingLoadRatio: 1.42
    });

    expect(result.level).toBe("stop");
    expect(result.decision).toBe("改为休息");
    expect(result.nextThreeDayPolicy).toBe("今天休息，未来 48 小时只安排轻松跑或步行");
  });
});
