import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a challenge name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    durationDays: {
      type: Number,
      required: [true, 'Please provide challenge duration in days'],
      min: 1,
      max: 365,
    },
    startDate: {
      type: Date,
      default: () => new Date(new Date().toISOString()), // ✅ FIX #17: UTC server time
    },
    endDate: {
      type: Date,
      required: true,
      // Calculated as: new Date(new Date().toISOString()) + durationDays
    },
    completedDaysCount: {
      type: Number,
      default: 0, // ✅ FIX #10: Explicit count of days completed
    },
    expectedDaysCount: {
      type: Number,
      default: 0, // ✅ FIX #10: Expected completions (duration for daily)
    },
    lastToggleDate: {
      type: String, // ✅ FIX #11: YYYY-MM-DD to prevent double-counting same day
      default: null,
    },
    targetCompletions: {
      type: Number,
      required: true,
    },
    actualCompletions: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed', 'paused'],
      default: 'active',
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for queries
challengeSchema.index({ userId: 1 });
challengeSchema.index({ userId: 1, status: 1 });
challengeSchema.index({ habitId: 1 });

export default mongoose.model('Challenge', challengeSchema);
