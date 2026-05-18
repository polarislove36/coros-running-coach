# Pace Zones and Workout Library

Use this reference when outputting a concrete running plan. The plan must include pace and heart-rate guidance unless the user explicitly asks for a high-level plan only.

## Default Plan Format

- Use Chinese by default.
- For a day-by-day plan, use a Markdown table with these columns:
  - `日期（周几）`
  - `训练项目`
  - `参考配速 / 参考心率`
  - `目的`
- Do not include a per-row alternative column by default. Put downgrade rules after the table.
- Put weekly mileage in the week heading, not as a table column, for example `第 1 周｜有氧能力建设基础期｜周跑量 36km`.
- For multi-week plans, separate weeks with a week label, stage label, and weekly mileage.
- For rest days, keep the purpose plain: use `恢复` or `休息`. Do not write abstract phrases such as `吸收训练`.
- Default schedule for office workers:
  - Monday: rest, unless the user explicitly prefers otherwise.
  - Saturday or Sunday: long run, usually Sunday if not specified.
  - Avoid two hard running days in a row.
  - Put quality work on Tuesday/Wednesday or Thursday, leaving enough room before the weekend long run.

## Weekly Mileage Progression

Use the runner's recent actual weekly mileage as the starting point. Do not jump because a template demands it.

- If recent weekly mileage is below 20 km and the runner is a true beginner, the next week may increase by up to 30%, but only when recovery is good.
- If recent weekly mileage is 20-30 km, the next week should usually increase by no more than 20%.
- If recent weekly mileage is above 30 km, the next week should usually increase by no more than 10%.
- Every 3-4 weeks, use a cutback/recovery week with roughly 15-25% lower volume.
- Do not increase weekly mileage, long-run distance, and intensity density at the same time.

## Periodization

For a complete cycle, label the stage and make weeks meaningfully different.

- **有氧能力建设基础期**: mostly easy running, long-run habit, strength/cross-training, and optional short relaxed sprint touches. Usually 85-95% easy. Do not place hard fartlek, threshold, tempo, or interval sessions in week 1 of a base phase unless the runner already has a clear recent history of tolerating that exact work.
- **强度提升期**: keep easy volume high, add threshold, tempo, hills, fartlek, or intervals depending on race distance. Usually 75-85% easy.
- **专项能力巩固期**: include race-pace work and long runs with controlled segments when the runner is prepared.
- **减量期**: reduce volume, keep small controlled intensity touches, prioritize freshness. The final week before an A race should not include maximal intervals or heavy lower-body strength.

## Pace and HR Prescription

Priority order:

1. Use current fitness from recent race/time trial/COROS threshold estimates when available.
2. Use the user's target race only as a reference if current fitness is unknown or clearly aligned.
3. Adjust for heat, humidity, hills, altitude, trail surface, fatigue, and recovery.
4. If COROS HR zones exist, use the user's actual COROS Z1-Z5 bpm ranges first.
5. If COROS HR zones cannot be read but historical running records are available, infer provisional bpm ranges from recent similar workouts and label them as `基于历史训练推断`.
6. If neither COROS zones nor enough historical workout HR data are available, do not invent bpm values. Use zone labels plus RPE language, such as `Z2（未读取到具体 bpm，体感能完整说话）`.

Fallback HR-zone guidance when exact COROS bpm ranges are unavailable:

- Recovery: Z1-Z2; very easy breathing.
- Easy aerobic: Z2; can speak in complete sentences.
- Long run: mostly Z2; steady finish may touch low Z3 if prepared.
- Marathon pace / race-pace aerobic: upper Z2 to Z3.
- Tempo / threshold: Z3-Z4 or near threshold HR; controlled hard, not a time trial.
- 5K/10K intervals: Z4-Z5, but HR lags; prescribe by pace/RPE first.
- Short sprint touches / repetitions: HR is not useful; prescribe by duration, smooth form, and full recovery.

When writing `参考配速 / 参考心率`, include both:

- Pace as a range or exact target: `6:40-7:05/km` or `约 5:40/km`.
- HR as a COROS zone/range when available: `COROS Z2（142-154 bpm）`.
- If exact COROS zones are unavailable but recent similar workout HR exists, write an estimated range: `Z2（约 138-148 bpm，基于近 4 周轻松跑推断）`.
- If no bpm basis is available, write the zone without bpm: `Z2（未读取到具体 bpm，体感能完整说话）`.

If the user has no COROS zones, HRmax, or threshold HR available, say `按 Z2 体感：能完整说话` rather than inventing a bpm number.

For compound workouts, specify pace and HR for every segment. Do not write only one pace/HR for the whole workout. Example:

- `轻松跑 7km + 4组短时间冲刺跑`
- Pace/HR cell: `轻松段 6:05-6:35/km，约 138-148 bpm；冲刺段 15-20秒/组，约 4:30-5:00/km 或放松快跑，心率不作为控制指标，组间走/慢跑至呼吸恢复。`

## Hansons-Style Pace Reference

This table is a rough pace anchor from the user-provided Hansons training-method reference image. Use it as a starting point, then adjust using current fitness and recovery. Interpolate between rows when needed.

| Full marathon target | Marathon pace | Half marathon pace | 5K-10K pace | Tempo pace | Easy pace |
|---:|---:|---:|---:|---:|---:|
| 2:45:00 | 3:55/km | 3:45/km | 3:26-3:35/km | 3:42/km | 4:45/km |
| 3:00:00 | 4:16/km | 4:06/km | 3:45-3:55/km | 4:02/km | 5:10/km |
| 3:15:00 | 4:37/km | 4:26/km | 4:04-4:14/km | 4:21/km | 5:30/km |
| 3:30:00 | 4:59/km | 4:46/km | 4:23-4:34/km | 4:40/km | 6:00/km |
| 3:45:00 | 5:20/km | 5:07/km | 4:42-4:53/km | 5:00/km | 6:25/km |
| 4:00:00 | 5:41/km | 5:27/km | 5:00-5:13/km | 5:19/km | 6:45/km |
| 4:15:00 | 6:03/km | 5:48/km | 5:19-5:33/km | 5:39/km | 7:10/km |
| 4:30:00 | 6:24/km | 6:08/km | 5:38-5:52/km | 5:58/km | 7:30/km |
| 4:45:00 | 6:45/km | 6:29/km | 5:57-6:12/km | 6:18/km | 7:55/km |
| 5:00:00 | 7:07/km | 6:49/km | 6:15-6:31/km | 6:37/km | 8:20/km |
| 5:15:00 | 7:28/km | 7:10/km | 6:34-6:51/km | 6:56/km | 8:45/km |
| 5:30:00 | 7:49/km | 7:30/km | 6:53-7:10/km | 7:16/km | 9:05/km |
| 5:45:00 | 8:11/km | 7:51/km | 7:12-7:30/km | 7:35/km | 9:30/km |
| 6:00:00 | 8:32/km | 8:11/km | 7:30-7:50/km | 7:55/km | 9:50/km |

Do not use a faster target row just because the user wants that finish time. If current training data does not support the row, choose a slower row or label it aspirational.

## Basic Workout Modules

### 轻松跑

- Purpose: aerobic base, recovery, weekly volume.
- Dose: 30-70 minutes depending on level.
- Pace/HR: easy pace from current fitness; COROS Z2 when available; otherwise Z2 by feel, can speak in complete sentences.
- Use: most weekly runs; this plus long runs usually makes up about 80% of weekly mileage.

### 恢复跑

- Purpose: active recovery after hard or long sessions.
- Dose: 20-45 minutes.
- Pace/HR: slower than easy pace; COROS Z1-Z2 when available; otherwise very easy by feel.
- Use: only if the athlete recovers better with movement; otherwise rest.

### 长距离跑

- Purpose: endurance, tissue durability, fueling practice, late-race fatigue resistance.
- Dose: 25-35% of weekly mileage for most recreational runners; avoid sudden jumps.
- Pace/HR: mostly easy pace; COROS Z2 when available. Advanced runners may include controlled race-pace segments.
- Use: usually Saturday or Sunday.

### 阈值跑

- Purpose: improve sustainable hard effort and lactate clearance.
- Dose: continuous 15-30 minutes or cruise intervals such as 3 x 8 min, 4 x 6 min, 2 x 15 min.
- Pace/HR: threshold/tempo pace; COROS Z3-Z4 when available; controlled hard.
- Use: strong choice for 10K, half marathon, and marathon builds.

### 节奏跑 / 马拉松配速跑

- Purpose: race-specific rhythm, efficiency, pacing confidence.
- Dose: 20-60 minutes total at target effort depending on level.
- Pace/HR: marathon pace or half-marathon pace depending on target race; upper COROS Z2-Z3 for marathon pace when available.
- Use: after base is stable; do not force it during poor recovery.

### 间歇跑

- Purpose: VO2max, speed tolerance, 5K/10K ability.
- Dose: examples include 5 x 3 min, 6 x 800 m, 5 x 1 km with easy jog recovery.
- Pace/HR: 5K-10K pace; Z4-Z5 eventually, but use pace/RPE because HR lags.
- Use: more in 5K/10K blocks; sparingly in marathon blocks.

### 法特莱克跑

- Purpose: introduce intensity flexibly without track precision.
- Dose: examples include 10 x 1 min fast/1 min easy, 6 x 2 min fast/2 min easy, or 30-45 min rolling surges.
- Pace/HR: fast segments around 5K-10K effort or controlled strong effort; recover fully enough to keep form.
- Use: base-to-intensity transition after the runner has already established easy mileage, or in the intensity-development phase. Do not use hard fartlek in the first week of an aerobic base phase for recreational runners. If a base-phase fartlek is explicitly needed, keep it playful and sub-threshold, such as 6-8 x 20-30 sec relaxed pickups within an otherwise easy run.

### 上坡跑

- Purpose: strength endurance, mechanics, power.
- Dose: short hill sprints 6-10 x 8-12 sec or longer hill reps 6-8 x 45-90 sec.
- Pace/HR: by effort, not pace. Short hills require full recovery.
- Use: avoid hard downhill impact and avoid during calf/Achilles flare-ups.

### 短时间冲刺跑

- Purpose: neuromuscular sharpness and form.
- Dose: 4-8 x 15-20 sec after an easy run, full walk/jog recovery.
- Pace/HR: smooth fast, not all-out; if pace is needed, use roughly 5K pace to mile effort depending on the runner, but prioritize relaxed form. HR is not useful because the repetition is too short.
- Use: healthy legs only; skip after long/hard days or poor sleep.

## Strength and Cross-Training Defaults

- Ask during intake whether the user wants cross-training, and which modes are available or preferred: cycling, swimming, elliptical, rowing, walking, yoga/pilates, or gym strength.
- Include at least 1 weekly strength or cross-training session in most complete plans unless the user lacks time, is tapering, is injured, or explicitly declines.
- Strength sessions should support running: hips/glutes, hamstrings, calves, feet, trunk, and single-leg control.
- Base/build phases: usually 1-2 strength sessions weekly. Taper/race week: remove heavy lower-body strength and keep only light activation if needed.
- Cross-training should usually replace or supplement easy aerobic work, not replace the key long run or all running-specific work.
