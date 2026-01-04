import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentCount: {
      type: Number,
      default: 0,
    },
    maxCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
    milestones: [
      {
        count: Number,
        achievedDate: Date,
        milestone: String, // e.g., "7 days", "30 days", "100 days"
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
streakSchema.index({ habitId: 1 });
streakSchema.index({ userId: 1 });

export default mongoose.model('Streak', streakSchema);
