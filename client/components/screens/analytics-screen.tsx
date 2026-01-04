'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { analyticsAPI } from '@/lib/api'
import dayjs from 'dayjs'

export function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [period, setPeriod] = useState(30)
  const [customDays, setCustomDays] = useState(30)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getAnalytics(period)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const summary = analytics?.summary ?? {}
  const today = analytics?.todayCompletion ?? {}
  const completionRate = summary.completionRate ?? 0
  const totalLogged = summary.totalLogged ?? 0
  const activeHabits = summary.habitsCount ?? analytics?.activeHabits ?? 0
  const longestStreak = summary.longestStreak ?? 0
  const avgStreak = analytics?.avgStreak ?? 0
  const todayRate = today.rate ?? 0
  const todayCompleted = today.completed ?? 0
  const todayTotal = today.total ?? 0
  const habitsPerformance = analytics?.habits ?? []
  const dailyActivity = (analytics?.weeklyData ?? []).slice().reverse()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and insights
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={showCustomInput ? 'custom' : period}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomInput(true)
                } else {
                  setShowCustomInput(false)
                  setPeriod(Number(e.target.value))
                }
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={21}>Last 21 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value="custom">Custom days</option>
            </select>
            {showCustomInput && (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Days"
                />
                <button
                  onClick={() => {
                    if (customDays >= 1 && customDays <= 365) {
                      setPeriod(customDays)
                      setShowCustomInput(false)
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {analytics && (
          <>
            <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {completionRate}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Today</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {todayRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {todayCompleted}/{todayTotal} completed
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {totalLogged}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Habits</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {activeHabits}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Streaks</p>
                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {longestStreak} 🔥
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg: {avgStreak}</p>
              </motion.div>
            </div>

            {habitsPerformance.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Habits Performance
                </h3>
                <div className="space-y-4">
                  {habitsPerformance.map((habit: any, i: number) => {
                    const calculatedRate = period > 0 ? Math.round((habit.completed / period) * 100) : 0
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-3xl">{habit.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {habit.name}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {habit.completed}/{period} days
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-linear-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all"
                              style={{ width: `${Math.min(calculatedRate, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-lg font-bold text-gray-800 dark:text-white w-12 text-right">
                          {calculatedRate}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6"
            >
              <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
                Daily Activity
              </h3>
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {dailyActivity.map((day: any, i: number) => {
                  const rate = day.total > 0 ? (day.completed / day.total) * 100 : 0
                  const bgColor = rate === 0
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : rate < 30
                      ? 'bg-red-400/90 dark:bg-red-500/70'
                      : rate < 50
                        ? 'bg-orange-400/90 dark:bg-orange-500/70'
                        : rate < 70
                          ? 'bg-amber-400/90 dark:bg-amber-400/70'
                          : rate < 90
                            ? 'bg-emerald-400/90 dark:bg-emerald-500/70'
                            : 'bg-emerald-500 dark:bg-emerald-600'
                  
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 md:gap-2">
                      <div 
                        className={`h-14 md:h-20 w-full rounded-lg ${bgColor} flex flex-col items-center justify-center transition-all hover:scale-105 shadow-sm`}
                        title={`${day.completed}/${day.total} completed`}
                      >
                        <span className="text-sm md:text-lg font-bold text-white">{Math.round(rate)}%</span>
                        <span className="text-[8px] md:text-[10px] font-semibold text-white/80 mt-0.5 md:mt-1">
                          {day.completed}/{day.total}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {dayjs(day.date).format('MMM D')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
