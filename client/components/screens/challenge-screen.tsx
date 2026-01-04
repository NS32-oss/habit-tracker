'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { challengeAPI, habitAPI } from '@/lib/api'
import dayjs from 'dayjs'

export function ChallengeScreen() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    habitId: '',
    name: '',
    description: '',
    durationDays: 30,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [challengesData, habitsData] = await Promise.all([
        challengeAPI.getAll(),
        habitAPI.getAll(),
      ])
      setChallenges(challengesData)
      setHabits(habitsData)
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await challengeAPI.create({
        ...formData,
        targetCompletions: formData.durationDays,
      })
      setShowCreate(false)
      setFormData({ habitId: '', name: '', description: '', durationDays: 30 })
      loadData()
    } catch (error) {
      console.error('Failed to create challenge:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'paused': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <p className="text-gray-500">Loading challenges...</p>
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
              Challenges
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set goals and track your progress
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            + New Challenge
          </button>
        </motion.div>

        {challenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No challenges yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create a challenge to push yourself further!
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600"
            >
              Create Your First Challenge
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const habit = habits.find((h) => h._id === challenge.habitId)
              const daysLeft = dayjs(challenge.endDate).diff(dayjs(), 'days')
              const progress = (challenge.actualCompletions / challenge.targetCompletions) * 100
              
              return (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{habit?.emoji || '🎯'}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {challenge.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {habit?.name || 'Unknown habit'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(challenge.status)}`}>
                      {challenge.status}
                    </span>
                  </div>

                  {challenge.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {challenge.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {challenge.actualCompletions}/{challenge.targetCompletions}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-linear-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Challenge ended'}
                      </span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Create Challenge
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Select Habit
                  </label>
                  <select
                    value={formData.habitId}
                    onChange={(e) => setFormData({ ...formData, habitId: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a habit...</option>
                    {habits.map((habit) => (
                      <option key={habit._id} value={habit._id}>
                        {habit.emoji} {habit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Challenge Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 30 Day Challenge"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Duration (days)
                  </label>
                  <select
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={21}>21 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="What's this challenge about?"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
