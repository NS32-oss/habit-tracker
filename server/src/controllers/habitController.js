import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import Streak from '../models/Streak.js';
import Challenge from '../models/Challenge.js';
import { incrementChallengeProgress } from './challengeController.js';
import { calculateCorrectStreak } from './streakController.js';
import { getLast30Days } from '../utils/dateHelpers.js';
import dayjs from 'dayjs';

export const createHabit = async (req, res, next) => {
  try {
    const { name, description, emoji, color, frequency, customDays, targetPerWeek } = req.body;

    // ✅ FIX #8: Check for duplicate habit name per user
    const existing = await Habit.findOne({ userId: req.userId, name });
    if (existing) {
      return res.status(409).json({
        message: 'Habit with this name already exists for your account'
      });
    }

    const habit = new Habit({
      userId: req.userId,
      name,
      description,
      emoji,
      color,
      frequency,
      customDays,
      targetPerWeek,
    });

    await habit.save();

    // Create streak record
    await Streak.create({
      habitId: habit._id,
      userId: req.userId,
    });

    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

export const getHabits = async (req, res, next) => {
  try {
    const { isActive, date } = req.query;

    const query = { userId: req.userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const targetDate = dayjs(date || undefined).isValid()
      ? dayjs(date).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');

    const habits = await Habit.find(query).sort('-createdAt');
    
    // Include completion status for the requested date
    const habitsWithStatus = await Promise.all(
      habits.map(async (habit) => {
        const log = await HabitLog.findOne({
          habitId: habit._id,
          userId: req.userId,
          date: targetDate,
        });
        
        return {
          ...habit.toObject(),
          isCompletedForDate: log?.completed ?? false,
        };
      })
    );

    res.json(habitsWithStatus);
  } catch (error) {
    next(error);
  }
};

export const getHabitById = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req, res, next) => {
  try {
    const { name, description, emoji, color, frequency, customDays, targetPerWeek, isActive } = req.body;

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(emoji && { emoji }),
        ...(color && { color }),
        ...(frequency && { frequency }),
        ...(customDays && { customDays }),
        ...(targetPerWeek && { targetPerWeek }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Clean up related data
    await HabitLog.deleteMany({ habitId: habit._id });
    await Streak.deleteMany({ habitId: habit._id });

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getHabitLogs = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { habitId: req.params.id };

    if (startDate && endDate) {
      const startStr = dayjs(startDate).format('YYYY-MM-DD');
      const endStr = dayjs(endDate).format('YYYY-MM-DD');
      query.date = {
        $gte: startStr,
        $lte: endStr,
      };
    } else {
      // Default to last 30 days (string dates)
      const today = dayjs();
      const startStr = today.subtract(29, 'days').format('YYYY-MM-DD');
      const endStr = today.format('YYYY-MM-DD');
      query.date = { $gte: startStr, $lte: endStr };
    }

    const logs = await HabitLog.find(query).sort('date');

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const toggleHabitLog = async (req, res, next) => {
  try {
    const { date } = req.body;
    const habitId = req.params.id;

    // Get habit to check frequency
    const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // ✅ FIX #7: Use local YYYY-MM-DD string to avoid timezone shifts
    const normalizedDate = dayjs(date).format('YYYY-MM-DD');
    const dayOfWeek = dayjs(date).day(); // 0=Sun, 6=Sat

    // ✅ FIX #4: Validate if day is scheduled for this habit
    let isScheduled = false;
    if (habit.frequency === 'daily') {
      isScheduled = true;
    } else if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
      isScheduled = habit.customDays.includes(dayOfWeek);
    }

    if (!isScheduled) {
      return res.status(400).json({ error: 'Habit not scheduled for this day' });
    }

    let log = await HabitLog.findOne({
      habitId,
      userId: req.userId,
      date: normalizedDate,
    });

    if (log) {
      log.completed = !log.completed;
      await log.save();
    } else {
      log = new HabitLog({
        habitId,
        userId: req.userId,
        date: normalizedDate,
        completed: true,
      });
      await log.save();
    }

    // ✅ FIX #11: Update progress for active challenges with this habit
    // Prevent double-counting by checking lastToggleDate
    if (log.completed) {
      const activeChallenges = await Challenge.find({
        habitId,
        userId: req.userId,
        status: 'active',
      });

      for (const challenge of activeChallenges) {
        try {
          await incrementChallengeProgress(challenge._id, req.userId);
        } catch (error) {
          // Don't fail the habit toggle if challenge update fails
        }
      }
    }

    // ✅ Recalculate streaks and update cache docs
    const currentStreak = await calculateCorrectStreak(habitId, req.userId);

    // Recompute longest streak from logs so unticking can reduce it
    const allLogs = await HabitLog.find({ habitId, userId: req.userId })
      .sort({ date: 1 })
      .lean();

    const completionMap = new Map(allLogs.map((l) => [l.date, l.completed]));
    const earliest = allLogs.length > 0 ? dayjs(allLogs[0].date) : dayjs(normalizedDate);
    const today = dayjs();

    let longest = 0;
    let rolling = 0;
    for (let d = earliest; d.isSame(today, 'day') || d.isBefore(today, 'day'); d = d.add(1, 'day')) {
      const dow = d.day();
      const scheduled = habit.frequency === 'daily' ? true : habit.customDays.includes(dow);
      if (!scheduled) continue; // skip unscheduled days without breaking streak

      const completed = completionMap.get(d.format('YYYY-MM-DD')) ?? false;
      if (completed) {
        rolling += 1;
        if (rolling > longest) longest = rolling;
      } else {
        rolling = 0;
      }
    }

    // Update habit streak stats and total completions (recount for accuracy)
    if (habit) {
      const totalCompletions = await HabitLog.countDocuments({
        habitId,
        userId: req.userId,
        completed: true,
      });

      habit.currentStreak = currentStreak;
      habit.longestStreak = longest;
      habit.totalCompletions = totalCompletions;
      await habit.save();
    }

    // Update streak collection cache
    let streakDoc = await Streak.findOne({ habitId, userId: req.userId });
    if (!streakDoc) {
      streakDoc = new Streak({ habitId, userId: req.userId });
    }
    streakDoc.currentCount = currentStreak;
    streakDoc.maxCount = longest;
    const lastCompleted = allLogs.filter((l) => l.completed).map((l) => l.date).pop();
    if (lastCompleted) {
      streakDoc.lastCompletedDate = dayjs(lastCompleted).toDate();
    }
    await streakDoc.save();

    console.log(`✅ TOGGLE RESPONSE: Sending log`, log);
    res.json(log);
  } catch (error) {
    next(error);
  }
};

export const updateHabitLog = async (req, res, next) => {
  try {
    const { date, completed, notes, mood } = req.body;
    
    console.log('[updateHabitLog] Request body:', { date, completed, notes, mood });
    console.log('[updateHabitLog] Notes param exists:', notes !== undefined, 'Value:', notes);

    // Normalize to YYYY-MM-DD string to match schema and analytics joins
    const dateStr = dayjs(date || new Date()).format('YYYY-MM-DD');

    let log = await HabitLog.findOne({
      habitId: req.params.id,
      userId: req.userId,
      date: dateStr,
    });

    if (!log) {
      log = new HabitLog({
        habitId: req.params.id,
        userId: req.userId,
        date: dateStr,
      });
    }

    console.log('[updateHabitLog] Log before updates:', { completed: log.completed, notes: log.notes, mood: log.mood });

    if (completed !== undefined) log.completed = completed;
    if (notes !== undefined) log.notes = notes;
    if (mood !== undefined) log.mood = mood;

    console.log('[updateHabitLog] Log after updates:', { completed: log.completed, notes: log.notes, mood: log.mood });

    await log.save();
    
    console.log('[updateHabitLog] Log after save:', { _id: log._id, completed: log.completed, notes: log.notes, mood: log.mood });
    console.log('[updateHabitLog] Sending response:', JSON.stringify(log.toObject(), null, 2));

    res.json(log);
  } catch (error) {
    next(error);
  }
};
