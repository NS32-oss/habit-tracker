import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a habit name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    emoji: {
      type: String,
      default: '🎯',
    },
    color: {
      type: String,
      default: '#d8b4fe', // pastel purple
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    customDays: {
      type: [Number], // 0-6 for days of week (0=Sunday)
      default: [],
    },
    targetPerWeek: {
      type: Number,
      default: 7, // for custom frequency
      min: 1,
      max: 7,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    skipNonScheduledDays: {
      type: Boolean,
      default: true, // ✅ FIX #4: Streaks ignore unscheduled days
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for faster queries
habitSchema.index({ userId: 1 });
habitSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('Habit', habitSchema);
