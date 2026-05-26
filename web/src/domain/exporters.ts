import type { TrainingDay } from "./types";

const csvHeaders = ["日期", "周几", "训练项目", "参考配速", "参考心率", "训练目的"];

export function createTrainingCsv(days: TrainingDay[]): string {
  const rows = days.map((day) => [
    day.date,
    day.weekday,
    day.session,
    day.pace,
    day.heartRate,
    day.purpose
  ]);

  return [csvHeaders, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function createTrainingIcs(days: TrainingDay[], calendarName: string): string {
  const events = days.map((day) => {
    const date = compactDate(day.date);
    const description = escapeIcsText(`${day.session}\n配速：${day.pace}\n心率：${day.heartRate}\n目的：${day.purpose}`);

    return [
      "BEGIN:VEVENT",
      `UID:${date}-${slugify(day.title)}@coros-running-coach`,
      `DTSTAMP:${date}T000000Z`,
      `DTSTART;VALUE=DATE:${date}`,
      `SUMMARY:${escapeIcsText(`${calendarName} - ${day.title}`)}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT"
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//COROS Running Coach//Web MVP//CN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

function escapeCsvCell(value: string): string {
  if (!/[",\n\r，]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function compactDate(date: string): string {
  return date.replaceAll("-", "");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function slugify(value: string): string {
  return encodeURIComponent(value).replace(/%/g, "").toLowerCase();
}
