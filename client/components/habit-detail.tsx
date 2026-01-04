'use client'

import { useState, useEffect, JSX } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { habitAPI, analyticsAPI } from '@/lib/api'
import dayjs from 'dayjs'

interface HabitDetailProps {
  habitId: string | null
  isOpen: boolean
  onClose: () => void
  onSelectDate?: (date: Date) => void
}

export function HabitDetail({ habitId, isOpen, onClose, onSelectDate }: HabitDetailProps) {
  const [habit, setHabit] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [monthLogs, setMonthLogs] = useState<any[]>([])

  useEffect(() => {
    if (habitId && isOpen) {
      loadHabitDetails()
    }
  }, [habitId, isOpen, selectedMonth])

  const loadHabitDetails = async () => {
    if (!habitId) return
    setLoading(true)
    try {
      const start = dayjs(selectedMonth).startOf('month').format('YYYY-MM-DD')
      const end = dayjs(selectedMonth).endOf('month').format('YYYY-MM-DD')
      const [habitData, analyticsData] = await Promise.all([
        habitAPI.getById(habitId),
        analyticsAPI.getHabitAnalytics(habitId, 30),
      ])
      setHabit(habitData)
      setAnalytics(analyticsData)
      const logsData = await habitAPI.getLogs(habitId, start, end)
      setMonthLogs(logsData || [])
    } catch (error) {
      console.error('Failed to load habit details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !habitId) return null

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 pb-10"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white z-50">
              Habit Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">📊</div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : habit && analytics ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{habit.emoji}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{habit.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 capitalize">{habit.frequency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.stats?.currentStreak || 0} 🔥
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.stats?.longestStreak || 0} ⭐
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Monthly View</h4>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <button
                      onClick={() => setSelectedMonth(dayjs(selectedMonth).subtract(1, 'month').toDate())}
                      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      ←
                    </button>
                    <span className="min-w-30 text-center">{dayjs(selectedMonth).format('MMMM YYYY')}</span>
                    <button
                      onClick={() => setSelectedMonth(dayjs(selectedMonth).add(1, 'month').toDate())}
                      disabled={dayjs(selectedMonth).isAfter(dayjs(), 'month')}
                      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-center font-semibold py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const startOfMonth = dayjs(selectedMonth).startOf('month')
                    const daysInMonth = startOfMonth.daysInMonth()
                    const startDay = startOfMonth.day()
                    const monthKey = startOfMonth.format('YYYY-MM')
                    const logsMap = new Map(
                      (monthLogs || []).map((log: any) => [dayjs(log.date).format('YYYY-MM-DD'), log])
                    )

                    const cells = [] as JSX.Element[]

                    for (let i = 0; i < startDay; i++) {
                      cells.push(<div key={`${monthKey}-empty-${i}`} />)
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = startOfMonth.date(day).format('YYYY-MM-DD')
                      const log = logsMap.get(dateStr)
                      const isFuture = dayjs(dateStr).isAfter(dayjs(), 'day')
                      const isToday = dayjs(dateStr).isSame(dayjs(), 'day')
                      const completed = !!log?.completed

                      cells.push(
                        <div
                          key={dateStr}
                          onClick={() => {
                            const selectedDateObj = dayjs(dateStr).toDate()
                            // Update parent's selected date
                            if (onSelectDate) {
                              onSelectDate(selectedDateObj)
                            }
                            // Close the habit detail modal when opening journal
                            setTimeout(() => {
                              onClose()
                            }, 100)
                          }}
                          className={`h-12 rounded-md border text-center flex flex-col items-center justify-center text-[11px] font-semibold transition-all relative cursor-pointer hover:shadow-md ${
                            completed
                              ? 'text-white'
                              : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                          } ${isToday ? 'ring-2 ring-purple-500' : 'border-transparent'}`}
                          style={{ backgroundColor: completed ? habit.color : undefined }}
                          title={dayjs(dateStr).format('MMM D')}
                        >
                          <span>{day}</span>
                          {log?.notes && (
                            <span className="text-xs absolute top-0.5 right-0.5">✉️</span>
                          )}
                        </div>
                      )
                    }

                    // Fill remaining cells to complete the grid
                    const totalCells = cells.length
                    const remainingCells = (7 - (totalCells % 7)) % 7
                    for (let i = 0; i < remainingCells; i++) {
                      cells.push(<div key={`${monthKey}-padding-${i}`} />)
                    }

                    return cells
                  })()}
                </div>
              </div>

              {analytics.stats?.milestones && analytics.stats.milestones.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                    Milestones 🎉
                  </h4>
                  <div className="space-y-2">
                    {analytics.stats.milestones.map((milestone: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3"
                      >
                        <span className="font-medium text-gray-800 dark:text-white">
                          {milestone.milestone}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {dayjs(milestone.achievedDate).format('MMM D, YYYY')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
    </>
  )
}
