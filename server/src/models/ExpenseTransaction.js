import mongoose from 'mongoose'

const recurringSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: 'monthly',
    },
    interval: { type: Number, default: 1, min: 1 },
    paused: { type: Boolean, default: false },
    skipNext: { type: Boolean, default: false },
    nextRunDate: { type: Date, default: null },
  },
  { _id: false }
)

const expenseTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      default: '',
    },
    merchant: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'Other',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      default: '',
    },
    recurring: {
      type: recurringSchema,
      default: () => ({}),
    },
    attachments: {
      type: [String],
      default: [],
    },
    receiptImage: {
      type: String,
      default: '',
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
    duplicatedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseTransaction',
      default: null,
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

expenseTransactionSchema.index({ userId: 1, date: -1 })
expenseTransactionSchema.index({ userId: 1, category: 1 })
expenseTransactionSchema.index({ userId: 1, merchant: 1 })
expenseTransactionSchema.index({ userId: 1, archived: 1, type: 1 })
expenseTransactionSchema.index({ userId: 1, amount: -1 })

export default mongoose.model('ExpenseTransaction', expenseTransactionSchema)
