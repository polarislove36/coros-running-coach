# Visual Schedule Output

Use this reference when the user asks for a training-plan image, shareable card, visual schedule, poster, PNG, or picture output.

## Core Rule

For schedule images with dates, paces, heart-rate ranges, exercises, and weekly mileage, prefer deterministic rendering:

1. Generate an HTML/CSS or SVG table from the final plan data.
2. Render it to PNG using the available browser/screenshot workflow.
3. Keep the image text exactly aligned with the text plan.

Do not rely on AI image generation for dense text tables. Image models can distort Chinese text, dates, paces, and numbers.

Use image generation only for optional decorative backgrounds, covers, or non-critical illustration where exact text is not required.

## Default Image Formats

- Weekly card: 1600 x 900.
- Multi-week plan: one image per week, or a long vertical image if the user asks for one.
- Mobile share format: 1080 x 1920.
- Keep background clean and high-contrast; training data readability is more important than decoration.

## Required Content

Each weekly image should include:

- Week heading: `第 1 周｜有氧能力建设基础期｜周跑量36km`.
- Date with weekday.
- Training item.
- Reference pace / reference heart rate.
- Purpose.
- Strength rows with exact exercises, sets, reps, and intensity.
- A small footer if needed: `心率区间基于 COROS 分区/历史训练推断`.

Do not include the per-row weekly-mileage column; weekly mileage belongs in the week heading.

## Design Guidance

- Use restrained colors and clear typography.
- Avoid busy backgrounds behind table text.
- Use section labels for phases and weeks.
- Use compact but readable rows; do not let Chinese text overflow.
- For rest days, use plain purpose text: `恢复` or `休息`.
- If generating several weekly cards, keep the same layout and only change week color accents.

## Output Workflow

When the user asks for both text and image:

1. Generate or confirm the text plan first.
2. Produce image assets from the confirmed plan.
3. If an image is generated locally, show the final PNG path or embed it in the response when the app supports local image rendering.

When the user asks only for a visual:

1. Still internally build the structured plan first.
2. Render the plan as image.
3. Include a short note that the image is generated from the structured plan.
