import { describe, expect, it } from "vitest";
import { getLandingCycleDate, landingPlans } from "./landingPlans";

describe("landing plan examples", () => {
  it("contains each complete training cycle from the source plans", () => {
    expect(landingPlans.map((plan) => plan.weeks.length)).toEqual([14, 21, 21]);
    expect(landingPlans.map((plan) => plan.title)).not.toContain(expect.stringContaining("30 天"));
  });

  it("keeps each week as a seven-day calendar with structured sessions", () => {
    for (const plan of landingPlans) {
      for (const week of plan.weeks) {
        expect(week.sessions.every((session) => session.weekday >= 1 && session.weekday <= 7)).toBe(true);
        expect(week.sessions.every((session) => session.segments.length > 0)).toBe(true);
      }
    }
  });

  it("calculates dates across the full cycle", () => {
    expect(getLandingCycleDate(landingPlans[0], 0, 1)).toBe("07/13");
    expect(getLandingCycleDate(landingPlans[0], 13, 7)).toBe("10/18");
    expect(getLandingCycleDate(landingPlans[1], 20, 7)).toBe("12/06");
  });
});
