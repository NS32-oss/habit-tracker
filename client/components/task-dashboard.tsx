'use client'

import { motion } from 'framer-motion'

interface TaskDashboardProps {
  stats: {
    tasksDueToday: number
    completedToday: number
    completionPercentage: number
    activeTasks: number
    highPriorityTasks: number
    overdueTasks: number
    totalTasks: number
  }
}

export function TaskDashboard({ stats }: TaskDashboardProps) {
  const dashboardItems = [
    {
      icon: '📅',
      label: 'Due Today',
      value: stats.tasksDueToday,
      color: 'from-blue-400 to-blue-600',
    },
    {
      icon: '✅',
      label: 'Completed Today',
      value: stats.completedToday,
      color: 'from-green-400 to-green-600',
    },
    {
      icon: '🎯',
      label: 'Active Tasks',
      value: stats.activeTasks,
      color: 'from-purple-400 to-purple-600',
    },
    {
      icon: '🔥',
      label: 'High Priority',
      value: stats.highPriorityTasks,
      color: 'from-red-400 to-red-600',
    },
    {
      icon: '⚠️',
      label: 'Overdue',
      value: stats.overdueTasks,
      color: 'from-orange-400 to-orange-600',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Progress Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Today's Progress</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-purple-600">
                {stats.completionPercentage}%
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {stats.completedToday} of {stats.tasksDueToday}
              </span>
            </div>
          </div>
          <ProgressRing percentage={stats.completionPercentage} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {dashboardItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-gradient-to-br ${item.color} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-xs opacity-90 mt-1">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface ProgressRingProps {
  percentage: number
  size?: number
}

function ProgressRing({ percentage, size = 120 }: ProgressRingProps) {
  const radius = size / 2 - 6
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        className="text-gray-200 dark:text-gray-700"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#gradient)"
        strokeWidth="6"
        fill="none"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}
