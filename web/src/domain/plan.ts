import type { TrainingDay } from "./types";

export const samplePlan: TrainingDay[] = [
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
  },
  {
    date: "2026-06-03",
    weekday: "周三",
    title: "核心力量",
    session: "核心力量 28分钟：死虫 3组x10次/侧，侧桥 3组x35秒/侧，鸟狗 3组x10次/侧，臀桥 3组x12次",
    pace: "-",
    heartRate: "Z1-Z2，避免憋气",
    purpose: "提升躯干稳定性，降低跑姿后程塌陷"
  },
  {
    date: "2026-06-04",
    weekday: "周四",
    title: "有氧跑",
    session: "有氧跑 8km",
    pace: "6'10-6'40/km",
    heartRate: "Z2 132-148 bpm",
    purpose: "积累低强度有氧容量"
  },
  {
    date: "2026-06-05",
    weekday: "周五",
    title: "休息",
    session: "休息或 20 分钟舒缓步行",
    pace: "-",
    heartRate: "Z1",
    purpose: "恢复"
  },
  {
    date: "2026-06-06",
    weekday: "周六",
    title: "长距离跑",
    session: "长距离跑 14km，最后 2km 可自然加速但不进入比赛强度",
    pace: "6'25-6'55/km",
    heartRate: "Z2 132-148 bpm，最后 2km 不超过 Z3",
    purpose: "建设基础耐力和脂代谢能力"
  },
  {
    date: "2026-06-07",
    weekday: "周日",
    title: "恢复跑",
    session: "恢复跑 5km + 下肢力量 22分钟：杯式深蹲 3组x8次，台阶上步 3组x8次/侧，提踵 3组x12次",
    pace: "6'45-7'20/km",
    heartRate: "Z1-Z2 120-145 bpm",
    purpose: "促进恢复，补足跑步专项力量"
  }
];

export function getNextThreeDays(days: TrainingDay[], today: string): TrainingDay[] {
  return days.filter((day) => day.date >= today).slice(0, 3);
}
