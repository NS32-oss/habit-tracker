import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import utc from "dayjs/plugin/utc";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(weekday);
dayjs.extend(utc);

export function getDateRangeArray(startDate: Date | string, endDate: Date | string): string[] {
  const dates: string[] = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isSameOrBefore(end, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }

  return dates;
}

export function getLast7Days(): string[] {
  const today = dayjs();
  const startDate = today.subtract(6, "day");
  return getDateRangeArray(startDate.toDate(), today.toDate());
}

export function getLast14Days(): string[] {
  const today = dayjs();
  const startDate = today.subtract(13, "day");
  return getDateRangeArray(startDate.toDate(), today.toDate());
}

export function getLast30Days(): string[] {
  const today = dayjs();
  const startDate = today.subtract(29, "day");
  return getDateRangeArray(startDate.toDate(), today.toDate());
}

export function getLast60Days(): string[] {
  const today = dayjs();
  const startDate = today.subtract(59, "day");
  return getDateRangeArray(startDate.toDate(), today.toDate());
}

export function getLastNDays(n: number): string[] {
  const today = dayjs();
  const startDate = today.subtract(n - 1, "day");
  return getDateRangeArray(startDate.toDate(), today.toDate());
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return dayjs(date1).isSame(dayjs(date2), "day");
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

export function isTomorrow(date: Date | string): boolean {
  const tomorrow = dayjs().add(1, "day");
  return isSameDay(date, tomorrow.toDate());
}

export function isYesterday(date: Date | string): boolean {
  const yesterday = dayjs().subtract(1, "day");
  return isSameDay(date, yesterday.toDate());
}

export function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const sortedDates = completedDates
    .map((date) => dayjs(date))
    .sort((a, b) => b.valueOf() - a.valueOf());

  let streak = 0;
  let currentDate = dayjs();

  if (!sortedDates[0].isSame(currentDate, "day")) {
    currentDate = currentDate.subtract(1, "day");
    if (!sortedDates[0].isSame(currentDate, "day")) {
      return 0;
    }
  }

  for (const completedDate of sortedDates) {
    if (completedDate.isSame(currentDate, "day")) {
      streak++;
      currentDate = currentDate.subtract(1, "day");
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const sortedDates = completedDates
    .map((date) => dayjs(date))
    .sort((a, b) => a.valueOf() - b.valueOf());

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = sortedDates[i].diff(sortedDates[i - 1], "day");

    if (daysDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (daysDiff > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

export function getCalendarDays(year: number, month: number): Dayjs[] {
  const firstDay = dayjs().year(year).month(month).date(1);
  const lastDay = firstDay.endOf("month");
  
  const startDate = firstDay.weekday(0);
  const endDate = lastDay.weekday(6);

  const days: Dayjs[] = [];
  let current = startDate;

  while (current.isSameOrBefore(endDate)) {
    days.push(current);
    current = current.add(1, "day");
  }

  return days;
}

export function getCurrentMonthDays(): Dayjs[] {
  const now = dayjs();
  return getCalendarDays(now.year(), now.month());
}

export function getWeekDays(date?: Date | string): Dayjs[] {
  const baseDate = date ? dayjs(date) : dayjs();
  const startOfWeek = baseDate.weekday(0);
  
  const days: Dayjs[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(startOfWeek.add(i, "day"));
  }
  
  return days;
}

export function formatRelativeDate(date: Date | string): string {
  const d = dayjs(date);
  const today = dayjs();
  const diffDays = today.diff(d, "day");

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < -1 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;
  
  return d.format("MMM D, YYYY");
}

export function getHeatmapData(completedDates: string[], days: number = 60): { date: string; count: number }[] {
  const dates = getLastNDays(days);
  const completedSet = new Set(completedDates);

  return dates.map((date) => ({
    date,
    count: completedSet.has(date) ? 1 : 0,
  }));
}

export function getWeekNumber(date: Date | string): number {
  const d = dayjs(date);
  // Use ISO week number calculation
  const startOfYear = d.startOf('year');
  const diff = d.diff(startOfYear, 'day');
  return Math.ceil((diff + 1) / 7);
}

export function getDaysInMonth(year: number, month: number): number {
  return dayjs().year(year).month(month).daysInMonth();
}

export function isDateInRange(date: Date | string, start: Date | string, end: Date | string): boolean {
  return dayjs(date).isBetween(start, end, "day", "[]");
}

export function getStartOfWeek(date?: Date | string): Dayjs {
  return (date ? dayjs(date) : dayjs()).weekday(0).startOf("day");
}

export function getEndOfWeek(date?: Date | string): Dayjs {
  return (date ? dayjs(date) : dayjs()).weekday(6).endOf("day");
}

export function getStartOfMonth(date?: Date | string): Dayjs {
  return (date ? dayjs(date) : dayjs()).startOf("month");
}

export function getEndOfMonth(date?: Date | string): Dayjs {
  return (date ? dayjs(date) : dayjs()).endOf("month");
}
