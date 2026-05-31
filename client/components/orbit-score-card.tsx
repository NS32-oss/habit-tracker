'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface OrbitScoreCardProps {
  productivityScore: number
  weeklyMomentum: number
  completionPercentage: number
  overallProgress: number
  subtitle?: string
}

export function OrbitScoreCard({
  productivityScore,
  weeklyMomentum,
  completionPercentage,
  overallProgress,
  subtitle = 'Orbit Score',
}: OrbitScoreCardProps) {
  const score = Math.max(0, Math.min(100, productivityScore))

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl bg-linear-to-br from-purple-600 via-fuchsia-600 to-pink-600 p-px shadow-xl"
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-white/90 p-6 dark:bg-gray-900/90">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-white/60 dark:bg-gray-800">
              <Image src="/logo.png" alt="Orbit logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">{subtitle}</p>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white">Productivity Score</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Weekly momentum across habits, tasks, and finance</p>
            </div>
          </div>
          <OrbitRing score={score} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Productivity" value={`${productivityScore}%`} />
          <Metric label="Weekly Momentum" value={`${weeklyMomentum}%`} />
          <Metric label="Completion" value={`${completionPercentage}%`} />
          <Metric label="Overall Progress" value={`${overallProgress}%`} />
        </div>
      </div>
    </motion.div>
  )
}

function OrbitRing({ score }: { score: number }) {
  const size = 120
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex h-30 w-30 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={60} cy={60} r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200 dark:text-gray-700" />
        <motion.circle
          cx={60}
          cy={60}
          r={radius}
          stroke="url(#orbit-gradient)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="orbit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-black text-gray-800 dark:text-white">{score}%</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Orbit</div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-black text-gray-800 dark:text-white">{value}</p>
    </div>
  )
}