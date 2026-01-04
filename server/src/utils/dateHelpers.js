import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getStartOfDay = (date = new Date()) => {
  return dayjs(date).startOf('day').toDate();
};

export const getEndOfDay = (date = new Date()) => {
  return dayjs(date).endOf('day').toDate();
};

export const getLast30Days = () => {
  const today = dayjs();
  const past30 = today.subtract(29, 'days');
  return {
    start: past30.startOf('day').toDate(),
    end: today.endOf('day').toDate(),
  };
};

export const calculateStreak = (logs) => {
  if (logs.length === 0) return 0;

  let streak = 0;
  let currentDate = dayjs();

  // Sort logs by date descending
  const sortedLogs = logs
    .filter((log) => log.completed)
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));

  for (const log of sortedLogs) {
    const logDate = dayjs(log.date);
    if (currentDate.diff(logDate, 'day') === 1) {
      streak++;
      currentDate = logDate;
    } else if (currentDate.isSame(logDate, 'day')) {
      continue;
    } else {
      break;
    }
  }

  return streak;
};

export const getWeekStart = (date = new Date()) => {
  return dayjs(date).startOf('week').toDate();
};

export const getWeekEnd = (date = new Date()) => {
  return dayjs(date).endOf('week').toDate();
};

export const getMonthDays = (date = new Date()) => {
  const year = dayjs(date).year();
  const month = dayjs(date).month();
  const daysInMonth = dayjs(date).daysInMonth();
  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(dayjs(`${year}-${month + 1}-${i}`).toDate());
  }

  return days;
};
