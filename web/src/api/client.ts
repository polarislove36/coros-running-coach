/// <reference types="vite/client" />

import type { DeviceConnection, RaceGoal, ReviewRecord, SportType, TrainingDay } from "../domain/types";

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const apiEndpoints = {
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  me: "/api/v1/me",
  devices: "/api/v1/devices",
  corosAuthorize: "/api/v1/devices/coros/authorize",
  corosSync: "/api/v1/devices/coros/sync",
  profile: "/api/v1/profile",
  events: "/api/v1/events",
  generatePlan: "/api/v1/plans/generate",
  currentPlan: "/api/v1/plans/current",
  today: "/api/v1/dashboard/today",
  dailyReview: "/api/v1/reviews/daily",
  reviews: "/api/v1/reviews",
  settings: "/api/v1/settings",
  account: "/api/v1/account",
  accountExport: "/api/v1/account/export"
} as const;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiUser {
  id: string;
  account: string;
  name: string;
}

export interface ApiPlan {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  phase: string;
  version: number;
  data_mode: "demo" | "cache";
  days: ApiTrainingDay[];
  last_change?: string;
  generated_at?: string;
  ai_coach?: {
    mode: "deepseek" | "rules-only" | "fallback";
    model?: string | null;
    summary: string;
    priorities: string[];
    risk_flags: string[];
  };
}

export interface UserSettings {
  daily_plan_update: boolean;
  workout_review: boolean;
  event_reminders: boolean;
}

interface ApiTrainingDay {
  date: string;
  weekday: string;
  title: string;
  session: string;
  pace: string;
  heart_rate: string;
  purpose: string;
  sport: SportType;
  duration_minutes: number;
  status: "planned" | "completed" | "adjusted";
  stages?: Array<{
    name: string;
    duration_minutes: number;
    heart_rate_zone?: string | null;
    power_zone?: string | null;
    pace_zone?: string | null;
    instructions?: string[];
  }>;
}

export interface DashboardData {
  date: string;
  decision: ApiTrainingDay;
  readiness: {
    recovery_score: number;
    hrv_ms: number;
    hrv_status: string;
    resting_hr: number;
    sleep_hours: number;
    sleep_status: string;
  };
  latest_review: ApiReview | null;
  future_three_days: ApiTrainingDay[];
  plan_version: number;
  data_status: "demo" | "cache";
  last_sync: string;
}

export interface ApiReview {
  id?: string;
  date: string;
  summary: string;
  decision: string;
  score: number;
  pain?: boolean;
  updated_at?: string;
}

export interface IntakePayload {
  goal_mode: "race" | "general";
  training_purpose: string;
  primary_sports: string[];
  secondary_sports: string[];
  weekly_hours: string;
  weekly_schedule: Record<string, { role: string; duration: number }>;
  current_constraints: string;
  timezone: string;
}

export interface EventPayload {
  name: string;
  date: string;
  event_type: string;
  priority: "A" | "B" | "C";
  target: string;
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  if (isDemoMode) {
    throw new ApiError(503, "当前使用纯前端演示模式");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    credentials: "include"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new ApiError(response.status, body?.detail ?? `请求失败（${response.status}）`);
  }

  return response.json() as Promise<T>;
}

export async function login(account: string, password: string): Promise<ApiUser> {
  const result = await apiRequest<{ user: ApiUser }>(apiEndpoints.login, {
    method: "POST",
    body: JSON.stringify({ account, password })
  });
  return result.user;
}

export function getMe(): Promise<ApiUser> {
  return apiRequest<ApiUser>(apiEndpoints.me);
}

export function logout(): Promise<{ ok: boolean }> {
  return apiRequest(apiEndpoints.logout, { method: "POST", body: "{}" });
}

export function getProfile(): Promise<IntakePayload> {
  return apiRequest<IntakePayload>(apiEndpoints.profile);
}

export function saveProfile(payload: IntakePayload): Promise<IntakePayload> {
  return apiRequest<IntakePayload>(apiEndpoints.profile, { method: "PUT", body: JSON.stringify(payload) });
}

export function getSettings(): Promise<UserSettings> {
  return apiRequest<UserSettings>(apiEndpoints.settings);
}

export function saveSettings(payload: UserSettings): Promise<UserSettings> {
  return apiRequest<UserSettings>(apiEndpoints.settings, { method: "PUT", body: JSON.stringify(payload) });
}

export function exportAccountData(): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(apiEndpoints.accountExport);
}

export function deleteAccount(): Promise<{ ok: boolean }> {
  return apiRequest(apiEndpoints.account, { method: "DELETE" });
}

export async function downloadApiFile(path: string): Promise<Blob> {
  const response = await fetch(`${apiBaseUrl}${path}`, { credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new ApiError(response.status, body?.detail ?? `下载失败（${response.status}）`);
  }
  return response.blob();
}

export async function createEvent(payload: EventPayload): Promise<RaceGoal> {
  const event = await apiRequest<Record<string, unknown>>(apiEndpoints.events, { method: "POST", body: JSON.stringify(payload) });
  return normalizeEvent(event);
}

export async function updateEvent(eventId: string, payload: EventPayload): Promise<RaceGoal> {
  const event = await apiRequest<Record<string, unknown>>(`${apiEndpoints.events}/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  return normalizeEvent(event);
}

export function deleteEvent(eventId: string): Promise<{ ok: boolean }> {
  return apiRequest(`${apiEndpoints.events}/${eventId}`, { method: "DELETE" });
}

export async function listEvents(): Promise<RaceGoal[]> {
  const events = await apiRequest<Record<string, unknown>[]>(apiEndpoints.events);
  return events.map(normalizeEvent);
}

export async function authorizeCoros(): Promise<{ mode: "demo" | "oauth"; authorization_url?: string | null }> {
  return apiRequest(apiEndpoints.corosAuthorize, { method: "POST", body: "{}" });
}

export async function listDevices(): Promise<DeviceConnection[]> {
  const devices = await apiRequest<Array<Record<string, unknown>>>(apiEndpoints.devices);
  return devices.map(normalizeDevice);
}

export function syncCoros(): Promise<unknown> {
  return apiRequest(apiEndpoints.corosSync, { method: "POST", body: "{}" });
}

export function disconnectDevice(deviceId: string): Promise<{ ok: boolean }> {
  return apiRequest(`${apiEndpoints.devices}/${deviceId}`, { method: "DELETE" });
}

export async function generatePlan(dataMode: "demo" | "cache"): Promise<{ plan: ApiPlan; days: TrainingDay[] }> {
  const plan = await apiRequest<ApiPlan>(apiEndpoints.generatePlan, {
    method: "POST",
    body: JSON.stringify({ requested_days: 14, data_mode: dataMode })
  });
  return { plan, days: plan.days.map(normalizeTrainingDay) };
}

export async function getCurrentPlan(): Promise<{ plan: ApiPlan; days: TrainingDay[] }> {
  const plan = await apiRequest<ApiPlan>(apiEndpoints.currentPlan);
  return { plan, days: plan.days.map(normalizeTrainingDay) };
}

export function getDashboard(): Promise<DashboardData> {
  return apiRequest<DashboardData>(apiEndpoints.today);
}

export async function listReviews(): Promise<ReviewRecord[]> {
  const reviews = await apiRequest<ApiReview[]>(apiEndpoints.reviews);
  return reviews.map((review) => ({
    date: review.date,
    sport: "rest",
    title: "每日训练复盘",
    summary: review.summary,
    score: review.score,
    load: 0,
    duration: "-",
    decision: review.decision
  }));
}

export async function submitDailyReview(payload: {
  feeling: string;
  pain: boolean;
  pain_detail: string;
  reasons: string[];
}): Promise<{ plan_changed: boolean; dashboard: DashboardData }> {
  return apiRequest(apiEndpoints.dailyReview, { method: "POST", body: JSON.stringify(payload) });
}

function normalizeTrainingDay(day: ApiTrainingDay): TrainingDay {
  return {
    date: day.date,
    weekday: day.weekday,
    title: day.title,
    session: day.session,
    pace: day.pace,
    heartRate: day.heart_rate,
    purpose: day.purpose,
    sport: day.sport,
    durationMinutes: day.duration_minutes,
    status: day.status,
    stages: day.stages?.map((stage) => ({
      name: stage.name,
      durationMinutes: stage.duration_minutes,
      heartRateZone: stage.heart_rate_zone,
      powerZone: stage.power_zone,
      paceZone: stage.pace_zone,
      instructions: stage.instructions ?? []
    }))
  };
}

function normalizeEvent(event: Record<string, unknown>): RaceGoal {
  return {
    id: String(event.id ?? ""),
    name: String(event.name ?? "赛事"),
    date: String(event.date ?? ""),
    eventType: String(event.event_type ?? "road-running"),
    discipline: eventTypeLabel(String(event.event_type ?? "")),
    priority: String(event.priority ?? "B") as RaceGoal["priority"],
    goal: String(event.target ?? ""),
    status: String(event.status ?? "support") as RaceGoal["status"]
  };
}

function normalizeDevice(device: Record<string, unknown>): DeviceConnection {
  const rawStatus = String(device.status ?? "available");
  return {
    id: String(device.id ?? "device"),
    name: String(device.name ?? "运动设备"),
    status: rawStatus.startsWith("connected") ? "connected" : rawStatus === "planned" ? "planned" : "available",
    connectionStatus: rawStatus,
    connectionError: device.connection_error ? String(device.connection_error) : undefined,
    lastSync: device.last_sync ? new Date(String(device.last_sync)).toLocaleString("zh-CN") : undefined,
    dataScopes: (device.data_scopes as string[] | undefined) ?? []
  };
}

function eventTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    "road-running": "公路跑",
    "trail-running": "越野跑",
    "road-bike": "公路骑行",
    triathlon: "铁人三项",
    xterra: "越野铁三",
    duathlon: "骑跑两项",
    aquabike: "游骑两项",
    aquathlon: "游跑两项"
  };
  return labels[value] ?? value;
}
