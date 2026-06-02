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
      className="rounded-2xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 sm:p-4"
      style={{ borderLeft: `4px solid ${habit.color}` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => onClick?.(habit._id)}
        >
          <span className="text-2xl sm:text-3xl">{habit.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white sm:text-base">{habit.name}</h3>
            <p className="text-[11px] capitalize text-gray-500 dark:text-gray-400 sm:text-xs">{habit.frequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(habit)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-sm shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-700 sm:h-9 sm:w-9 sm:text-base md:h-11 md:w-11 md:text-lg"
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-sm shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-700 sm:h-9 sm:w-9 sm:text-base md:h-11 md:w-11 md:text-lg"
              aria-label="Add note"
            >
              📝
            </button>
          )}
          <button
            onClick={handleToggle}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-all sm:h-9 sm:w-9 sm:text-base md:h-11 md:w-11 md:text-lg ${
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
        <div className="mb-2 flex gap-1">
          {miniHeatmap.slice(-14).map((completed, i) => (
            <div
              key={i}
              className="h-5 flex-1 rounded sm:h-6"
              style={{
                backgroundColor: completed ? habit.color : undefined
              }}
            />
          ))}
        </div>
      )}

      {habit.currentStreak > 0 && (
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-amber-500">🔥</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {habit.currentStreak} day streak
          </span>
        </div>
      )}
    </motion.div>
  )
}
