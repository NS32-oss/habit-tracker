import Streak from '../models/Streak.js';
import HabitLog from '../models/HabitLog.js';
import Habit from '../models/Habit.js';
import { calculateStreak, getLast30Days } from '../utils/dateHelpers.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

// ✅ FIX #5: Corrected streak calculation logic
export async function calculateCorrectStreak(habitId, userId) {
  const habit = await Habit.findById(habitId);
  const logs = await HabitLog.find({ habitId, userId }).sort({ date: -1 }).lean();

  // Create log map for O(1) lookup
  const logMap = new Map(logs.map(log => [log.date, log.completed]));

  let streak = 0;
  let date = dayjs.utc().startOf('day');

  // Iterate day-by-day backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = date.format('YYYY-MM-DD');
    const dayOfWeek = date.day(); // 0=Sun, 6=Sat

    // Check if this day is scheduled for this habit
    const isScheduled =
      habit.frequency === 'daily' ? true : habit.customDays.includes(dayOfWeek);

    if (!isScheduled) {
      // Skip non-scheduled day (don't break streak)
      date = date.subtract(1, 'day');
      continue;
    }

    // This is a scheduled day
    const completed = logMap.get(dateStr) ?? false;

    if (completed) {
      streak++;
    } else {
      // Scheduled day not completed → break streak
      break;
    }

    date = date.subtract(1, 'day');
  }

  return streak;
}

export const getStreak = async (req, res, next) => {
  try {
    const streak = await Streak.findOne({
      habitId: req.params.id,
      userId: req.userId,
    });

    if (!streak) {
      return res.status(404).json({ message: 'Streak not found' });
    }

    res.json(streak);
  } catch (error) {
    next(error);
  }
};

export const updateStreak = async (req, res, next) => {
  try {
    const habitId = req.params.id;
    const userId = req.userId;

    // ✅ FIX #5: Use corrected streak calculation
    const currentStreak = await calculateCorrectStreak(habitId, userId);

    // Get habit to update stats
    const habit = await Habit.findById(habitId);
    if (habit) {
      habit.currentStreak = currentStreak;
      if (currentStreak > habit.longestStreak) {
        habit.longestStreak = currentStreak;
      }
      await habit.save();
    }

    // Update streak record
    let streak = await Streak.findOne({ habitId });
    if (!streak) {
      streak = new Streak({ habitId, userId });
    }

    streak.currentCount = currentStreak;
    if (currentStreak > streak.maxCount) {
      streak.maxCount = currentStreak;
    }

    // Add milestone if reached
    const milestones = [7, 14, 21, 30, 60, 90, 100, 365];
    for (const milestone of milestones) {
      if (currentStreak === milestone) {
        if (!streak.milestones.find((m) => m.count === milestone)) {
          streak.milestones.push({
            count: milestone,
            achievedDate: new Date(),
            milestone: `${milestone} days!`,
          });
        }
      }
    }

    await streak.save();

    res.json(streak);
  } catch (error) {
    next(error);
  }
};

export const getAllStreaks = async (req, res, next) => {
  try {
    const streaks = await Streak.find({ userId: req.userId })
      .populate('habitId')
      .sort({ lastCompletedDate: -1, updatedAt: -1 });

    res.json(streaks);
  } catch (error) {
    next(error);
  }
};
