'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface HabitCardProps {
  habit: {
    _id: string
    name: string
    emoji: string
    color: string
    currentStreak: number
    frequency: string
  }
  onToggle?: (habitId: string) => void
  onClick?: (habitId: string) => void
  onNote?: (habitId: string) => void
  onEdit?: (habit: any) => void
  completed?: boolean
  miniHeatmap?: boolean[]
}

export function HabitCard({ habit, onToggle, onClick, onNote, onEdit, completed = false, miniHeatmap }: HabitCardProps) {
  const [isCompleted, setIsCompleted] = useState(completed)

  // Keep local state in sync when parent data refreshes
  useEffect(() => {
    setIsCompleted(completed)
  }, [completed])

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // ✅ FIX #8: Optimistic UI update with rollback on error
    const previousState = isCompleted
    setIsCompleted(!isCompleted)
    
    try {
      await onToggle?.(habit._id)
    } catch (error) {
      // Rollback on error
      setIsCompleted(previousState)
      toast.error('Failed to update habit. Please try again.')
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${habit.color}` }}
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => onClick?.(habit._id)}
        >
          <span className="text-3xl">{habit.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">{habit.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{habit.frequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(habit)
              }}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-base md:text-lg hover:shadow-md"
              aria-label="Edit habit"
            >
              ✏️
            </button>
          )}
          {onNote && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNote(habit._id)
              }}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-base md:text-lg hover:shadow-md"
              aria-label="Add note"
            >
              📝
            </button>
          )}
          <button
            onClick={handleToggle}
            className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-2 flex items-center justify-center transition-all shrink-0 text-base md:text-lg ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
            }`}
            aria-label={isCompleted ? 'Mark as not done' : 'Mark as done'}
          >
            {isCompleted && '✓'}
          </button>
        </div>
      </div>

      {miniHeatmap && (
        <div className="flex gap-1 mb-2">
          {miniHeatmap.slice(-14).map((completed, i) => (
            <div
              key={i}
              className="flex-1 h-6 rounded"
              style={{
                backgroundColor: completed ? habit.color : undefined
              }}
            />
          ))}
        </div>
      )}

      {habit.currentStreak > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-500">🔥</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {habit.currentStreak} day streak
          </span>
        </div>
      )}
    </motion.div>
  )
}
