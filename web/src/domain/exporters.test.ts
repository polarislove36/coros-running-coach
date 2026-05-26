import { describe, expect, it } from "vitest";
import { createTrainingCsv, createTrainingIcs } from "./exporters";
import type { TrainingDay } from "./types";

const plan: TrainingDay[] = [
  {
    date: "2026-06-01",
    weekday: "周一",
    title: "休息",
    session: "休息",
    pace: "-",
    heartRate: "-",
    purpose: "恢复"
  },
  {
    date: "2026-06-02",
    weekday: "周二",
    title: "轻松跑",
    session: "轻松跑 7km + 4组x15秒短时间冲刺跑，组间走/慢跑75秒",
    pace: "轻松跑 6'20-6'50/km；冲刺跑 4'45-5'05/km",
    heartRate: "轻松跑 Z2 132-148 bpm；冲刺段不看心率",
    purpose: "建立有氧基础，保持神经肌肉唤醒"
  }
];

describe("training exporters", () => {
  it("creates csv with Chinese headers and escaped session content", () => {
    const csv = createTrainingCsv(plan);

    expect(csv).toContain("日期,周几,训练项目,参考配速,参考心率,训练目的");
    expect(csv).toContain("2026-06-02,周二");
    expect(csv).toContain("\"轻松跑 7km + 4组x15秒短时间冲刺跑，组间走/慢跑75秒\"");
  });

  it("creates calendar events with stable all-day dates", () => {
    const ics = createTrainingIcs(plan, "跑者的 AI 教练");

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:跑者的 AI 教练 - 轻松跑");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260602");
    expect(ics).toContain("DESCRIPTION:轻松跑 7km + 4组x15秒短时间冲刺跑");
  });
});
