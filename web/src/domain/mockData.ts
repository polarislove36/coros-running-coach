import type { CorosDailySnapshot } from "./types";

export const mockCorosSnapshot: CorosDailySnapshot = {
  date: "2026-05-27",
  recoveryScore: 76,
  hrvMs: 47,
  hrvBaselineMs: 50,
  restingHr: 61,
  restingHrBaseline: 59,
  sleepScore: 69,
  sleepHours: 6.3,
  trainingLoadRatio: 1.08,
  latestWorkout: {
    date: "2026-05-26",
    name: "轻松跑",
    distanceKm: 8.2,
    avgPace: "6'12/km",
    avgHr: 138,
    intensity: "easy"
  }
};
