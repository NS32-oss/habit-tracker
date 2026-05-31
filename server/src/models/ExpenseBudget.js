import mongoose from 'mongoose'

const expenseBudgetSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'custom'],
      default: 'monthly',
    },
    category: {
      type: String,
      default: 'all',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 1,
      max: 100,
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
    active: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

expenseBudgetSchema.index({ userId: 1, active: 1 })
expenseBudgetSchema.index({ userId: 1, category: 1 })

export default mongoose.model('ExpenseBudget', expenseBudgetSchema)
