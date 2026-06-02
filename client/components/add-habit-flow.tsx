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
  '#34d399', // greenn
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
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] bg-white p-4 dark:bg-gray-800 sm:max-h-[90vh] sm:rounded-2xl sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">
              Create New Habit
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-5 sm:mb-6">
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-4 sm:py-3 sm:text-base"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                  className="w-full rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`rounded-lg border-2 p-2.5 text-2xl transition-all sm:p-3 sm:text-3xl ${
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
                  className="flex-1 rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Frequency
                </label>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setFrequency('daily')}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                      frequency === 'daily'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setFrequency('custom')}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                      frequency === 'custom'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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
                        className={`rounded-lg py-2 text-xs font-medium sm:text-sm ${
                          customDays.includes(i)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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
                  className="flex-1 rounded-lg bg-gray-200 py-3 font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || (frequency === 'custom' && customDays.length === 0)}
                  className="flex-1 rounded-lg bg-purple-500 py-3 font-semibold text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
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
