import type { TransferSchedule, TransferScheduleException } from "@/types/transfer-schedule";

export const MALDIVES_TIME_ZONE = "Indian/Maldives";

function maldivesParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MALDIVES_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value("weekday"));
  return { date: `${value("year")}-${value("month")}-${value("day")}`, weekday, minutes: Number(value("hour")) * 60 + Number(value("minute")) };
}

function addDays(date: string, count: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + count));
  return next.toISOString().slice(0, 10);
}

function weekdayForDate(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

function effective(schedule: TransferSchedule, date: string) {
  return (!schedule.effectiveStart || date >= schedule.effectiveStart) && (!schedule.effectiveEnd || date <= schedule.effectiveEnd);
}

function departureForDate(schedule: TransferSchedule, date: string): { time: string; exception?: TransferScheduleException } | null {
  const exception = schedule.exceptions.find((item) => item.date === date);
  if (exception?.cancelled) return null;
  if (!schedule.daysOfWeek.includes(weekdayForDate(date)) || !effective(schedule, date)) return null;
  return { time: exception?.departureTime || schedule.departureTime, exception };
}

function applicableSchedules(schedules: TransferSchedule[], date: string) {
  const weekday = weekdayForDate(date);
  const eligible = schedules.filter((schedule) => schedule.active && schedule.daysOfWeek.includes(weekday) && effective(schedule, date));
  if (weekday !== 5) return eligible;
  const fridayDirections = new Set(eligible.filter((schedule) => schedule.fridaySpecific).map((schedule) => schedule.direction));
  return eligible.filter((schedule) => schedule.fridaySpecific || !fridayDirections.has(schedule.direction));
}

export function nextTransferDeparture(schedules: TransferSchedule[], now = new Date()) {
  const current = maldivesParts(now);
  for (let offset = 0; offset <= 14; offset += 1) {
    const date = addDays(current.date, offset);
    const seen = new Set<string>();
    const departures = applicableSchedules(schedules, date).flatMap((schedule) => {
      const departure = departureForDate(schedule, date);
      if (!departure) return [];
      const [hour, minute] = departure.time.split(":").map(Number);
      if (offset === 0 && hour * 60 + minute <= current.minutes) return [];
      const time = departure.time.slice(0, 5);
      const key = `${schedule.direction}|${time}`;
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ schedule, date, time, notice: departure.exception?.notice }];
    }).sort((a, b) => a.time.localeCompare(b.time));
    if (departures[0]) return departures[0];
  }
  return undefined;
}

export function weeklyTimetable(schedules: TransferSchedule[]) {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    departures: (() => {
      const eligible = schedules.filter((schedule) => schedule.active && schedule.daysOfWeek.includes(day));
      const fridayDirections = day === 5 ? new Set(eligible.filter((schedule) => schedule.fridaySpecific).map((schedule) => schedule.direction)) : new Set<string>();
      const seen = new Set<string>();
      return eligible.filter((schedule) => schedule.fridaySpecific || !fridayDirections.has(schedule.direction)).sort((a, b) => a.departureTime.localeCompare(b.departureTime)).filter((schedule) => {
        const key = `${schedule.direction}|${schedule.departureTime.slice(0, 5)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })()
  }));
}
