from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from enum import Enum


class SportType(str, Enum):
    RUNNING = "running"
    CYCLING = "cycling"
    TRAIL_RUNNING = "trail_running"
    HYROX = "hyrox"
    SWIMMING = "swimming"
    STRENGTH = "strength"
    RECOVERY = "recovery"


class EventType(str, Enum):
    HALF_MARATHON = "half_marathon"
    MARATHON = "marathon"
    ROAD_CYCLING = "road_cycling"
    TRAIL_RACE = "trail_race"
    HYROX = "hyrox"
    SWIM = "swim"


class EventPriority(str, Enum):
    A = "A"
    B = "B"
    C = "C"


class CoachMode(str, Enum):
    ACTIVE = "active"
    SUPPORT = "support"
    INACTIVE = "inactive"


@dataclass(frozen=True)
class BodyMetrics:
    height_cm: float | None = None
    weight_kg: float | None = None
    sex: str | None = None
    birth_year: int | None = None
    age_years: int | None = None
    weight_goal: str | None = None


@dataclass(frozen=True)
class DailyTrainingAvailability:
    day: str
    minutes: int


@dataclass(frozen=True)
class TrainingAvailability:
    weekly_hours: float | None = None
    weekly_hours_min: float | None = None
    weekly_hours_max: float | None = None
    daily_minutes: tuple[DailyTrainingAvailability, ...] = ()
    accepts_two_a_day: bool = False
    max_two_a_day_days_per_week: int | None = None
    two_a_day_allowed_days: tuple[str, ...] = ()


@dataclass(frozen=True)
class TrainingEnvironment:
    outdoor_climbs_available: bool | None = None
    treadmill_available: bool | None = None
    stairs_available: bool | None = None
    gym_available: bool | None = None
    notes: tuple[str, ...] = ()


@dataclass(frozen=True)
class FuelingProfile:
    carb_tolerance_g_per_hour_min: int | None = None
    carb_tolerance_g_per_hour_max: int | None = None
    preferred_sources: tuple[str, ...] = ()
    solid_food_ok: bool | None = None
    notes: tuple[str, ...] = ()


@dataclass(frozen=True)
class TrailRunningExperience:
    longest_distance_km: float | None = None
    max_elevation_gain_m: int | None = None
    longest_duration_hours_min: float | None = None
    longest_duration_hours_max: float | None = None
    tune_up_races_as_training: bool = False


@dataclass(frozen=True)
class HeartRateZone:
    name: str
    lower_bpm: int | None = None
    upper_bpm: int | None = None


@dataclass(frozen=True)
class HeartRateProfile:
    max_hr_bpm: int | None = None
    resting_hr_bpm: int | None = None
    threshold_hr_bpm: int | None = None
    zones: tuple[HeartRateZone, ...] = ()


@dataclass(frozen=True)
class RaceEvent:
    name: str
    event_type: EventType
    date: date
    priority: EventPriority
    target: str | None = None
    distance_km: float | None = None
    elevation_gain_m: int | None = None


@dataclass(frozen=True)
class UserProfile:
    athlete_id: str
    timezone: str
    weekly_training_days: int
    body: BodyMetrics = field(default_factory=BodyMetrics)
    availability: TrainingAvailability = field(default_factory=TrainingAvailability)
    environment: TrainingEnvironment = field(default_factory=TrainingEnvironment)
    fueling: FuelingProfile = field(default_factory=FuelingProfile)
    trail_experience: TrailRunningExperience = field(default_factory=TrailRunningExperience)
    preferred_rest_days: tuple[str, ...] = ("Monday",)
    primary_sports: tuple[SportType, ...] = (SportType.RUNNING,)
    injuries: tuple[str, ...] = ()
    current_soreness: tuple[str, ...] = ()
    nutrition_preferences: tuple[str, ...] = ()
    ftp_watts: int | None = None
    threshold_pace: str | None = None
    heart_rate: HeartRateProfile = field(default_factory=HeartRateProfile)


@dataclass(frozen=True)
class ReadinessSnapshot:
    date: date
    recovery_percent: int | None = None
    hrv_status: str | None = None
    sleep_score: int | None = None
    resting_hr_bpm: int | None = None
    short_term_load: int | None = None
    long_term_load: int | None = None
    load_ratio: float | None = None
    notes: tuple[str, ...] = ()


@dataclass(frozen=True)
class FatigueBudget:
    weekly_volume_direction: str
    max_hard_sessions: int
    long_session_allowed: bool
    intensity_ceiling: str
    risk_flags: tuple[str, ...] = ()


@dataclass(frozen=True)
class SportHistorySummary:
    sport: str
    activity_count: int
    total_duration_minutes: int
    total_distance_km: float
    total_elevation_gain_m: int
    longest_duration_minutes: int
    longest_distance_km: float


@dataclass(frozen=True)
class TrainingHistoryProfile:
    start_date: date
    end_date: date
    total_activities: int
    active_weeks: int
    average_weekly_hours: float
    longest_activity: dict
    sport_summaries: tuple[SportHistorySummary, ...] = ()
    window_weeks: int = 0
    active_weekly_hours: float = 0
    consistency_ratio: float = 0


@dataclass(frozen=True)
class TrailReadinessProfile:
    trail_activity_count: int
    total_trail_hours: float
    total_elevation_gain_m: int
    max_distance_km: float
    max_duration_minutes: int
    max_elevation_gain_m: int


@dataclass(frozen=True)
class CyclingReadinessProfile:
    ride_count: int
    total_ride_hours: float
    max_distance_km: float
    max_duration_minutes: int
    has_power_data: bool


@dataclass(frozen=True)
class DisciplineReadinessProfile:
    trail: TrailReadinessProfile
    cycling: CyclingReadinessProfile


@dataclass(frozen=True)
class NutritionAdvice:
    phase_focus: str
    daily_guidance: tuple[str, ...]
    workout_fueling: tuple[str, ...]
    recovery_guidance: tuple[str, ...]


@dataclass(frozen=True)
class WorkoutStage:
    name: str
    duration_minutes: int
    heart_rate_zone: str | None = None
    power_zone: str | None = None
    pace_zone: str | None = None
    cadence: str | None = None
    incline: str | None = None
    instructions: tuple[str, ...] = ()


@dataclass(frozen=True)
class TrainingSession:
    day: str
    sport: SportType
    title: str
    duration_minutes: int
    intensity: str
    purpose: str
    nutrition: str | None = None
    downgrade: str | None = None
    target_zone: str | None = None
    phases: tuple[str, ...] = ()
    workout_stages: tuple[WorkoutStage, ...] = ()


@dataclass
class TrainingPlan:
    title: str
    sessions: list[TrainingSession] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class CoachSelection:
    active: tuple[SportType, ...]
    support: tuple[SportType, ...]
    inactive: tuple[SportType, ...]
