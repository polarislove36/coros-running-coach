import type { CorosDailySnapshot } from "./types";

export const mockCorosSnapshot: CorosDailySnapshot = {
  date: "2026-07-10",
  recoveryScore: 82,
  hrvMs: 56,
  hrvBaselineMs: 52,
  restingHr: 49,
  restingHrBaseline: 50,
  sleepScore: 74,
  sleepHours: 6.3,
  trainingLoadRatio: 1.12,
  latestWorkout: {
    date: "2026-07-09",
    name: "节奏跑",
    distanceKm: 9.6,
    avgPace: "5'46/km",
    avgHr: 151,
    intensity: "quality"
  }
};
