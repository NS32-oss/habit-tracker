import HabitLog from '../models/HabitLog.js';
import Habit from '../models/Habit.js';
import Streak from '../models/Streak.js';
import DayNote from '../models/DayNote.js';
import dayjs from 'dayjs';

// ✅ FIX #18: Validate allowed periods server-side
const VALID_PERIODS = [7, 14, 30, 60, 90];

const validatePeriod = (period) => {
  const p = parseInt(period);
  return VALID_PERIODS.includes(p) ? p : null;
};

// ✅ FIX #9: Split dashboard stats into two endpoints

// Get summary analytics (historical)
export const getDashboardSummary = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = validatePeriod(period);

    if (!periodDays) {
      return res.status(400).json({ error: 'Invalid period. Allowed: 7, 14, 30, 60, 90' });
    }

    // Get date range
    const now = dayjs();
    const startStr = now.subtract(periodDays - 1, 'days').format('YYYY-MM-DD');
    const endStr = now.format('YYYY-MM-DD');

    // Get all user's active habits
    const habits = await Habit.find({ userId: req.userId, isActive: true });

    // Get logs for the period
    const logs = await HabitLog.find({
      habitId: { $in: habits.map((h) => h._id) },
      date: { $gte: startStr, $lte: endStr },
    });

    // Calculate completion rate
    const completedCount = logs.filter((l) => l.completed).length;
    const completionRate = logs.length > 0 ? Math.round((completedCount / logs.length) * 100) : 0;

    // Calculate daily average
    const dailyAverage = (completedCount / periodDays).toFixed(1);

    // Get longest streak
    const streaks = await Streak.find({ userId: req.userId });
    const longestStreak = streaks.length > 0 ? Math.max(...streaks.map((s) => s.maxCount || 0)) : 0;

    res.json({
      completionRate,
      dailyAverage,
      longestStreak,
      totalHabits: habits.length,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ FIX #9: Get today's specific stats
export const getTodayStats = async (req, res, next) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');

    // Get all user's active habits
    const habits = await Habit.find({ userId: req.userId, isActive: true });

    // Get today's logs
    const todayLogs = await HabitLog.find({
      userId: req.userId,
      date: today,
    });

    // Count how many are scheduled for today
    const todayLogsCompleted = todayLogs.filter((l) => l.completed).length;

    // Calculate total scheduled for today
    const totalScheduledToday = habits.filter((h) => {
      const dayOfWeek = dayjs().day();
      return h.frequency === 'daily' || h.customDays.includes(dayOfWeek);
    }).length;

    const completionPercentage = totalScheduledToday > 0 ? Math.round((todayLogsCompleted / totalScheduledToday) * 100) : 0;

    res.json({
      completedCount: todayLogsCompleted,
      totalScheduled: totalScheduledToday,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

export const getHabitAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;

    // ✅ FIX #18: Validate period server-side
    const validPeriod = validatePeriod(period);
    if (!validPeriod) {
      return res.status(400).json({ error: 'Invalid period. Must be one of: 7, 14, 30, 60, 90' });
    }

    const now = dayjs();
    const startStr = now.subtract(validPeriod - 1, 'days').format('YYYY-MM-DD');
    const endStr = now.format('YYYY-MM-DD');

    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const logs = await HabitLog.find({
      habitId: habit._id,
      date: { $gte: startStr, $lte: endStr },
    }).sort('date');

    const completed = logs.filter((l) => l.completed).length;
    const completionRate = validPeriod > 0 ? Math.round((completed / validPeriod) * 100) : 0;

    // Generate calendar data
    const calendarData = {};
    for (let i = 0; i < validPeriod; i++) {
      const date = now.subtract(validPeriod - 1 - i, 'days');
      const dateStr = date.format('YYYY-MM-DD');
      const log = logs.find((l) => dayjs(l.date).format('YYYY-MM-DD') === dateStr);

      calendarData[dateStr] = {
        completed: log?.completed || false,
        mood: log?.mood || 'none',
        notes: log?.notes || '',
      };
    }

    const streak = await Streak.findOne({
      habitId: habit._id,
      userId: req.userId,
    });

    res.json({
      habit: {
        id: habit._id,
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
      },
      period: validPeriod,
      stats: {
        completionRate,
        completed,
        total: validPeriod,
        currentStreak: streak?.currentCount || 0,
        longestStreak: streak?.maxCount || 0,
        milestones: streak?.milestones || [],
      },
      calendarData,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

const isScheduledForDay = (habit, dayNumber) => {
  if (habit.frequency === 'daily') return true;
  return habit.customDays.includes(dayNumber);
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = validatePeriod(period) || 30;

    const habits = await Habit.find({ userId: req.userId, isActive: true });

    // Date range (string dates)
    const end = dayjs();
    const start = end.subtract(periodDays - 1, 'days');
    const startStr = start.format('YYYY-MM-DD');
    const endStr = end.format('YYYY-MM-DD');

    // Fetch logs and day notes in range
    const [logs, dayNotes] = await Promise.all([
      HabitLog.find({
        userId: req.userId,
        habitId: { $in: habits.map((h) => h._id) },
        date: { $gte: startStr, $lte: endStr },
      }),
      DayNote.find({
        userId: req.userId,
        date: { $gte: startStr, $lte: endStr },
      }),
    ]);

    // Build maps for quick lookup
    const habitMeta = new Map(habits.map((h) => [String(h._id), { name: h.name, emoji: h.emoji }]));
    const logsByHabit = new Map();
    const logsByDate = new Map();
    const notesByDate = new Map(dayNotes.map((n) => [n.date, n.note]));

    habits.forEach((h) => logsByHabit.set(String(h._id), []));
    logs.forEach((l) => {
      const habitKey = String(l.habitId);
      if (!logsByHabit.has(habitKey)) logsByHabit.set(habitKey, []);
      logsByHabit.get(habitKey).push(l);

      if (!logsByDate.has(l.date)) logsByDate.set(l.date, []);
      logsByDate.get(l.date).push(l);
    });

    // Summary
    const totalLogged = logs.filter((l) => l.completed).length;
    const totalScheduled = (() => {
      let count = 0;
      for (let i = 0; i < periodDays; i++) {
        const d = start.add(i, 'day');
        const dow = d.day();
        habits.forEach((h) => {
          if (isScheduledForDay(h, dow)) count += 1;
        });
      }
      return count;
    })();

    const completionRate = totalScheduled > 0 ? Math.round((totalLogged / totalScheduled) * 100) : 0;

    const summary = {
      completionRate,
      totalLogged,
      habitsCount: habits.length,
      longestStreak: 0, // updated below
    };

    // Weekly (actually per-day) activity for period
    const weeklyData = [];
    for (let i = 0; i < periodDays; i++) {
      const d = start.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const dow = d.day();
      let dayTotal = 0;
      let dayCompleted = 0;
      const dayLogs = logsByDate.get(dateStr) || [];
      habits.forEach((h) => {
        if (isScheduledForDay(h, dow)) {
          dayTotal += 1;
          const logsForHabit = logsByHabit.get(String(h._id)) || [];
          if (logsForHabit.some((l) => l.date === dateStr && l.completed)) {
            dayCompleted += 1;
          }
        }
      });

      const dayNotes = dayLogs
        .filter((l) => (l.notes || '').trim().length > 0)
        .map((l) => {
          const meta = habitMeta.get(String(l.habitId)) || {};
          return {
            habitId: String(l.habitId),
            habitName: meta.name || 'Habit',
            habitEmoji: meta.emoji || '📝',
            note: l.notes,
          };
        });

      weeklyData.push({
        date: dateStr,
        completed: dayCompleted,
        total: dayTotal,
        notes: dayNotes,
        generalNote: notesByDate.get(dateStr) || '',
      });
    }

    // Habit performance
    const habitsPerformance = habits.map((h) => {
      const lgs = logsByHabit.get(String(h._id)) || [];
      let completed = 0;
      let scheduled = 0;
      for (let i = 0; i < periodDays; i++) {
        const d = start.add(i, 'day');
        const dateStr = d.format('YYYY-MM-DD');
        const dow = d.day();
        if (isScheduledForDay(h, dow)) {
          scheduled += 1;
          if (lgs.some((l) => l.date === dateStr && l.completed)) completed += 1;
        }
      }
      const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
      return {
        id: h._id,
        name: h.name,
        emoji: h.emoji,
        completed,
        total: scheduled,
        rate,
      };
    });

    // Longest streak via cached streaks collection
    const streaks = await Streak.find({ userId: req.userId });
    summary.longestStreak = streaks.length > 0 ? Math.max(...streaks.map((s) => s.maxCount || 0)) : 0;

    // Today block for backwards compatibility
    const todayStr = dayjs().format('YYYY-MM-DD');
    const todayLogs = logs.filter((l) => l.date === todayStr && l.completed).length;
    const todayScheduled = habits.filter((h) => isScheduledForDay(h, dayjs().day())).length;
    const todayRate = todayScheduled > 0 ? Math.round((todayLogs / todayScheduled) * 100) : 0;

    res.json({
      summary,
      weeklyData,
      habits: habitsPerformance,
      todayCompletion: {
        completed: todayLogs,
        total: todayScheduled,
        rate: todayRate,
      },
      activeHabits: habits.length,
      avgStreak: streaks.length > 0
        ? Math.round(streaks.reduce((acc, s) => acc + (s.currentCount || 0), 0) / streaks.length)
        : 0,
      catMood: undefined, // not needed here
    });
  } catch (error) {
    next(error);
  }
};
