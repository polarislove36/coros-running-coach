import type { LandingPlanSession } from "./landingPlans";

export interface LegacyLandingPlan {
  id: "a" | "b" | "c";
  label: string;
  title: string;
  profile: string;
  goal: string;
  phase: string;
  load: string;
  insight: string;
  sessions: LandingPlanSession[];
}

export const landingPlans2151: LegacyLandingPlan[] = [
  {
    id: "a",
    label: "A · 单项跑步",
    title: "半程马拉松 30 天起步计划",
    profile: "33 岁 · 半马 2:05 · 每周可训练 5 次",
    goal: "10 月半马，向 1:58–2:02 靠近",
    phase: "基础巩固",
    load: "32 → 38 → 30 km",
    insight: "先稳定有氧容量，再逐步加入节奏与阈值；第四周主动回撤。",
    sessions: [
      { day: 2, sport: "run", title: "轻松跑 45′", detail: "Ae(2)" },
      { day: 3, sport: "strength", title: "跑者力量 30′", detail: "臀腿 + 核心" },
      { day: 4, sport: "run", title: "节奏跑", detail: "3×6′ / 慢跑3′" },
      { day: 6, sport: "run", title: "轻松跑 45′", detail: "+ 6×20秒加速" },
      { day: 7, sport: "run", title: "长跑 13 km", detail: "Ae(2)" },
      { day: 9, sport: "run", title: "轻松跑 50′", detail: "Ae(2)" },
      { day: 10, sport: "strength", title: "跑者力量 30′", detail: "臀腿 + 核心" },
      { day: 11, sport: "run", title: "节奏跑", detail: "2×10′ / 慢跑4′" },
      { day: 13, sport: "run", title: "恢复跑 35′", detail: "Rec(1)" },
      { day: 14, sport: "run", title: "长跑 15 km", detail: "Ae(2)" },
      { day: 16, sport: "run", title: "轻松跑 45′", detail: "Ae(2)" },
      { day: 17, sport: "strength", title: "跑者力量 25′", detail: "单腿稳定" },
      { day: 18, sport: "run", title: "阈值入门", detail: "4×4′ / 慢跑3′" },
      { day: 20, sport: "run", title: "轻松跑 55′", detail: "Ae(2)" },
      { day: 21, sport: "run", title: "长跑 16 km", detail: "末3 km稳态" },
      { day: 23, sport: "run", title: "恢复跑 35′", detail: "Rec(1)" },
      { day: 25, sport: "run", title: "短节奏", detail: "2×6′ / 慢跑4′" },
      { day: 27, sport: "run", title: "轻松跑 40′", detail: "Ae(2)" },
      { day: 28, sport: "run", title: "长跑 12 km", detail: "恢复周" },
      { day: 30, sport: "run", title: "轻松跑 50′", detail: "进入建设期" }
    ]
  },
  {
    id: "b",
    label: "B · 跑骑混合",
    title: "全马 + 公路车双目标计划",
    profile: "35 岁 · 当前约 3 小时/周 · 每周 4–5 次",
    goal: "12 月全马 A 赛 + 11 月 120 km 公路车 B 赛",
    phase: "重建连续性",
    load: "3.5 → 4.5 小时/周",
    insight: "跑步决定主周期，骑行补充低冲击有氧；不让 B 级骑行赛事破坏全马建设。",
    sessions: [
      { day: 2, sport: "run", title: "轻松跑 35′", detail: "Ae(2)" },
      { day: 4, sport: "run", title: "轻松跑 40′", detail: "Ae(2)" },
      { day: 6, sport: "bike", title: "耐力骑 75′", detail: "Z2 / Ae(2)" },
      { day: 7, sport: "run", title: "长跑 9 km", detail: "轻松完成" },
      { day: 9, sport: "run", title: "轻松跑 40′", detail: "Ae(2)" },
      { day: 11, sport: "run", title: "节奏入门", detail: "3×5′ / 慢跑3′" },
      { day: 13, sport: "bike", title: "耐力骑 90′", detail: "Z2" },
      { day: 14, sport: "run", title: "长跑 11 km", detail: "Ae(2)" },
      { day: 16, sport: "run", title: "恢复跑 30′", detail: "Rec(1)" },
      { day: 17, sport: "strength", title: "跑骑力量 25′", detail: "小腿 + 臀腿" },
      { day: 18, sport: "run", title: "轻松跑 50′", detail: "+ 6×20秒加速" },
      { day: 20, sport: "bike", title: "耐力骑 100′", detail: "稳定踏频" },
      { day: 21, sport: "run", title: "长跑 13 km", detail: "控制强度" },
      { day: 23, sport: "run", title: "轻松跑 35′", detail: "Ae(2)" },
      { day: 25, sport: "run", title: "短节奏", detail: "2×6′ / 慢跑4′" },
      { day: 27, sport: "bike", title: "耐力骑 75′", detail: "回撤周" },
      { day: 28, sport: "run", title: "长跑 10 km", detail: "轻松完成" },
      { day: 30, sport: "run", title: "轻松跑 45′", detail: "进入基础建设" }
    ]
  },
  {
    id: "c",
    label: "C · 越野混合",
    title: "50K 越野 + 全马转换计划",
    profile: "44 岁 · 全马 2:59 · 当前约 10 小时/周",
    goal: "10 月 50K 越野后，7 周转换至 12 月全马",
    phase: "越野基础专项",
    load: "9 → 11 → 8 小时/周",
    insight: "先发展爬升、下坡与补给耐受，再转换回公路效率；骑行承担低冲击有氧。",
    sessions: [
      { day: 2, sport: "run", title: "有氧跑 60′", detail: "Ae(2)" },
      { day: 3, sport: "strength", title: "越野力量 30′", detail: "下坡离心 + 核心" },
      { day: 4, sport: "trail", title: "坡跑", detail: "8×2′ / 慢跑下坡" },
      { day: 6, sport: "bike", title: "耐力骑 2h", detail: "Ae(2)" },
      { day: 7, sport: "trail", title: "越野长跑 2h30", detail: "爬升 800 m" },
      { day: 9, sport: "run", title: "恢复跑 40′", detail: "Rec(1)" },
      { day: 10, sport: "strength", title: "越野力量 35′", detail: "下坡耐受" },
      { day: 11, sport: "run", title: "公路稳态", detail: "3×12′ Te(3)" },
      { day: 13, sport: "trail", title: "山地跑 3h", detail: "爬升 1000 m" },
      { day: 14, sport: "bike", title: "耐力骑 2h", detail: "低冲击有氧" },
      { day: 16, sport: "run", title: "有氧跑 70′", detail: "Ae(2)" },
      { day: 17, sport: "bike", title: "恢复骑 45′", detail: "Z1–Z2" },
      { day: 18, sport: "trail", title: "短坡跑", detail: "10×90秒" },
      { day: 20, sport: "trail", title: "越野长跑 3h15", detail: "补给练习" },
      { day: 21, sport: "run", title: "有氧跑 75′", detail: "背靠背" },
      { day: 23, sport: "run", title: "恢复跑 40′", detail: "Rec(1)" },
      { day: 25, sport: "run", title: "有氧跑 60′", detail: "+ 6×20秒加速" },
      { day: 27, sport: "bike", title: "耐力骑 2h", detail: "回撤周" },
      { day: 28, sport: "trail", title: "轻松越野 2h", detail: "技术路面" },
      { day: 30, sport: "run", title: "有氧跑 70′", detail: "进入建设期" }
    ]
  }
];

export function getLandingPlanDate2151(day: number): string {
  const date = new Date(Date.UTC(2026, 6, 12 + day));
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}
