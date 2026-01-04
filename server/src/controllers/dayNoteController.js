import dayjs from 'dayjs'
import DayNote from '../models/DayNote.js'

export const upsertNote = async (req, res, next) => {
  try {
    const { date, note } = req.body
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Expected YYYY-MM-DD.' })
    }

    const trimmed = (note || '').trim()
    if (!trimmed) {
      // Empty note => remove existing note for the day
      await DayNote.findOneAndDelete({ userId: req.userId, date })
      return res.json({ date, note: '' })
    }

    const saved = await DayNote.findOneAndUpdate(
      { userId: req.userId, date },
      { note: trimmed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.json({ date: saved.date, note: saved.note })
  } catch (error) {
    next(error)
  }
}

export const getNotesInRange = async (req, res, next) => {
  try {
    const { start, end } = req.query
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end are required (YYYY-MM-DD).' })
    }

    const startDate = dayjs(start)
    const endDate = dayjs(end)

    if (!startDate.isValid() || !endDate.isValid() || endDate.isBefore(startDate)) {
      return res.status(400).json({ message: 'Invalid date range.' })
    }

    const notes = await DayNote.find({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 })

    res.json(notes.map((n) => ({ date: n.date, note: n.note })))
  } catch (error) {
    next(error)
  }
}
