import Challenge from '../models/Challenge.js';
import HabitLog from '../models/HabitLog.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

// Helper: Prevent double-counting on same day (Fix #11)
// Only increment completedDaysCount if toggle is on a different day than lastToggleDate
async function incrementChallengeProgress(challengeId, userId) {
  try {
    const challenge = await Challenge.findOne({
      _id: challengeId,
      userId,
    });

    if (!challenge) {
      return null;
    }

    const today = dayjs.utc().format('YYYY-MM-DD');

    // Only increment if:
    // 1. lastToggleDate doesn't exist (first time), OR
    // 2. lastToggleDate is not today
    if (!challenge.lastToggleDate || challenge.lastToggleDate !== today) {
      challenge.completedDaysCount = (challenge.completedDaysCount || 0) + 1;
      challenge.lastToggleDate = today;
    }

    // Update completion percentage
    if (challenge.expectedDaysCount > 0) {
      challenge.completionRate = Math.round(
        (challenge.completedDaysCount / challenge.expectedDaysCount) * 100
      );
    }

    // Auto-complete if target reached
    if (
      challenge.completedDaysCount >= challenge.expectedDaysCount &&
      challenge.status === 'active'
    ) {
      challenge.status = 'completed';
    }

    // Auto-fail if period ended
    if (dayjs().isAfter(challenge.endDate) && challenge.status === 'active') {
      challenge.status = 'failed';
    }

    await challenge.save();
    return challenge;
  } catch (error) {
    console.error('Error incrementing challenge progress:', error);
    throw error;
  }
}

export { incrementChallengeProgress };

export const createChallenge = async (req, res, next) => {
  try {
    const { habitId, name, description, durationDays, targetCompletions } = req.body;

    const endDate = dayjs().add(durationDays, 'days').toDate();

    const challenge = new Challenge({
      userId: req.userId,
      habitId,
      name,
      description,
      durationDays,
      startDate: new Date(),
      endDate,
      targetCompletions,
    });

    await challenge.save();

    res.status(201).json(challenge);
  } catch (error) {
    next(error);
  }
};

export const getChallenges = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { userId: req.userId };
    if (status) {
      query.status = status;
    }

    const challenges = await Challenge.find(query).populate('habitId').sort('-createdAt');

    res.json(challenges);
  } catch (error) {
    next(error);
  }
};

export const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('habitId');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

export const updateChallenge = async (req, res, next) => {
  try {
    const { status, actualCompletions } = req.body;

    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (actualCompletions !== undefined) {
      challenge.actualCompletions = actualCompletions;
      challenge.completionRate = Math.min(
        Math.round((actualCompletions / challenge.targetCompletions) * 100),
        100
      );
    }

    if (status) {
      challenge.status = status;
    }

    await challenge.save();

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

export const deleteChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateChallengeProgress = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Count unique days with completions in the challenge period
    const logs = await HabitLog.find({
      habitId: challenge.habitId,
      completed: true,
      date: {
        $gte: dayjs(challenge.startDate).utc().format('YYYY-MM-DD'),
        $lte: dayjs(challenge.endDate).utc().format('YYYY-MM-DD'),
      },
    });

    // Get unique days count (Fix #10: use completedDaysCount)
    const uniqueDays = new Set(logs.map(log => log.date)).size;
    challenge.completedDaysCount = uniqueDays;

    // Update completion percentage based on expectedDaysCount (Fix #10)
    if (challenge.expectedDaysCount && challenge.expectedDaysCount > 0) {
      challenge.completionRate = Math.round(
        (challenge.completedDaysCount / challenge.expectedDaysCount) * 100
      );
    }

    // Auto-complete if target reached
    if (
      challenge.completedDaysCount >= challenge.expectedDaysCount &&
      challenge.status === 'active'
    ) {
      challenge.status = 'completed';
    }

    // Auto-fail if period ended
    if (dayjs().isAfter(challenge.endDate) && challenge.status === 'active') {
      challenge.status = 'failed';
    }

    await challenge.save();

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};
