export type LandingSport = "run" | "bike" | "trail" | "swim" | "strength" | "rest";
export type LandingIntensity = "rest" | "recovery" | "aerobic" | "tempo" | "threshold" | "race" | "strength";

export interface LandingPlanSession {
  day: number;
  sport: LandingSport;
  title: string;
  detail: string;
}

export interface LandingTrainingSegment {
  label: string;
  intensity: LandingIntensity;
  width: number;
}

export interface LandingCycleSession {
  weekday: number;
  sport: LandingSport;
  title: string;
  detail: string;
  intensity: LandingIntensity;
  segments: LandingTrainingSegment[];
}

export interface LandingPlanWeek {
  number: number;
  dateRange: string;
  focus: string;
  sessions: LandingCycleSession[];
}

export interface LandingPlan {
  id: "a" | "b" | "c";
  label: string;
  title: string;
  profile: string;
  goal: string;
  phase: string;
  cycle: string;
  load: string;
  insight: string;
  startDate: string;
  weeks: LandingPlanWeek[];
  sessions: LandingPlanSession[];
}

type WeekRow = readonly [dateRange: string, focus: string, schedule: string];
type PlanSource = Omit<LandingPlan, "weeks" | "sessions"> & { weekRows: readonly WeekRow[] };

const weekdayMap: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7 };

const planSources: readonly PlanSource[] = [
  {
    id: "a",
    label: "A · 单项跑步",
    title: "半程马拉松完整周期",
    profile: "33 岁 · 半马 2:05 · 每周可训练 5 次",
    goal: "10 月半马，向 1:58–2:02 靠近",
    phase: "基础巩固 → 专项 → 减量",
    cycle: "14 周 · 07/13–10/18",
    load: "32–50 km/周",
    insight: "先稳定有氧容量，再逐步加入节奏与阈值；恢复周和减量期都在赛前路线中预先留出。",
    startDate: "2026-07-13",
    weekRows: [
      ["07-13 至 07-19", "重建节奏", "二 Ae(2) 45min；三 恢复骑或椭圆机 Rec(1) 35min；四 W10 + Te(3)3x6min/Rec(1)3min + C5；六 Ae(2) 45min 加 6x20s 短时间冲刺跑，组间走/慢跑 60-90s；日 长跑 13km Ae(2)"],
      ["07-20 至 07-26", "有氧容量", "二 Ae(2) 50min；三 恢复骑 Rec(1) 40min，踏频 85-95rpm；四 W10 + Te(3)2x10min/Rec(1)4min + C5；六 Rec(1) 35min；日 长跑 15km Ae(2)"],
      ["07-27 至 08-02", "稳定训练频率", "二 Ae(2) 45min；三 椭圆机 Ae(2) 35min；四 W10 + Th(4)4x4min/Rec(1)3min + C5；六 Ae(2) 55min；日 长跑 16km，最后 3km 接近半马目标体感"],
      ["08-03 至 08-09", "恢复周", "二 Rec(1) 35min；四 W10 + Te(3)2x6min/Rec(1)4min + C5；六 Ae(2) 40min；日 长跑 12km 轻松"],
      ["08-10 至 08-16", "建设期开始", "二 Ae(2) 50min；三 恢复骑 Rec(1) 40min；四 W10 + Te(3)3x8min/Rec(1)3min + C5；六 Rec(1) 35min；日 长跑 17km"],
      ["08-17 至 08-23", "半马稳态", "二 Ae(2) 45min 加 6x20s 短时间冲刺跑，组间走/慢跑 60-90s；三 椭圆机 Ae(2) 40min；四 W10 + Te(3)2x15min/Rec(1)5min + C5；六 Ae(2) 50min；日 长跑 18km，练补给"],
      ["08-24 至 08-30", "阈值触碰", "二 Ae(2) 50min；三 恢复骑 Rec(1) 35min；四 W10 + Th(4)5x4min/Rec(1)3min + C5；六 Rec(1) 35min；日 长跑 19km Ae(2)"],
      ["08-31 至 09-06", "第一峰值", "二 Ae(2) 55min；三 椭圆机 Ae(2) 35min；四 W10 + Te(3)3x12min/Rec(1)4min + C5；六 Ae(2) 45min；日 长跑 20km，后 5km Te(3) 下沿"],
      ["09-07 至 09-13", "吸收恢复", "二 Rec(1) 35min；四 W10 + Te(3)2x8min/Rec(1)4min + C5；六 Ae(2) 40min；日 长跑 14km"],
      ["09-14 至 09-20", "专项节奏", "二 Ae(2) 50min；三 恢复骑 Rec(1) 30min；四 W10 + Te(3)2x20min/Rec(1)5min + C5；六 Rec(1) 35min；日 长跑 18km，含 2x4km 半马体感"],
      ["09-21 至 09-27", "比赛配速耐受", "二 Ae(2) 45min；四 W10 + Th(4)3x6min/Rec(1)4min + C5；六 Ae(2) 50min 加 6x20s；日 长跑 21km，前 15km Ae(2)，后 6km Te(3)"],
      ["09-28 至 10-04", "最后一周建设", "二 Ae(2) 55min；三 椭圆机 Rec(1) 30min；四 W10 + Te(3)3x15min/Rec(1)4min + C5；六 Rec(1) 35min；日 长跑 18km，补给和装备彩排"],
      ["10-05 至 10-11", "Taper", "二 Ae(2) 45min；四 W10 + Te(3)2x8min/Rec(1)4min + C5；六 Rec(1) 30min 加 4x20s；日 长跑 12km"],
      ["10-12 至 10-18", "Race week", "二 Ae(2) 35min；四 W10 + Te(3)3x3min/Rec(1)3min + C5；六 Rec(1) 20min；日 半马比赛，锁定比赛日"]
    ]
  },
  {
    id: "b",
    label: "B · 跑骑混合",
    title: "全马 + 公路车双目标周期",
    profile: "35 岁 · 当前约 3 小时/周 · 每周 4–5 次",
    goal: "12 月全马 A 赛 + 11 月 120 km 公路车 B 赛",
    phase: "连续性 → 双项目 → 全马专项",
    cycle: "21 周 · 07/13–12/06",
    load: "3.5–7.5 小时/周",
    insight: "跑步决定主周期，骑行补充低冲击有氧；B 级骑行赛事被纳入路线，但不破坏全马建设。",
    startDate: "2026-07-13",
    weekRows: [
      ["07-13 至 07-19", "重新开始", "二 Ae(2) 跑 35min；四 Ae(2) 跑 40min；六 骑行 Ae(2) 75min；日 长跑 9km"],
      ["07-20 至 07-26", "稳定 4 次", "二 Ae(2) 40min；四 W10 + Te(3)3x5min/Rec(1)3min + C5；六 骑行 90min；日 长跑 11km"],
      ["07-27 至 08-02", "控制强度", "二 Rec(1) 30min；三 恢复骑 Rec(1) 35min，踏频 85-95rpm；四 Ae(2) 50min 加 6x20s 短时间冲刺跑，组间走/慢跑 60-90s；六 骑行 100min；日 长跑 13km"],
      ["08-03 至 08-09", "小回撤", "二 Ae(2) 35min；四 W10 + Te(3)2x6min/Rec(1)4min + C5；六 骑行 75min；日 长跑 10km"],
      ["08-10 至 08-16", "基础建设", "二 Ae(2) 45min；四 W10 + Te(3)3x8min/Rec(1)3min + C5；六 骑行 2h 含低踏频爬坡；日 长跑 15km"],
      ["08-17 至 08-23", "长跑推进", "二 Rec(1) 35min；三 游泳轻松连续 35min；四 Ae(2) 55min；六 骑行 2h15；日 长跑 17km"],
      ["08-24 至 08-30", "马拉松基础", "二 Ae(2) 45min；四 W10 + Te(3)2x12min/Rec(1)4min + C5；六 骑行 2h30 含 3x8min 稳态爬坡；日 长跑 19km"],
      ["08-31 至 09-06", "第一建设峰", "二 Ae(2) 50min；三 Rec(1) 跑 30min；四 Ae(2) 60min 加 6x15s 短时间冲刺跑，组间走/慢跑 60-90s；六 骑行 2h；日 长跑 20km，最后 4km 稳定"],
      ["09-07 至 09-13", "恢复周", "二 Rec(1) 30min；四 Ae(2) 40min；六 骑行 75min；日 长跑 14km"],
      ["09-14 至 09-20", "双项目建设", "二 Ae(2) 50min；四 W10 + Te(3)3x10min/Rec(1)4min + C5；六 骑行 3h 含 1200m 爬升；日 长跑 21km"],
      ["09-21 至 09-27", "骑行耐力", "二 Rec(1) 35min；三 游泳轻松连续 40min；四 Ae(2) 60min；六 骑行 3h30，练 50-60g/h 碳水；日 长跑 18km"],
      ["09-28 至 10-04", "马拉松节奏", "二 Ae(2) 45min；四 W10 + Te(3)2x20min/Rec(1)5min + C5；六 骑行 2h；日 长跑 24km，补给练习"],
      ["10-05 至 10-11", "B 赛专项骑", "二 Ae(2) 50min；四 Ae(2) 45min 加 6x20s；六 骑行 4h，接近 100-110km，爬升 1600m；日 Rec(1) 跑 35min"],
      ["10-12 至 10-18", "恢复吸收", "二 Rec(1) 30min；四 W10 + Te(3)2x8min/Rec(1)4min + C5；六 骑行 2h；日 长跑 18km"],
      ["10-19 至 10-25", "B 赛前稳定", "二 Ae(2) 45min；四 Ae(2) 50min 加 6x15s 短时间冲刺跑，组间走/慢跑 60-90s；六 骑行 2h30 含 3x12min 爬坡稳态；日 长跑 22km"],
      ["10-26 至 11-01", "B 赛周", "二 Ae(2) 跑 40min；四 骑行 60min 含 3x3min Te(3)；六 Rec(1) 20min；日 公路车 B 赛 120km/2000m，锁定赛事"],
      ["11-02 至 11-08", "B 赛后恢复", "二 休息或步行；四 Rec(1) 跑 30min；六 Ae(2) 跑 50min；日 长跑 20km，完全轻松"],
      ["11-09 至 11-15", "全马专项", "二 Ae(2) 50min；四 W10 + 马拉松体感 3x20min/Rec(1)5min + C5；六 骑行 Ae(2) 90min；日 长跑 28km"],
      ["11-16 至 11-22", "峰值周", "二 Rec(1) 35min；四 W10 + Te(3)2x15min/Rec(1)5min + C5；六 Ae(2) 45min；日 长跑 32km，前 24km Ae(2)，后 8km 马拉松体感"],
      ["11-23 至 11-29", "Taper", "二 Ae(2) 45min；四 W10 + Te(3)2x8min/Rec(1)4min + C5；六 Rec(1) 30min；日 长跑 18km"],
      ["11-30 至 12-06", "Race week", "二 Ae(2) 35min；四 W10 + Te(3)3x3min/Rec(1)3min + C5；六 Rec(1) 20min；日 全马 A 赛，锁定比赛日"]
    ]
  },
  {
    id: "c",
    label: "C · 越野混合",
    title: "50K 越野 + 全马转换周期",
    profile: "44 岁 · 全马 2:59 · 当前约 10 小时/周",
    goal: "10 月 50K 越野后，7 周转换至 12 月全马",
    phase: "越野专项 → 恢复 → 公路转换",
    cycle: "21 周 · 07/13–12/06",
    load: "8–12 小时/周",
    insight: "先发展爬升、下坡与补给耐受，再转换回公路效率；骑行和游泳承担低冲击有氧与恢复。",
    startDate: "2026-07-13",
    weekRows: [
      ["07-13 至 07-19", "越野专项启动", "二 Ae(2) 跑 60min；三 游泳 60min，含 8x50m 技术练习、组间轻松 25m；四 坡跑 W15 + 8x2min uphill Te(3)/jog down + C10；六 骑行 Ae(2) 2h；日 越野长跑 2h30，爬升 800m"],
      ["07-20 至 07-26", "下坡耐受", "二 Rec(1) 跑 40min；三 骑行 Ae(2) 60min，踏频 85-95rpm；四 公路 Te(3) 3x12min；六 山地跑 3h，爬升 1000m；日 骑行 Ae(2) 2h"],
      ["07-27 至 08-02", "背靠背", "二 Ae(2) 70min；三 游泳 45min；四 坡跑 10x90s；六 越野 3h15，练补给；日 Ae(2) 跑 75min"],
      ["08-03 至 08-09", "恢复周", "二 Rec(1) 40min；四 Ae(2) 60min 加 6x20s；六 骑行 2h；日 越野 2h，技术轻松"],
      ["08-10 至 08-16", "建设期", "二 Ae(2) 70min；三 游泳 Ae(2) 50min；四 W15 + Te(3)2x20min + C10；六 越野 3h45，爬升 1300m；日 游泳 45min 或 Rec(1) 跑 45min"],
      ["08-17 至 08-23", "长时间耐受", "二 Rec(1) 45min；三 骑行 Ae(2) 2h；四 坡跑 6x4min；六 越野 4h15，练 60-75g/h 碳水；日 Ae(2) 跑 75min"],
      ["08-24 至 08-30", "公路效率维护", "二 Ae(2) 60min；三 游泳轻松连续 45min；四 公路 W15 + Te(3)3x15min + C10；六 山地跑 3h30；日 骑行 2h30"],
      ["08-31 至 09-06", "越野峰值一", "二 Rec(1) 45min；四 坡跑 10x2min；六 越野 5h，爬升 1800-2200m；日 Ae(2) 60min，观察下坡酸痛"],
      ["09-07 至 09-13", "恢复吸收", "二 Rec(1) 40min；四 Ae(2) 60min；六 骑行 2h；日 越野 2h30"],
      ["09-14 至 09-20", "50K 专项", "二 Ae(2) 70min；三 游泳恢复 45min；四 坡跑 5x5min；六 越野 5h30，装备补给彩排；日 Rec(1) 跑 45min 或游泳"],
      ["09-21 至 09-27", "最后大负荷", "二 Ae(2) 60min；四 公路 Te(3) 2x20min；六 越野 4h30，技术下坡控制；日 骑行 Ae(2) 2h"],
      ["09-28 至 10-04", "专项收口", "二 Rec(1) 45min；三 骑行 Rec(1) 40min；四 坡跑 6x3min；六 越野 3h30，最后一次完整装备；日 Ae(2) 60min"],
      ["10-05 至 10-11", "50K taper", "二 Ae(2) 55min；四 W10 + Te(3)2x8min/Rec(1)4min + C5；六 越野 90min 轻松；日 休息或游泳"],
      ["10-12 至 10-18", "50K race week", "二 Ae(2) 40min；四 坡上 4x60s 轻刺激；六 Rec(1) 20min；日 50K 越野 A 赛，锁定比赛日"],
      ["10-19 至 10-25", "赛后恢复", "二 休息；三 游泳 30-45min；四 Rec(1) 跑 30min；六 骑行 Ae(2) 90min；日 Ae(2) 跑 60min，完全平路"],
      ["10-26 至 11-01", "公路转换", "二 Ae(2) 60min；四 W10 + Te(3)3x8min/Rec(1)4min + C5；六 骑行 2h；日 长跑 22km 平路"],
      ["11-02 至 11-08", "全马专项一", "二 Ae(2) 70min；三 Rec(1) 跑 40min；四 马拉松体感 3x20min；六 Ae(2) 50min；日 长跑 28km，后 8km 马拉松体感"],
      ["11-09 至 11-15", "全马专项二", "二 Rec(1) 45min；四 W15 + Te(3)2x25min + C10；六 骑行 90min；日 长跑 32km，补给演练"],
      ["11-16 至 11-22", "峰值与评估", "二 Ae(2) 60min；四 马拉松体感 4x15min；六 Ae(2) 45min；日 长跑 30km，若状态好后 10km 接近目标配速"],
      ["11-23 至 11-29", "Taper", "二 Ae(2) 50min；四 W10 + Te(3)2x8min/Rec(1)4min + C5；六 Rec(1) 35min；日 长跑 18km"],
      ["11-30 至 12-06", "全马 race week", "二 Ae(2) 40min；四 W10 + Te(3)3x3min/Rec(1)3min + C5；六 Rec(1) 20min；日 全马 A 赛，锁定比赛日"]
    ]
  }
];

export const landingPlans: LandingPlan[] = planSources.map(buildPlan);

function buildPlan(source: PlanSource): LandingPlan {
  const { weekRows, ...plan } = source;
  const weeks = weekRows.map((row, index) => buildWeek(row, index));
  const sessions = weeks
    .flatMap((week, weekIndex) => week.sessions.map((session) => ({
      day: weekIndex * 7 + session.weekday,
      sport: session.sport,
      title: session.title,
      detail: session.detail
    })))
    .filter((session) => session.day <= 30);

  return { ...plan, weeks, sessions };
}

function buildWeek([dateRange, focus, schedule]: WeekRow, index: number): LandingPlanWeek {
  return {
    number: index + 1,
    dateRange,
    focus,
    sessions: schedule.split("；").map(parseSession).filter((session): session is LandingCycleSession => session !== null)
  };
}

function parseSession(source: string): LandingCycleSession | null {
  const normalized = source.replaceAll("`", "").trim();
  const match = normalized.match(/^([一二三四五六日])\s+(.+)$/);
  if (!match) return null;

  const detail = match[2].trim();
  const sport = inferSport(detail);
  const intensity = inferIntensity(detail);
  return {
    weekday: weekdayMap[match[1]],
    sport,
    title: getSessionTitle(detail, sport, intensity),
    detail,
    intensity,
    segments: createSegments(detail, sport, intensity)
  };
}

function inferSport(detail: string): LandingSport {
  if (/休息|步行/.test(detail)) return "rest";
  if (/游泳/.test(detail)) return "swim";
  if (/骑行|恢复骑|公路车|椭圆机/.test(detail)) return "bike";
  if (/越野|山地|坡跑|坡上/.test(detail)) return "trail";
  if (/力量/.test(detail)) return "strength";
  return "run";
}

function inferIntensity(detail: string): LandingIntensity {
  if (/比赛|A 赛|B 赛/.test(detail)) return "race";
  if (/休息|步行/.test(detail)) return "recovery";
  if (/力量/.test(detail) && !/跑|骑行|游泳/.test(detail)) return "strength";
  if (/Th\(4\)/.test(detail)) return "threshold";
  if (/Te\(3\)|马拉松体感|稳态|坡跑|坡上/.test(detail)) return "tempo";
  if (/Rec\(1\)/.test(detail)) return "recovery";
  return "aerobic";
}

function getSessionTitle(detail: string, sport: LandingSport, intensity: LandingIntensity): string {
  const duration = detail.match(/(?:\d+h\d*|\d+(?:-\d+)?min|\d+km)/i)?.[0] ?? "";
  if (intensity === "race") return detail.split("，")[0];
  if (sport === "rest") return detail.includes("步行") ? "休息 / 步行" : "休息";
  if (detail.includes("长跑")) return detail.split("，")[0];
  if (detail.includes("越野") || detail.includes("山地跑")) return detail.split("，")[0];
  if (detail.includes("坡跑") || detail.includes("坡上")) return `坡度训练 ${duration}`.trim();
  if (sport === "bike") return detail.split("，")[0];
  if (sport === "swim") return detail.split("+")[0].trim();
  if (sport === "strength") return `力量训练 ${duration}`.trim();
  if (detail.includes("马拉松体感")) return "马拉松配速训练";
  if (intensity === "threshold") return "阈值跑";
  if (intensity === "tempo") return "节奏跑";
  if (intensity === "recovery") return `恢复跑 ${duration}`.trim();
  return `轻松跑 ${duration}`.trim();
}

function createSegments(detail: string, sport: LandingSport, intensity: LandingIntensity): LandingTrainingSegment[] {
  if (intensity === "race") return [{ label: "比赛", intensity: "race", width: 100 }];
  if (sport === "rest") return [{ label: "恢复", intensity: "rest", width: 100 }];
  if (sport === "strength") return [{ label: "力量", intensity: "strength", width: 100 }];
  if (sport === "swim" && detail.includes("力量")) {
    return [
      { label: "游泳", intensity: "aerobic", width: 58 },
      { label: "力量", intensity: "strength", width: 42 }
    ];
  }

  const repeat = detail.match(/(\d+)x(\d+)(?:min|s)?/i);
  if (/W\d+|C\d+/.test(detail) || repeat || intensity === "threshold" || intensity === "tempo") {
    const workLabel = repeat ? `${repeat[1]}×${repeat[2]}` : intensity === "threshold" ? "阈值" : "稳态";
    const workIntensity = /冲刺跑|strides/i.test(detail) ? "threshold" : intensity;
    return [
      { label: "热身", intensity: "aerobic", width: 18 },
      { label: workLabel, intensity: workIntensity, width: 25 },
      { label: "恢复", intensity: "recovery", width: 14 },
      { label: workLabel, intensity: workIntensity, width: 25 },
      { label: "放松", intensity: "aerobic", width: 18 }
    ];
  }

  if (/最后|后 \d+|后\d+/.test(detail)) {
    return [
      { label: "热身", intensity: "aerobic", width: 14 },
      { label: "有氧", intensity: "aerobic", width: 58 },
      { label: "稳态", intensity: "tempo", width: 28 }
    ];
  }

  return [
    { label: "进入", intensity: "recovery", width: 14 },
    { label: sport === "bike" ? "耐力" : sport === "trail" ? "山地" : "有氧", intensity: "aerobic", width: 72 },
    { label: "放松", intensity: "recovery", width: 14 }
  ];
}

export function getLandingPlanDate(day: number): string {
  const date = new Date(Date.UTC(2026, 6, 12 + day));
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function getLandingCycleDate(plan: LandingPlan, weekIndex: number, weekday: number): string {
  const date = new Date(`${plan.startDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + weekIndex * 7 + weekday - 1);
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}
