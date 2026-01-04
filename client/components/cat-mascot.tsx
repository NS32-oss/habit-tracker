'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

interface CatMascotProps {
  completionRate: number
  totalHabits?: number
  completedHabits?: number
  message?: string
}

export function CatMascot({ completionRate, totalHabits = 0, completedHabits = 0, message }: CatMascotProps) {
  const [catMood, setCatMood] = useState('😸')
  const [catMessage, setCatMessage] = useState('')

  // Progressive mood thresholds based on per-habit completion (e.g., 5 habits = 20% steps)
  const progressiveRate = useMemo(() => {
    if (!totalHabits) return completionRate
    const perHabitStep = 100 / totalHabits
    return Math.min(100, Math.round(completedHabits * perHabitStep))
  }, [totalHabits, completedHabits, completionRate])

  // ✅ FIX #20: Calculate mood only from active habits (backend filters by isActive: true)
  useEffect(() => {
    const rate = progressiveRate
    if (rate >= 80) {
      setCatMood('😻')
      setCatMessage(message || 'Purr-fect! You\'re doing amazing!')
    } else if (rate >= 60) {
      setCatMood('😸')
      setCatMessage(message || 'Great work! Keep it up!')
    } else if (rate >= 40) {
      setCatMood('😺')
      setCatMessage(message || 'Good effort! You can do it!')
    } else if (rate >= 20) {
      setCatMood('😼')
      setCatMessage(message || 'Meow... I believe in you!')
    } else {
      setCatMood('😾')
      setCatMessage(message || 'Let\'s get started today!')
    }
  }, [progressiveRate, message])

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 text-center"
    >
      <motion.div
        className="text-8xl mb-4"
        animate={{
          rotate: [0, 5, -5, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        {catMood}
      </motion.div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        Your Cat Companion
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{catMessage}</p>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Happiness</span>
          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {completionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className="bg-linear-to-r from-purple-500 to-pink-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
