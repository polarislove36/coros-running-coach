import type { TrainingDay } from "./types";

export interface CoachEngineWorkoutStage {
  name: string;
  duration_minutes: number;
  heart_rate_zone?: string | null;
  power_zone?: string | null;
  pace_zone?: string | null;
  cadence?: string | null;
  incline?: string | null;
  instructions?: string[];
}

export interface CoachEngineSession {
  day: string;
  sport: string;
  title: string;
  duration_minutes: number;
  intensity: string;
  purpose: string;
  nutrition?: string | null;
  downgrade?: string | null;
  target_zone?: string | null;
  phases?: string[];
  workout_stages?: CoachEngineWorkoutStage[];
}

export interface CoachEnginePlan {
  title: string;
  sessions: CoachEngineSession[];
  notes: string[];
}

const dayOffsets: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6
};

const chineseWeekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function enginePlanToTrainingDays(plan: CoachEnginePlan, weekStartDate: string): TrainingDay[] {
  return plan.sessions.map((session) => {
    const date = dateForEngineDay(weekStartDate, session.day);

    return {
      date,
      weekday: chineseWeekdays[dayOffsets[session.day] ?? 0],
      title: session.title,
      session: formatSession(session),
      pace: formatPaceTarget(session),
      heartRate: formatIntensityTarget(session),
      purpose: formatPurpose(session)
    };
  });
}

export function getEnginePlanContractSummary(): string[] {
  return [
    "title",
    "sessions[].day",
    "sessions[].sport",
    "sessions[].title",
    "sessions[].duration_minutes",
    "sessions[].purpose",
    "sessions[].workout_stages[]"
  ];
}

function dateForEngineDay(weekStartDate: string, day: string): string {
  const [year, month, dateOfMonth] = weekStartDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, dateOfMonth + (dayOffsets[day] ?? 0)));
  return date.toISOString().slice(0, 10);
}

function formatSession(session: CoachEngineSession): string {
  if (session.duration_minutes <= 0) {
    return session.title;
  }

  const stages = session.workout_stages?.map(formatStage).filter(Boolean) ?? [];
  if (stages.length === 0) {
    return `${session.title} ${session.duration_minutes}分钟`;
  }

  return `${session.title} ${session.duration_minutes}分钟：${stages.join("；")}`;
}

function formatStage(stage: CoachEngineWorkoutStage): string {
  const instructions = stage.instructions?.filter(Boolean).join("，");
  const parts = [`${stage.name}${stage.duration_minutes}分钟`];

  if (instructions) {
    parts.push(instructions);
  }

  if (stage.incline) {
    parts.push(`坡度 ${stage.incline}`);
  }

  if (stage.cadence) {
    parts.push(`步频/踏频 ${stage.cadence}`);
  }

  return parts.join("，");
}

function formatPaceTarget(session: CoachEngineSession): string {
  const paceZones = collectStageValues(session, "pace_zone");
  return paceZones.length > 0 ? paceZones.join("；") : "-";
}

function formatIntensityTarget(session: CoachEngineSession): string {
  const heartRateZones = collectStageValues(session, "heart_rate_zone");
  const powerZones = collectStageValues(session, "power_zone");
  const values = [...heartRateZones, ...powerZones];

  if (values.length > 0) {
    return values.join("；");
  }

  return session.target_zone ?? session.intensity;
}

function collectStageValues(
  session: CoachEngineSession,
  field: "heart_rate_zone" | "power_zone" | "pace_zone"
): string[] {
  const values = session.workout_stages?.map((stage) => stage[field]).filter(isPresent) ?? [];
  return [...new Set(values)];
}

function formatPurpose(session: CoachEngineSession): string {
  const notes = [session.purpose];

  if (session.nutrition) {
    notes.push(`补给：${session.nutrition}`);
  }

  if (session.downgrade) {
    notes.push(`降级规则：${session.downgrade}`);
  }

  return notes.join(" ");
}

function isPresent(value: string | null | undefined): value is string {
  return Boolean(value);
}
