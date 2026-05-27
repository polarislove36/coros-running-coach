import { describe, expect, it } from "vitest";
import { enginePlanToTrainingDays, getEnginePlanContractSummary } from "./coachEngine";
import type { CoachEnginePlan } from "./coachEngine";

const enginePlan: CoachEnginePlan = {
  title: "Multi-sport weekly plan - week 1",
  sessions: [
    {
      day: "Tuesday",
      sport: "running",
      title: "控制节奏跑",
      duration_minutes: 55,
      intensity: "upper Z2 to low Z3",
      purpose: "Keep race-specific rhythm while respecting fatigue.",
      nutrition: "Eat carbohydrate 3 hours before the session.",
      downgrade: "If HRV or sleep is poor, change to 40 minutes easy.",
      target_zone: "HR Z2-Z3",
      phases: ["15 min easy warm-up", "2 x 10 min controlled tempo", "10 min easy cool-down"],
      workout_stages: [
        {
          name: "热身跑",
          duration_minutes: 15,
          heart_rate_zone: "Z1-Z2 111-148 bpm",
          instructions: []
        },
        {
          name: "节奏跑主课",
          duration_minutes: 24,
          heart_rate_zone: "Z3 149-166 bpm / Z1 111-130 bpm",
          instructions: ["2*(10min Z3节奏跑 + 4min Z1慢跑恢复)"]
        },
        {
          name: "放松跑",
          duration_minutes: 10,
          heart_rate_zone: "Z1 111-130 bpm",
          instructions: []
        }
      ]
    },
    {
      day: "Saturday",
      sport: "recovery",
      title: "Protected rest day",
      duration_minutes: 0,
      intensity: "rest",
      purpose: "Respect fixed rest day.",
      workout_stages: [
        {
          name: "Rest",
          duration_minutes: 0,
          instructions: ["No structured training."]
        }
      ]
    }
  ],
  notes: ["Fatigue budget: maintain or increase up to 5-10%."]
};

describe("coach engine adapter", () => {
  it("maps engine sessions into web training days with dates and Chinese weekdays", () => {
    const days = enginePlanToTrainingDays(enginePlan, "2026-06-01");

    expect(days[0]).toMatchObject({
      date: "2026-06-02",
      weekday: "周二",
      title: "控制节奏跑"
    });
    expect(days[1]).toMatchObject({
      date: "2026-06-06",
      weekday: "周六",
      title: "Protected rest day"
    });
  });

  it("keeps structured stage prescriptions in the session text", () => {
    const [day] = enginePlanToTrainingDays(enginePlan, "2026-06-01");

    expect(day.session).toContain("控制节奏跑 55分钟");
    expect(day.session).toContain("热身跑15分钟");
    expect(day.session).toContain("2*(10min Z3节奏跑 + 4min Z1慢跑恢复)");
    expect(day.heartRate).toContain("Z3 149-166 bpm");
    expect(day.purpose).toContain("Keep race-specific rhythm");
  });

  it("summarizes the contract fields the web app expects", () => {
    expect(getEnginePlanContractSummary()).toEqual([
      "title",
      "sessions[].day",
      "sessions[].sport",
      "sessions[].title",
      "sessions[].duration_minutes",
      "sessions[].purpose",
      "sessions[].workout_stages[]"
    ]);
  });
});
