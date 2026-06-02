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
    <div className="w-full rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-800 sm:p-4">
      <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={goToPrevious}
          className="rounded-xl bg-gray-100 p-2 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <svg
            className="h-4 w-4 text-gray-700 dark:text-gray-300 sm:h-5 sm:w-5"
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
            className="text-base font-semibold text-gray-800 dark:text-white sm:text-lg"
          >
            {isToday ? 'Today' : dayjs(selectedDate).format('MMM D, YYYY')}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            {dayjs(selectedDate).format('dddd')}
          </p>
        </div>

        <button
          onClick={goToNext}
          disabled={isFuture}
          className="rounded-xl bg-gray-100 p-2 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg
            className="h-4 w-4 text-gray-700 dark:text-gray-300 sm:h-5 sm:w-5"
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
          className="mt-3 w-full rounded-xl bg-purple-100 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
        >
          Jump to Today
        </motion.button>
      )}
    </div>
  )
}
