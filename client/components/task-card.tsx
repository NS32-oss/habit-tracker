'use client'

import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface Task {
  _id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  labels: string[]
  color: string
  dueDate: string | null
  dueTime: string | null
  completed: boolean
  completedAt?: string
  pinned: boolean
  favorite: boolean
  subtasks: any[]
  notes: any[]
}

interface TaskCardProps {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onArchive: () => void
  onPin: () => void
  onFavorite: () => void
}

const priorityConfig = {
  low: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', label: 'Low' },
  medium: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', label: 'Med' },
  high: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', label: 'High' },
  critical: { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', label: '!' },
}

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onPin,
  onFavorite,
}: TaskCardProps) {
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && !task.completed
  const isDueToday = task.dueDate && dayjs(task.dueDate).isSame(dayjs(), 'day')
  const isDueSoon = task.dueDate && dayjs(task.dueDate).diff(dayjs(), 'day') <= 3 && !task.completed

  const completedSubtasks = task.subtasks.filter((s: any) => s.completed).length
  const totalSubtasks = task.subtasks.length
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group rounded-2xl border p-3 shadow-sm transition-all hover:shadow-md sm:p-4 ${
        task.completed
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: task.color }}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Checkbox */}
        <motion.button
          onClick={onToggle}
          whileTap={{ scale: 0.9 }}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all sm:h-6 sm:w-6 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
          }`}
        >
          {task.completed && <span className="text-white text-sm">✓</span>}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-semibold transition-all md:text-base ${
                  task.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-800 dark:text-white'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                  {task.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 opacity-0 transition-opacity shrink-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <motion.button
                onClick={onFavorite}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                title={task.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {task.favorite ? '⭐' : '☆'}
              </motion.button>
              <motion.button
                onClick={onPin}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30"
                title={task.pinned ? 'Unpin' : 'Pin'}
              >
                {task.pinned ? '📌' : '📍'}
              </motion.button>
              <motion.button
                onClick={onEdit}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30"
                title="Edit"
              >
                ✏️
              </motion.button>
              <motion.button
                onClick={onArchive}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700/30"
                title="Archive"
              >
                📦
              </motion.button>
              <motion.button
                onClick={onDelete}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-red-100 dark:hover:bg-red-900/30"
                title="Delete"
              >
                🗑️
              </motion.button>
            </div>
          </div>

          {/* Tags and Info */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {/* Priority Badge */}
            <span className={`rounded-full px-2 py-1 text-[11px] font-medium sm:text-xs ${priorityConfig[task.priority].color}`}>
              {priorityConfig[task.priority].label}
            </span>

            {/* Category Badge */}
            {task.category && task.category !== 'general' && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-[11px] text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 sm:text-xs">
                {task.category}
              </span>
            )}

            {/* Labels */}
            {task.labels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700 dark:bg-gray-700 dark:text-gray-300 sm:text-xs"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">
                  Subtasks: {completedSubtasks}/{totalSubtasks}
                </span>
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 sm:text-xs">
                  {Math.round(subtaskProgress)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-purple-400 to-pink-400"
                  style={{ width: `${subtaskProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${subtaskProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Due Date and Notes */}
          <div className="flex flex-wrap gap-3 items-center text-xs">
            {task.dueDate && (
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${
                  isOverdue
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : isDueToday
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : isDueSoon
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                📅 {dayjs(task.dueDate).format('MMM DD')}
                {task.dueTime && ` at ${task.dueTime}`}
              </div>
            )}

            {task.notes.length > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                📝 {task.notes.length} note{task.notes.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
