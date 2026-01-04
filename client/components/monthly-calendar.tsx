'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { motion, AnimatePresence } from 'framer-motion'

dayjs.extend(utc)

// Funny emoji options for incomplete/future days
const EMOJI_OPTIONS = ['😅', '😴', '🙈', '🤷', '😎', '💪', '🚀', '🎯', '🔥', '✨', '😤', '💯', '🎉', '🏆']

interface DayData {
  date: string
  completed: number
  total: number
  emoji?: string
}

interface MonthlyCalendarProps {
  month: Date
  onMonthChange: (date: Date) => void
  daysData: DayData[]
  onDayClick: (date: string) => void
  onEmojiSelect?: (date: string, emoji: string) => void
}

export function MonthlyCalendar({
  month,
  onMonthChange,
  daysData,
  onDayClick,
  onEmojiSelect,
}: MonthlyCalendarProps) {
  const [selectedEmojiDay, setSelectedEmojiDay] = useState<string | null>(null)

  const firstDay = dayjs(month).startOf('month')
  const lastDay = dayjs(month).endOf('month')
  const daysInMonth = lastDay.date()
  const startingDayOfWeek = firstDay.day()

  // Create day data map for quick lookup
  const dataMap = new Map(daysData.map(d => [d.date, d]))

  const getDayInfo = (day: number) => {
    const date = dayjs(month).date(day).format('YYYY-MM-DD')
    return dataMap.get(date)
  }

  const getCompletionColor = (rate: number) => {
    if (rate === 0) return 'bg-gray-100 dark:bg-gray-700'
    if (rate < 30) return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
    if (rate < 50) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
    if (rate < 70) return 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700'
    if (rate < 90) return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
    return 'bg-emerald-200 dark:bg-emerald-900/60 border-emerald-400 dark:border-emerald-600'
  }

  const getMood = (rate: number) => {
    if (rate >= 80) return '😻'
    if (rate >= 60) return '😸'
    if (rate >= 40) return '😺'
    if (rate >= 20) return '😼'
    return '😾'
  }

  const isFutureDay = (day: number) => {
    const dateToCheck = dayjs(month).date(day)
    return dateToCheck.isAfter(dayjs(), 'day')
  }

  const isToday = (day: number) => {
    const dateToCheck = dayjs(month).date(day)
    return dateToCheck.isSame(dayjs(), 'day')
  }

  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {dayjs(month).format('MMMM YYYY')}
        </h2>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMonthChange(dayjs(month).subtract(1, 'month').toDate())}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ←
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMonthChange(dayjs(month).add(1, 'month').toDate())}
            disabled={dayjs(month).isAfter(dayjs(), 'month')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </motion.button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status:</span>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Struggle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-orange-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Not great</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-amber-300" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Mixed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Victory!</span>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const dayData = getDayInfo(day)
          const rate = dayData && dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0
          const mood = getMood(rate)
          const isFuture = isFutureDay(day)
          const dateStr = dayjs(month).date(day).format('YYYY-MM-DD')
          const showEmojiPicker = selectedEmojiDay === dateStr

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.02 }}
              className="relative group"
            >
              <AnimatePresence>
                {showEmojiPicker && isFuture && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-700 rounded-lg shadow-xl p-2 z-50 border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex gap-1">
                      {EMOJI_OPTIONS.map(emoji => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            onEmojiSelect?.(dateStr, emoji)
                            setSelectedEmojiDay(null)
                          }}
                          className="text-lg p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors cursor-pointer"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: isFuture ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isFuture) {
                    setSelectedEmojiDay(showEmojiPicker ? null : dateStr)
                  } else {
                    onDayClick(dateStr)
                  }
                }}
                className={`
                  w-full aspect-square rounded-lg border-2 transition-all
                  flex flex-col items-center justify-center gap-1
                  ${getCompletionColor(rate)}
                  ${isToday(day) ? 'ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-gray-800' : ''}
                  ${isFuture ? 'cursor-pointer hover:scale-105' : 'cursor-pointer hover:shadow-md'}
                  relative
                `}
                title={isFuture ? 'Click to set future vibe' : `${dayData?.completed || 0}/${dayData?.total || 0} completed`}
              >
                {/* Day number */}
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {day}
                </span>

                {/* Mood/Emoji */}
                {isFuture && dayData?.emoji ? (
                  <span className="text-lg">{dayData.emoji}</span>
                ) : (
                  <span className="text-lg">{mood}</span>
                )}

                {/* Completion rate */}
                {dayData && !isFuture && (
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                    {dayData.completed}/{dayData.total}
                  </span>
                )}

                {/* Future day indicator */}
                {isFuture && !dayData?.emoji && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Set</span>
                )}

                {/* Today indicator */}
                {isToday(day) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* Info text */}
      <div className="mt-6 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
        <p className="text-xs text-purple-800 dark:text-purple-200">
          💡 <strong>Tip:</strong> Click past days to see details. Click future days to set a fun emoji vibe! 😄
        </p>
      </div>
    </div>
  )
}
