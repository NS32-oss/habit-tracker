import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: {
      type: String,
      default: 'general',
    },
    labels: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: '#a78bfa', // default purple
    },
    dueDate: {
      type: Date,
      default: null,
    },
    dueTime: {
      type: String, // HH:mm format
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    recurring: {
      enabled: {
        type: Boolean,
        default: false,
      },
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        default: 'daily',
      },
      days: {
        type: [Number], // 0-6 for days of week
        default: [],
      },
      frequency: {
        type: Number,
        default: 1, // repeat every N days/weeks/months
      },
    },
    subtasks: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      },
    ],
    reminders: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        time: String, // HH:mm format or relative like "30m before"
        notified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
    notes: {
      type: [
        {
          _id: mongoose.Schema.Types.ObjectId,
          content: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    section: {
      type: String,
      default: 'inbox',
    },
    order: {
      type: Number,
      default: 0,
    },
    attachments: {
      type: [String], // URLs or file paths
      default: [],
    },
    activityLog: [
      {
        action: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index for common queries
taskSchema.index({ userId: 1, completed: 1 })
taskSchema.index({ userId: 1, dueDate: 1 })
taskSchema.index({ userId: 1, priority: 1 })
taskSchema.index({ userId: 1, archived: 1 })
taskSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Task', taskSchema)
