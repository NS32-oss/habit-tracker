'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { habitAPI } from '@/lib/api'
import dayjs from 'dayjs'

export function GridView() {
  const [habits, setHabits] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [logs, setLogs] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    try {
      const habitsData = await habitAPI.getAll()
      setHabits(habitsData)
      
      const logsData: any = {}
      for (const habit of habitsData) {
        const habitLogs = await habitAPI.getLogs(
          habit._id,
          dayjs(selectedMonth).startOf('month').format('YYYY-MM-DD'),
          dayjs(selectedMonth).endOf('month').format('YYYY-MM-DD')
        )
        logsData[habit._id] = habitLogs
      }
      setLogs(logsData)
    } catch (error) {
      console.error('Failed to load grid data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const start = dayjs(selectedMonth).startOf('month')
    const end = dayjs(selectedMonth).endOf('month')
    const days = []
    let current = start
    
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      days.push(current.toDate())
      current = current.add(1, 'day')
    }
    
    return days
  }

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    return logs[habitId]?.some((log: any) => 
      dayjs(log.date).format('YYYY-MM-DD') === dateStr && log.completed
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📅</div>
          <p className="text-gray-500">Loading grid view...</p>
        </div>
      </div>
    )
  }

  const days = getDaysInMonth()

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Grid View
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMonth(dayjs(selectedMonth).subtract(1, 'month').toDate())}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ←
            </button>
            <span className="font-semibold text-gray-800 dark:text-white px-4">
              {dayjs(selectedMonth).format('MMMM YYYY')}
            </span>
            <button
              onClick={() => setSelectedMonth(dayjs(selectedMonth).add(1, 'month').toDate())}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={dayjs(selectedMonth).add(1, 'month').isAfter(dayjs(), 'month')}
            >
              →
            </button>
          </div>
        </motion.div>

        {habits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No habits to display
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create some habits to see them in grid view
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {habits.map((habit) => (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-1 h-10 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="text-3xl">{habit.emoji}</span>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {habit.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {day}
                    </div>
                  ))}
                  
                  {/* Fill in empty cells for the first week */}
                  {Array.from({ length: dayjs(selectedMonth).startOf('month').day() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  
                  {days.map((day) => {
                    const completed = isCompleted(habit._id, day)
                    const isToday = dayjs(day).isSame(dayjs(), 'day')
                    const isFuture = dayjs(day).isAfter(dayjs(), 'day')
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`h-16 rounded-md flex items-center justify-center text-xs font-semibold ${
                          isFuture
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600'
                            : completed
                            ? 'text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        } ${isToday ? 'ring-2 ring-purple-500' : ''}`}
                        style={{
                          backgroundColor: completed ? habit.color : undefined
                        }}
                      >
                        {dayjs(day).date()}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
