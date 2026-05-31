import mongoose from 'mongoose'

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
    icon: {
      type: String,
      default: '🎯',
    },
    color: {
      type: String,
      default: '#10b981',
    },
    milestones: {
      type: [Number],
      default: [25, 50, 75, 100],
    },
    archived: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

savingsGoalSchema.index({ userId: 1, archived: 1 })

export default mongoose.model('SavingsGoal', savingsGoalSchema)
