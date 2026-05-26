export type WorkoutIntensity = "rest" | "easy" | "quality" | "long";

export type ReadinessLevel = "ready" | "caution" | "stop";

export interface LatestWorkout {
  date: string;
  name: string;
  distanceKm: number;
  avgPace: string;
  avgHr: number;
  intensity: WorkoutIntensity;
}

export interface CorosDailySnapshot {
  date: string;
  recoveryScore: number;
  hrvMs: number;
  hrvBaselineMs: number;
  restingHr: number;
  restingHrBaseline: number;
  sleepScore: number;
  sleepHours: number;
  trainingLoadRatio: number;
  latestWorkout: LatestWorkout;
}

export interface ReadinessResult {
  level: ReadinessLevel;
  decision: "按计划执行" | "降低强度" | "改为休息";
  summary: string;
  riskFlags: string[];
  nextThreeDayPolicy: string;
}

export interface TrainingDay {
  date: string;
  weekday: string;
  title: string;
  session: string;
  pace: string;
  heartRate: string;
  purpose: string;
}
