'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { OrbitScoreCard } from '@/components/orbit-score-card'
import { HabitCard } from '@/components/habit-card'
import { DateSelector } from '@/components/date-selector'
import { HabitDetail } from '@/components/habit-detail'
import { HabitJournal } from '@/components/habit-journal'
import { habitAPI, analyticsAPI, dayNotesAPI, taskAPI, expenseAPI } from '@/lib/api'
import type { TabType } from '@/components/mobile-nav'
import { RichTextEditor, htmlToPlainText, normalizeToHtml, sanitizeBasicHtml } from '@/components/ui/rich-text-editor'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { toast } from 'sonner'

// Enable UTC plugin for consistent date handling
dayjs.extend(utc)

interface HomeScreenProps {
  onNavigate?: (tab: TabType) => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedDate')
      if (stored) {
        const parsed = dayjs(stored)
        if (parsed.isValid() && !parsed.isAfter(dayjs(), 'day')) {
          return parsed.toDate()
        }
      }
    }
    return new Date()
  })
  const [habits, setHabits] = useState<any[]>([])
  const [orbitMetrics, setOrbitMetrics] = useState({
    completionRate: 0,
    totalHabits: 0,
    completedHabits: 0,
    productivityScore: 0,
    weeklyMomentum: 0,
    financeHealth: 0,
    taskCompletion: 0,
    overallProgress: 0,
  })
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)
  const [journalHabitFromDetail, setJournalHabitFromDetail] = useState<any | null>(null)
  const [editHabit, setEditHabit] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [journalHabit, setJournalHabit] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [taskStats, setTaskStats] = useState<any>(null)
  const [financeOverview, setFinanceOverview] = useState<any>(null)
  const [dayNote, setDayNote] = useState('')
  const [showDayNoteModal, setShowDayNoteModal] = useState(false)
  const emojiPool = ['💧','💻','🎸','💪','📚','🧘','🧠','🧹','🛌','🥗','🚴','🎮','📝','🧴','🏊','🍎']
  const abortControllerRef = useRef<AbortController | null>(null)

  const dateStr = useMemo(() => dayjs(selectedDate).format('YYYY-MM-DD'), [selectedDate])

  const loadData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const [habitsData, statsData, notesData, taskStatsData, financeData] = await Promise.all([
        habitAPI.getAll(true, dateStr),
        analyticsAPI.getDashboardStats(),
        dayNotesAPI.getRange(dateStr, dateStr),
        taskAPI.getStats(),
        expenseAPI.getOverview()
      ])

      const total = habitsData.length
      const completed = habitsData.filter((h: { isCompletedForDate: any }) => h.isCompletedForDate).length
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0
      const weeklyMomentum = statsData?.weeklyData?.length
        ? Math.round(statsData.weeklyData.reduce((sum: number, day: any) => sum + (day.rate || 0), 0) / statsData.weeklyData.length)
        : rate
      const taskCompletion = taskStatsData?.completionRate ?? 0
      const financeHealth = financeData?.budgetUsage?.percentage != null
        ? Math.max(0, 100 - Math.round(financeData.budgetUsage.percentage))
        : Math.max(0, Math.min(100, Math.round(financeData?.savingsRate ?? 0)))
      const productivityScore = Math.max(0, Math.min(100, Math.round((rate * 0.45) + (taskCompletion * 0.35) + (financeHealth * 0.2))))
      const overallProgress = Math.max(0, Math.min(100, Math.round((rate + taskCompletion + financeHealth) / 3)))

      setOrbitMetrics({
        completionRate: rate,
        totalHabits: total,
        completedHabits: completed,
        productivityScore,
        weeklyMomentum,
        financeHealth,
        taskCompletion,
        overallProgress,
      })
      setHabits(habitsData)
      setStats(statsData)
      setTaskStats(taskStatsData)
      setFinanceOverview(financeData)
      
      const note = notesData.find((n) => n.date === dateStr)?.note || ''
      setDayNote(note)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // Silent error handling
      }
    } finally {
      setLoading(false)
    }
  }, [dateStr])

  useEffect(() => {
    loadData()
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDate', dateStr)
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadData, dateStr])

  const handleToggle = async (habitId: string) => {
    // Optimistic UI update
    setHabits(prev => prev.map(h => 
      h._id === habitId ? { ...h, isCompletedForDate: !h.isCompletedForDate } : h
    ))

    // Update Orbit metrics optimistically
    const updatedHabits = habits.map(h => 
      h._id === habitId ? { ...h, isCompletedForDate: !h.isCompletedForDate } : h
    )
    const total = updatedHabits.length
    const completed = updatedHabits.filter(h => h.isCompletedForDate).length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    setOrbitMetrics(prev => ({ ...prev, completionRate: rate, totalHabits: total, completedHabits: completed }))

    try {
      await habitAPI.toggleLog(habitId, dateStr)
      // Reload to ensure consistency
      loadData()
    } catch (error) {
      // Revert on error
      setHabits(habits)
      const revertTotal = habits.length
      const revertCompleted = habits.filter(h => h.isCompletedForDate).length
      const revertRate = revertTotal > 0 ? Math.round((revertCompleted / revertTotal) * 100) : 0
      setOrbitMetrics(prev => ({ ...prev, completionRate: revertRate, totalHabits: revertTotal, completedHabits: revertCompleted }))
      toast.error('Failed to update habit. Please try again.')
    }
  }

  const handleEditOpen = (habit: any) => {
    setEditHabit(habit)
    setEditName(habit.name)
    setEditEmoji(habit.emoji)
  }

  const handleEditSave = async () => {
    if (!editHabit) return
    try {
      await habitAPI.update(editHabit._id, { name: editName.trim(), emoji: editEmoji })
      setEditHabit(null)
      await loadData()
    } catch (error) {
      toast.error('Failed to update habit')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl shadow-lg">
            <Image src="/logo.png" alt="Orbit logo" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <p className="text-gray-500">Loading your Orbit dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 page-shell py-3 pb-20 sm:py-4 sm:pb-17">
      <div className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-3 sm:pt-6"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 sm:h-16 sm:w-16">
                <Image
  src="/logo.png"
  alt="Orbit logo"
  fill
  unoptimized
  className="object-cover"
/>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 sm:text-sm sm:tracking-[0.24em]">Orbit</p>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-4xl">Command center</h1>
                <p className="max-w-xl text-sm text-gray-600 dark:text-gray-400 sm:text-base">Track habits, tasks, and finance from one control surface.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <button
                onClick={() => onNavigate?.('todo')}
                className="rounded-full bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 sm:px-4"
              >
                Open To-Do
              </button>
              <button
                onClick={() => onNavigate?.('finance')}
                className="rounded-full border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 dark:border-purple-800 dark:bg-gray-900 dark:text-purple-200 dark:hover:bg-purple-900/30 sm:px-4"
              >
                Open Finance
              </button>
              <button
                onClick={() => setShowDayNoteModal(true)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:px-4"
              >
                Day journal
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center sm:justify-start">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        <div className="dashboard-grid">
          <div className="space-y-6">
            <OrbitScoreCard
              productivityScore={orbitMetrics.productivityScore}
              weeklyMomentum={orbitMetrics.weeklyMomentum}
              completionPercentage={orbitMetrics.completionRate}
              overallProgress={orbitMetrics.overallProgress}
            />

            <div className="grid gap-3 md:grid-cols-3">
              <MiniStatCard title="Habits Today" value={`${orbitMetrics.completionRate}%`} detail={`${orbitMetrics.completedHabits}/${orbitMetrics.totalHabits} complete`} accent="from-purple-500 to-fuchsia-500" />
              <MiniStatCard title="Tasks" value={`${taskStats?.completionRate ?? 0}%`} detail={`${taskStats?.dueToday ?? 0} due today`} accent="from-blue-500 to-cyan-500" />
              <MiniStatCard title="Finance" value={`${orbitMetrics.financeHealth}%`} detail={`${Math.round(financeOverview?.monthlySpending ?? 0)} monthly spend`} accent="from-amber-500 to-orange-500" />
            </div>

            {stats && (
              <div className="rounded-3xl bg-white/80 p-4 shadow-lg ring-1 ring-gray-200/80 backdrop-blur dark:bg-gray-900/80 dark:ring-gray-800 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Habit overview</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">The current orbit of your daily system.</p>
                  </div>
                  <button
                    onClick={() => setShowDayNoteModal(true)}
                    className="self-start rounded-full border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:bg-gray-800 dark:text-purple-200 dark:hover:bg-purple-900/30"
                  >
                    Day journal
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="rounded-2xl bg-gray-50 p-3 text-center dark:bg-gray-800 sm:p-4">
                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Today</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 sm:text-3xl">{stats.todayCompletion?.rate || 0}%</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 text-center dark:bg-gray-800 sm:p-4">
                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 sm:text-3xl">{stats.activeHabits || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-3 text-center dark:bg-gray-800 sm:p-4">
                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Avg Streak</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 sm:text-3xl">{stats.avgStreak || 0} 🔥</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="rounded-3xl bg-white/80 p-8 text-center shadow-lg ring-1 ring-gray-200/80 dark:bg-gray-900/80 dark:ring-gray-800 sm:p-12">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-900/30">📝</div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white sm:text-xl">No habits yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Create your first habit to start building momentum.</p>
                </div>
              ) : (
                habits.map((habit) => (
                  <div key={habit._id} className="relative group">
                    <HabitCard
                      habit={habit}
                      onToggle={handleToggle}
                      onClick={setSelectedHabit}
                      onEdit={handleEditOpen}
                      onNote={() => setJournalHabit(habit)}
                      completed={habit.isCompletedForDate ?? false}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 self-start xl:sticky xl:top-6">
            <div className="rounded-3xl bg-white/80 p-4 shadow-lg ring-1 ring-gray-200/80 backdrop-blur dark:bg-gray-900/80 dark:ring-gray-800 sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Quick actions</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                <ActionChip label="Open To-Do" onClick={() => onNavigate?.('todo')} />
                <ActionChip label="Open Finance" onClick={() => onNavigate?.('finance')} />
                <ActionChip label="Day journal" onClick={() => setShowDayNoteModal(true)} />
                <ActionChip label="Refresh" onClick={loadData} />
              </div>
            </div>

            <div className="rounded-3xl bg-white/80 p-5 shadow-lg ring-1 ring-gray-200/80 backdrop-blur dark:bg-gray-900/80 dark:ring-gray-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Task focus</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-800 dark:text-white">Today&apos;s workload</h3>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                  {taskStats?.activeTasks ?? 0} active
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <InfoPill label="Due today" value={taskStats?.dueToday ?? 0} />
                <InfoPill label="Overdue" value={taskStats?.overdueTasks ?? 0} />
                <InfoPill label="High priority" value={taskStats?.highPriorityTasks ?? 0} />
                <InfoPill label="Completed" value={taskStats?.completedTasks ?? 0} />
              </div>
            </div>

            <div className="rounded-3xl bg-white/80 p-5 shadow-lg ring-1 ring-gray-200/80 backdrop-blur dark:bg-gray-900/80 dark:ring-gray-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Finance pulse</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-800 dark:text-white">Recent activity</h3>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                  {orbitMetrics.financeHealth}% healthy
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <InfoPill label="Monthly spend" value={Math.round(financeOverview?.monthlySpending ?? 0)} />
                <InfoPill label="Remaining budget" value={Math.round(financeOverview?.remainingBudget ?? 0)} />
                <InfoPill label="Recent transactions" value={financeOverview?.recentTransactions?.length ?? 0} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <HabitDetail
        habitId={selectedHabit}
        isOpen={!!selectedHabit}
        onClose={() => setSelectedHabit(null)}
        onSelectDate={(date) => {
          setSelectedDate(date)
          // Get the habit details to open journal
          if (selectedHabit) {
            const habit = habits.find(h => h._id === selectedHabit)
            if (habit) {
              setJournalHabitFromDetail({ ...habit, selectedDate: date })
            }
          }
        }}
      />

      {editHabit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Habit</h3>
              <button
                onClick={() => setEditHabit(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emoji</label>
                <div className="grid grid-cols-6 gap-2">
                  {emojiPool.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEditEmoji(e)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                        editEmoji === e
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditHabit(null)}
                  className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600"
                  disabled={!editName.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {journalHabit && (
        <HabitJournal
          habitId={journalHabit._id}
          habitName={journalHabit.name}
          habitEmoji={journalHabit.emoji}
          habitColor={journalHabit.color}
          selectedDate={selectedDate}
          isOpen={!!journalHabit}
          onClose={() => {
            setJournalHabit(null)
            loadData() // Refresh to show updated notes
          }}
        />
      )}

      {showDayNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Day journal</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{dayjs(selectedDate).format('MMM D, YYYY')}</h3>
              </div>
              <button
                onClick={() => setShowDayNoteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Journal note</label>
              <RichTextEditor
                value={dayNote}
                onChange={(val) => setDayNote(val)}
                placeholder="Write about your day..."
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={async () => {
                  try {
                    await dayNotesAPI.upsert(dayjs(selectedDate).format('YYYY-MM-DD'), '')
                    setDayNote('')
                    setShowDayNoteModal(false)
                  } catch (error) {
                    toast.error('Failed to delete note')
                  }
                }}
                className="px-4 py-2 rounded-lg text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                Delete
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDayNoteModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const rawNote = dayNote || ''
                      
                      // Extract plain text using DOM
                      const tempDiv = document.createElement('div')
                      tempDiv.innerHTML = rawNote
                      const plain = (tempDiv.textContent || tempDiv.innerText || '').trim()
                      
                      // Save the original HTML (backend stores it as-is)
                      await dayNotesAPI.upsert(dayjs(selectedDate).format('YYYY-MM-DD'), plain ? rawNote : '')
                      setDayNote(plain ? rawNote : '')
                      setShowDayNoteModal(false)
                      await loadData()
                      
                      if (plain) {
                        toast.success('Day journal saved!')
                      } else {
                        toast.success('Day journal cleared')
                      }
                    } catch (error) {
                      console.error('Failed to save day note:', error)
                      toast.error('Failed to save note')
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {journalHabitFromDetail && (
        <HabitJournal
          habitId={journalHabitFromDetail._id}
          habitName={journalHabitFromDetail.name}
          habitEmoji={journalHabitFromDetail.emoji}
          habitColor={journalHabitFromDetail.color}
          selectedDate={journalHabitFromDetail.selectedDate}
          isOpen={!!journalHabitFromDetail}
          onClose={() => setJournalHabitFromDetail(null)}
        />
      )}
    </div>
  )
}

function MiniStatCard({ title, value, detail, accent }: { title: string; value: string; detail: string; accent: string }) {
  return (
    <div className="rounded-3xl bg-white/80 p-4 shadow-lg ring-1 ring-gray-200/80 backdrop-blur dark:bg-gray-900/80 dark:ring-gray-800">
      <div className={`h-1.5 w-16 rounded-full bg-linear-to-r ${accent}`} />
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-gray-800 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
    </div>
  )
}

function ActionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-200"
    >
      {label}
    </button>
  )
}

function InfoPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-black text-gray-800 dark:text-white">{value}</p>
    </div>
  )
}
