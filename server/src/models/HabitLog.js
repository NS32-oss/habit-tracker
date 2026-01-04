import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema(
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
    date: {
      type: String, // ✅ FIX #6, #7: YYYY-MM-DD format (UTC normalized, never raw Date)
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/, // Enforce format
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    mood: {
      type: String,
      enum: ['😍', '😊', '😐', '😕', '😢', 'none'],
      default: 'none',
    },
  },
  { timestamps: true }
);

// ✅ FIX #10: Enforce uniqueness at schema level with compound unique index
// Ensures only one log entry per habit per day
habitLogSchema.index({ habitId: 1, userId: 1, date: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, date: 1 });
habitLogSchema.index({ habitId: 1, completed: 1 });

export default mongoose.model('HabitLog', habitLogSchema);
