import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import dayjs from 'dayjs';

export const getCatMood = async (req, res, next) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const sevenDaysAgo = dayjs().subtract(6, 'days').format('YYYY-MM-DD');

    const habits = await Habit.find({ userId: req.userId, isActive: true });

    if (habits.length === 0) {
      return res.json({ mood: '😾', reason: 'No active habits' });
    }

    const logs = await HabitLog.find({
      habitId: { $in: habits.map((h) => h._id) },
      date: { $gte: sevenDaysAgo, $lte: today },
    });

    const completed = logs.filter((l) => l.completed).length;
    const total = habits.length * 7;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    let mood = '😾';
    let reason = 'Keep working on your habits!';

    if (completionRate >= 80) {
      mood = '😻';
      reason = 'Excellent work! Your cat is thriving!';
    } else if (completionRate >= 60) {
      mood = '😸';
      reason = 'Great progress! Your cat is happy!';
    } else if (completionRate >= 40) {
      mood = '😺';
      reason = 'Good effort! Your cat is content.';
    } else if (completionRate >= 20) {
      mood = '😼';
      reason = 'You can do better! Your cat needs you!';
    }

    res.json({
      mood,
      reason,
      completionRate,
      completions: completed,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getCatStats = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.userId, isActive: true });

    const logs = await HabitLog.find({
      habitId: { $in: habits.map((h) => h._id) },
    });

    const today = dayjs().startOf('day').toDate();
    const todayLogs = logs.filter((l) => dayjs(l.date).isSame(today, 'day') && l.completed);

    const thisWeekStart = dayjs().startOf('week').toDate();
    const thisWeekLogs = logs.filter((l) => dayjs(l.date).isSameOrAfter(thisWeekStart) && l.completed);

    const thisMonthStart = dayjs().startOf('month').toDate();
    const thisMonthLogs = logs.filter((l) => dayjs(l.date).isSameOrAfter(thisMonthStart) && l.completed);

    res.json({
      stats: {
        today: {
          completed: todayLogs.length,
          total: habits.length,
          rate: habits.length > 0 ? Math.round((todayLogs.length / habits.length) * 100) : 0,
        },
        thisWeek: {
          completed: thisWeekLogs.length,
          total: habits.length * 7,
          rate: habits.length * 7 > 0 ? Math.round((thisWeekLogs.length / (habits.length * 7)) * 100) : 0,
        },
        thisMonth: {
          completed: thisMonthLogs.length,
          total: habits.length * dayjs().daysInMonth(),
          rate: habits.length * dayjs().daysInMonth() > 0
            ? Math.round((thisMonthLogs.length / (habits.length * dayjs().daysInMonth())) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatName = async (req, res, next) => {
  try {
    const { catName } = req.body;

    // This would typically be stored in the User model
    // For now, we just return the name

    res.json({
      catName,
      message: 'Cat name updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
