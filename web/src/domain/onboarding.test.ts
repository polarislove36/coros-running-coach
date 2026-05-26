import { describe, expect, it } from "vitest";
import { getOnboardingSteps, validateIntakeDraft } from "./onboarding";
import type { IntakeDraft } from "./types";

describe("onboarding flow", () => {
  it("orders the pre-dashboard pages from marketing to intake", () => {
    expect(getOnboardingSteps().map((step) => step.id)).toEqual(["landing", "login", "coros-auth", "intake"]);
  });

  it("requires target race, race date, weekly training days, and long-run day", () => {
    const draft: IntakeDraft = {
      targetRace: "",
      raceDate: "",
      currentPb: "",
      goalTime: "",
      weeklyTrainingDays: 0,
      preferredLongRunDay: "",
      trainingStyle: "standard",
      wantsStrength: true,
      acceptsCrossTraining: true,
      recentIssue: ""
    };

    expect(validateIntakeDraft(draft)).toEqual([
      "请选择目标类型",
      "请填写目标赛事日期",
      "每周可训练天数至少为 3 天",
      "请选择长距离跑通常安排在周六还是周日"
    ]);
  });

  it("accepts a complete first-plan intake draft", () => {
    const draft: IntakeDraft = {
      targetRace: "半马",
      raceDate: "2026-09-20",
      currentPb: "1:48:30",
      goalTime: "1:42:00",
      weeklyTrainingDays: 5,
      preferredLongRunDay: "周日",
      trainingStyle: "standard",
      wantsStrength: true,
      acceptsCrossTraining: true,
      recentIssue: "无"
    };

    expect(validateIntakeDraft(draft)).toEqual([]);
  });
});
