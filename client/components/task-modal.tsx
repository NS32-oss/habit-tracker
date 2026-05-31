'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import { toast } from 'sonner'

interface Task {
  _id?: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  labels: string[]
  color: string
  dueDate: string | null
  dueTime: string | null
  startDate?: string | null
  recurring?: {
    enabled: boolean
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom'
  }
}

interface TaskModalProps {
  task: Task | null
  onSave: (data: any) => void | Promise<void>
  onClose: () => void
  categories: string[]
}

const COLORS = [
  '#a78bfa', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
]

export function TaskModal({ task, onSave, onClose, categories }: TaskModalProps) {
  const [formData, setFormData] = useState<Task>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    labels: [],
    color: '#a78bfa',
    dueDate: null,
    dueTime: null,
    startDate: null,
    recurring: {
      enabled: false,
      pattern: 'daily',
    },
  })

  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showRecurring, setShowRecurring] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : null,
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      })
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, newLabel.trim()],
      })
      setNewLabel('')
    }
  }

  const removeLabel = (label: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter((l) => l !== label),
    })
  }

  const isOverdue = formData.dueDate && dayjs(formData.dueDate).isBefore(dayjs(), 'day')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {task ? '✏️ Edit Task' : '✨ New Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as 'low' | 'medium' | 'high' | 'critical',
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="general">General</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="shopping">Shopping</option>
                  <option value="health">Health</option>
                  {categories
                    .filter((c) => !['work', 'personal', 'shopping', 'health'].includes(c))
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value || null })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Due Date {isOverdue && '⚠️'}
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || null })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Due Time */}
          {formData.dueDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Time (optional)
              </label>
              <input
                type="time"
                value={formData.dueTime || ''}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value || null })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                placeholder="Add label..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                type="button"
                onClick={addLabel}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Add
              </button>
            </div>

            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.labels.map((label) => (
                  <motion.div
                    key={label}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className="hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-800 dark:border-gray-100 scale-110'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div>
            <button
              type="button"
              onClick={() => setShowRecurring(!showRecurring)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              {showRecurring ? '✕ Hide' : '+ Add'} Recurrence
            </button>

            <AnimatePresence>
              {showRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.recurring?.enabled || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurring: { enabled: e.target.checked, pattern: formData.recurring?.pattern ?? 'daily' },
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable recurrence</span>
                  </label>

                  {formData.recurring?.enabled && (
                    <select
                      value={formData.recurring.pattern || 'daily'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurring: {
                            ...(formData.recurring || { enabled: false, pattern: 'daily' }),
                            pattern: e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom',
                          },
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
