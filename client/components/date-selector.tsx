'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false)

  const goToToday = () => {
    onDateChange(new Date())
  }

  const goToPrevious = () => {
    onDateChange(dayjs(selectedDate).subtract(1, 'day').toDate())
  }

  const goToNext = () => {
    const tomorrow = dayjs(selectedDate).add(1, 'day')
    if (tomorrow.isBefore(dayjs(), 'day') || tomorrow.isSame(dayjs(), 'day')) {
      onDateChange(tomorrow.toDate())
    }
  }

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day')
  const isFuture = dayjs(selectedDate).isAfter(dayjs(), 'day')

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 w-full">
        <button
          onClick={goToPrevious}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="font-semibold text-lg text-gray-800 dark:text-white"
          >
            {isToday ? 'Today' : dayjs(selectedDate).format('MMM D, YYYY')}
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {dayjs(selectedDate).format('dddd')}
          </p>
        </div>

        <button
          onClick={goToNext}
          disabled={isFuture}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!isToday && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={goToToday}
          className="mt-3 w-full py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          Jump to Today
        </motion.button>
      )}
    </div>
  )
}
