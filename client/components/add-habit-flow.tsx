'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { habitAPI } from '@/lib/api'

interface AddHabitFlowProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const emojiOptions = ['🎯', '💪', '📚', '🏃', '💧', '🧘', '🎨', '🎵', '✍️', '🌱']
const colorOptions = [
  '#d8b4fe', // purple
  '#fbbf24', // amber
  '#60a5fa', // blue
  '#f472b6', // pink
  '#34d399', // green
  '#fb923c', // orange
]

export function AddHabitFlow({ isOpen, onClose, onSuccess }: AddHabitFlowProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [color, setColor] = useState('#d8b4fe')
  const [frequency, setFrequency] = useState<'daily' | 'custom'>('daily')
  const [customDays, setCustomDays] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [existingColors, setExistingColors] = useState<string[]>([])
  useEffect(() => {
    if (!isOpen) return
    const fetchColors = async () => {
      try {
        const habits = await habitAPI.getAll()
        const used = habits?.map((h: any) => h.color).filter(Boolean) || []
        setExistingColors(used)
        setColor(pickColor(used))
      } catch (error) {
        setColor(pickColor([]))
      }
    }
    fetchColors()
  }, [isOpen])

  const pickColor = (used: string[]) => {
    const available = colorOptions.find((c) => !used.includes(c))
    if (available) return available
    return colorOptions[used.length % colorOptions.length]
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await habitAPI.create({
        name,
        emoji,
        color,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined,
      })
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Failed to create habit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setName('')
    setEmoji('🎯')
    setColor(pickColor(existingColors))
    setFrequency('daily')
    setCustomDays([])
    onClose()
  }

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Create New Habit
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded ${
                    step >= s ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Meditation"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Choose Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                        emoji === e
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Frequency
                </label>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setFrequency('daily')}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      frequency === 'daily'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setFrequency('custom')}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      frequency === 'custom'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {frequency === 'custom' && (
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, i) => (
                      <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        className={`py-2 rounded-lg text-sm font-medium ${
                          customDays.includes(i)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || (frequency === 'custom' && customDays.length === 0)}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
