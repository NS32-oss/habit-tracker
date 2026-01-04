'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { habitAPI } from '@/lib/api'
import dayjs from 'dayjs'

// Get reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function JourneyView() {
  const [habits, setHabits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // API returns precomputed stats: currentStreak, longestStreak, totalCompletions
      const habitsData = await habitAPI.getAll()
      setHabits(habitsData)
      setError(null)
    } catch (error) {
      console.error('Failed to load journey data:', error)
      setError('Failed to load your journey. Please refresh the page to retry.')
    } finally {
      setLoading(false)
    }
  }

  // All possible milestones in order (the journey path)
  const MILESTONE_PATH = [
    { days: 7, label: 'First Week', icon: '🌱' },
    { days: 14, label: 'Two Weeks', icon: '🌿' },
    { days: 21, label: 'Three Weeks', icon: '🍀' },
    { days: 30, label: 'One Month', icon: '🌾' },
    { days: 60, label: 'Two Months', icon: '🌳' },
    { days: 90, label: 'Three Months', icon: '🎋' },
    { days: 100, label: 'Century', icon: '🏆' },
  ]

  const getMilestoneProgress = (habit: any) => {
    return MILESTONE_PATH.map((milestone) => ({
      ...milestone,
      unlocked: habit.currentStreak >= milestone.days,
      isNext: habit.currentStreak < milestone.days && 
              MILESTONE_PATH.every(m => m.days <= milestone.days || habit.currentStreak >= m.days),
      daysUntil: Math.max(0, milestone.days - habit.currentStreak),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🗺️</div>
          <p className="text-gray-500">Loading your journey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion() ? 0 : 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Your Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track milestones and achievements on your habit journey
          </p>
        </motion.div>

        {habits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg shadow-purple-200/40 dark:shadow-none">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Start your journey
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create habits to track your progress and milestones
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {habits.map((habit, index) => {
              const milestoneProgress = getMilestoneProgress(habit)
              const nextUnlockedIndex = milestoneProgress.findIndex(m => m.isNext)
              const nextMilestone = nextUnlockedIndex >= 0 ? milestoneProgress[nextUnlockedIndex] : null

              return (
                <motion.div
                  key={habit._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion() ? 0 : index * 0.05 }}
                  className="relative rounded-2xl border border-purple-200/60 dark:border-purple-800/50 bg-white/70 dark:bg-gray-900/60 backdrop-blur shadow-lg shadow-purple-200/40 dark:shadow-black/20 p-6 overflow-hidden"
                  role="article"
                  aria-label={`Habit: ${habit.name} with ${habit.currentStreak} day current streak`}
                >
                  {/* Streak indicator bar at top */}
                  <div 
                    className="absolute top-0 left-0 h-1 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 rounded-tl-2xl" 
                    style={{
                      width: `${Math.min(100, (habit.currentStreak / 100) * 100)}%`,
                      opacity: habit.currentStreak > 0 ? 1 : 0.3,
                      zIndex: 10,
                      borderTopRightRadius: habit.currentStreak >= 100 ? '1rem' : '0'
                    }}
                  />
                  
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-3xl shrink-0"
                      role="img"
                      aria-label={`${habit.name} icon`}
                    >
                      {habit.emoji}
                    </div>
                    <div className="flex-1 min-w-62.5">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{habit.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description || 'No description provided'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{habit.currentStreak}</p>
                      <p className="text-xs text-gray-500">day streak 🔥</p>
                    </div>
                  </div>

                  {/* Journey Timeline - All milestones as a path */}
                  <div className="mb-6 relative overflow-x-auto pb-2">
                    <div className="flex items-center justify-between gap-2 h-24 relative min-w-150">
                      {milestoneProgress.map((milestone, idx) => {
                        const isUnlocked = milestone.unlocked
                        const isNext = milestone.isNext
                        
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-center group relative">
                            {/* Connecting line */}
                            {idx < milestoneProgress.length - 1 && (
                              <div 
                                className={`absolute h-1 left-1/2 top-5 ${
                                  isUnlocked ? 'bg-linear-to-r from-purple-500 to-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                                style={{ width: 'calc(100% + 8px)' }}
                              />
                            )}
                            
                            {/* Milestone node */}
                            <motion.div
                              animate={{
                                scale: isNext ? [1, 1.1, 1] : 1,
                                filter: isNext ? ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] : 'brightness(1)',
                              }}
                              transition={{ duration: 2, repeat: isNext ? Infinity : 0 }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold relative z-10 ${
                                isUnlocked
                                  ? 'bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                  : isNext
                                  ? 'bg-blue-500 text-white border-2 border-blue-300 shadow-lg shadow-blue-500/30'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                              }`}
                              role="img"
                              aria-label={`${milestone.label} - ${
                                isUnlocked ? 'Unlocked' : isNext ? `${milestone.daysUntil} days away` : 'Locked'
                              }`}
                            >
                              {milestone.icon}
                            </motion.div>
                            
                            {/* Label */}
                            <p className="text-xs font-semibold mt-2 text-center text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
                              {milestone.days}d
                            </p>
                            
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition z-20 pointer-events-none">
                              <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {milestone.label}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Stats and next milestone info */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Longest</p>
                      <p className="text-lg font-bold text-amber-500">{habit.longestStreak}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Completions</p>
                      <p className="text-lg font-bold text-green-500">{habit.totalCompletions || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Started</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{dayjs(habit.startDate).format('MMM D')}</p>
                    </div>
                  </div>

                  {/* Next milestone callout */}
                  {nextMilestone && !nextMilestone.unlocked && (
                    <div className="mt-4 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        🎯 {nextMilestone.daysUntil} {nextMilestone.daysUntil === 1 ? 'day' : 'days'} to {nextMilestone.label}!
                      </p>
                    </div>
                  )}

                  {habit.currentStreak >= 100 && (
                    <div className="mt-4 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-bold text-center text-amber-900 dark:text-amber-200">
                        ✨ LEGENDARY STATUS ✨
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
