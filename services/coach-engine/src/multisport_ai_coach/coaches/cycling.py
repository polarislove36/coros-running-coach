from __future__ import annotations

from multisport_ai_coach.coaches.base import CoachContext, CoachModule
from multisport_ai_coach.domain import (
    FatigueBudget,
    NutritionAdvice,
    RaceEvent,
    SportType,
    TrainingPlan,
    TrainingSession,
    UserProfile,
    WorkoutStage,
)


class CyclingCoach(CoachModule):
    def build_week_plan(
        self,
        profile: UserProfile,
        events: list[RaceEvent],
        fatigue: FatigueBudget,
        nutrition: NutritionAdvice,
        context: CoachContext | None = None,
    ) -> TrainingPlan:
        cycling_readiness = context.discipline_readiness.cycling if context and context.discipline_readiness else None
        zones = self._power_guidance(profile, cycling_readiness)
        tempo_module = self._tempo_module(cycling_readiness)
        tempo_endurance_minutes = int(tempo_module["duration"]) - int(tempo_module["work_minutes"]) - 20
        long_ride_minutes = self._long_ride_minutes(cycling_readiness)

        sessions = [
            TrainingSession(
                day="Wednesday",
                sport=SportType.CYCLING,
                title="Endurance ride with cadence skills",
                duration_minutes=60,
                intensity=f"{zones['endurance']}; 6 x 45s high cadence, full easy spin recovery",
                purpose=f"Build aerobic base and pedaling economy. {zones['basis']}",
                target_zone=zones["endurance"],
                phases=(
                    "10 min easy spin warm-up",
                    "6 x 45 sec high cadence, 75 sec easy spin recovery",
                    "35 min steady endurance riding",
                    "5 min easy cool-down",
                ),
                workout_stages=(
                    WorkoutStage(
                        "Warm-up",
                        10,
                        power_zone=zones["easy"],
                        cadence="90 rpm",
                        instructions=("Easy spin, gradually settle into position.",),
                    ),
                    WorkoutStage(
                        "Cadence skills",
                        15,
                        power_zone=f"{zones['endurance']} on recoveries",
                        cadence="105 rpm during efforts",
                        instructions=("6 x 45 sec high cadence.", "75 sec easy spin between efforts."),
                    ),
                    WorkoutStage(
                        "Endurance",
                        30,
                        power_zone=zones["endurance"],
                        cadence="90 rpm",
                        instructions=("Steady aerobic riding.", "Avoid power surges."),
                    ),
                    WorkoutStage("Cool-down", 5, power_zone=zones["recovery"], cadence="Natural easy spin"),
                ),
            )
        ]

        if fatigue.max_hard_sessions >= 1 and "recovery only" not in fatigue.intensity_ceiling:
            sessions.append(
                TrainingSession(
                    day="Friday",
                    sport=SportType.CYCLING,
                    title=tempo_module["title"],
                    duration_minutes=tempo_module["duration"],
                    intensity=f"{tempo_module['work']} {zones['tempo']}, easy spin between reps",
                    purpose=f"Develop durable cycling power without threshold-level stress. {zones['basis']}",
                    nutrition="Eat carbohydrate before the ride; bring water.",
                    downgrade="If legs are heavy, ride 60 minutes endurance instead.",
                    target_zone=zones["tempo"],
                    phases=(
                        "15 min easy spin warm-up",
                        f"{tempo_module['work']} tempo, 5 min easy spin between reps",
                        "10 min steady endurance riding",
                        "5 min easy cool-down",
                    ),
                    workout_stages=(
                        WorkoutStage("Warm-up", 15, power_zone=zones["easy"], cadence="90 rpm"),
                        WorkoutStage(
                            "Tempo intervals",
                            tempo_module["work_minutes"],
                            power_zone=zones["tempo"],
                            cadence="90 rpm",
                            instructions=(f"{tempo_module['work']} tempo.", "5 min easy spin between reps."),
                        ),
                        WorkoutStage("Endurance", tempo_endurance_minutes, power_zone=zones["endurance"], cadence="90 rpm"),
                        WorkoutStage("Cool-down", 5, power_zone=zones["recovery"], cadence="Natural easy spin"),
                    ),
                )
            )

        if fatigue.long_session_allowed:
            sessions.append(
                TrainingSession(
                    day="Saturday",
                    sport=SportType.CYCLING,
                    title="Long endurance ride",
                    duration_minutes=long_ride_minutes,
                    intensity=zones["endurance"],
                    purpose="Build cycling durability and practice steady fueling.",
                    nutrition="Use 40-60g carbohydrate and 500-750ml fluid per hour.",
                    target_zone=zones["endurance"],
                    phases=(
                        "15 min easy spin warm-up",
                        "Main ride steady endurance, stay aero/relaxed when possible",
                        "Last 20 min smooth cadence without power surges",
                        "10 min easy cool-down",
                    ),
                    workout_stages=(
                        WorkoutStage("Warm-up", 15, power_zone=zones["easy"], cadence="90 rpm"),
                        WorkoutStage(
                            "Main endurance ride",
                            max(long_ride_minutes - 40, 30),
                            power_zone=zones["endurance"],
                            cadence="90 rpm",
                            instructions=("Stay steady and relaxed.", "Practice fueling."),
                        ),
                        WorkoutStage(
                            "Smooth finish",
                            20,
                            power_zone=zones["endurance"],
                            cadence="95 rpm",
                            instructions=("Keep output even.", "No late surges."),
                        ),
                        WorkoutStage("Cool-down", 5, power_zone=zones["recovery"], cadence="Natural easy spin"),
                    ),
                )
            )

        return TrainingPlan(title="Cycling candidate plan", sessions=sessions)

    def _power_guidance(self, profile: UserProfile, cycling_readiness) -> dict[str, str]:
        ftp = profile.ftp_watts
        has_recent_power = cycling_readiness.has_power_data if cycling_readiness is not None else False
        if ftp is not None and has_recent_power:
            return {
                "recovery": f"Z1 <= {round(ftp * 0.55)}W",
                "easy": f"Z1-Z2 <= {round(ftp * 0.75)}W",
                "endurance": f"Z2 {round(ftp * 0.56)}-{round(ftp * 0.75)}W",
                "tempo": f"Tempo {round(ftp * 0.76)}-{round(ftp * 0.87)}W",
                "basis": "Recent power data is present, so power is the primary control metric.",
            }
        if ftp is not None:
            return {
                "recovery": f"Z1 <= {round(ftp * 0.55)}W if power is available",
                "easy": f"Z1-Z2 <= {round(ftp * 0.75)}W if power is available",
                "endurance": f"Z2 {round(ftp * 0.56)}-{round(ftp * 0.75)}W if power is available, RPE 3-4",
                "tempo": f"Tempo {round(ftp * 0.76)}-{round(ftp * 0.87)}W if power is available, RPE 5-6",
                "basis": "FTP is known but recent power payload is missing, so pair watts with RPE/heart-rate checks.",
            }
        return {
            "recovery": "RPE 1-2 / very easy spin",
            "easy": "RPE 2-4 / easy aerobic riding",
            "endurance": "RPE 3-4 / conversational aerobic riding",
            "tempo": "RPE 5-6 / controlled tempo",
            "basis": "FTP is missing, so avoid speed-based zones and use RPE/heart rate.",
        }

    def _tempo_module(self, cycling_readiness) -> dict[str, int | str]:
        if cycling_readiness is None or cycling_readiness.ride_count < 2:
            return {"title": "Aerobic tempo ride", "duration": 60, "work": "2 x 8 min", "work_minutes": 21}
        if cycling_readiness.max_duration_minutes >= 150 and cycling_readiness.has_power_data:
            return {"title": "Tempo ride", "duration": 75, "work": "3 x 10 min", "work_minutes": 40}
        return {"title": "Aerobic tempo ride", "duration": 65, "work": "2 x 10 min", "work_minutes": 25}

    def _long_ride_minutes(self, cycling_readiness) -> int:
        if cycling_readiness is None:
            return 120
        if cycling_readiness.ride_count == 0:
            return 75
        if cycling_readiness.max_duration_minutes >= 180:
            return 120
        if cycling_readiness.max_duration_minutes >= 90:
            return 105
        return 90
