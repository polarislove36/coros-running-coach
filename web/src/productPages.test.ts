import { describe, expect, it } from "vitest";
import { multisportWeek } from "./domain/productData";
import {
  renderAccountPage,
  renderChangesPage,
  renderCheckInPage,
  renderExportsPage,
  renderInitialPlanPage,
  renderPricingPage,
  renderWorkoutPage
} from "./productPages";

describe("remaining product pages", () => {
  it("renders every required product destination", () => {
    expect(renderPricingPage()).toContain("价格与服务");
    expect(renderInitialPlanPage(multisportWeek)).toContain("计划已生成");
    expect(renderWorkoutPage(multisportWeek[5])).toContain("今天只需要完成这一件事");
    expect(renderCheckInPage()).toContain("身体状态与训练反馈");
    expect(renderChangesPage()).toContain("计划变更记录");
    expect(renderExportsPage()).toContain("导出与日历");
    expect(renderAccountPage()).toContain("账号与订阅");
  });

  it("keeps the first release free of coach chat", () => {
    const pages = [
      renderPricingPage(),
      renderInitialPlanPage(multisportWeek),
      renderWorkoutPage(multisportWeek[5]),
      renderCheckInPage(),
      renderChangesPage(),
      renderExportsPage(),
      renderAccountPage()
    ];

    expect(pages.join("\n")).not.toContain("教练追问");
  });

  it("uses trail running instead of swimming in the workspace data", () => {
    expect(multisportWeek.some((day) => day.sport === "trail")).toBe(true);
    expect(multisportWeek.map((day) => day.title).join(" ")).not.toContain("游泳");
  });
});
