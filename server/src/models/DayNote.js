import mongoose from 'mongoose';

const dayNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

dayNoteSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.model('DayNote', dayNoteSchema)
