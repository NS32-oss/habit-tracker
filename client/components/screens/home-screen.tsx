'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CatMascot } from '@/components/cat-mascot'
import { HabitCard } from '@/components/habit-card'
import { DateSelector } from '@/components/date-selector'
import { HabitDetail } from '@/components/habit-detail'
import { HabitJournal } from '@/components/habit-journal'
import { habitAPI, analyticsAPI, dayNotesAPI } from '@/lib/api'
import { RichTextEditor, htmlToPlainText, normalizeToHtml, sanitizeBasicHtml } from '@/components/ui/rich-text-editor'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { toast } from 'sonner'

// Enable UTC plugin for consistent date handling
dayjs.extend(utc)

export function HomeScreen() {
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
  const [catMood, setCatMood] = useState({ completionRate: 0, totalHabits: 0, completedHabits: 0 })
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)
  const [journalHabitFromDetail, setJournalHabitFromDetail] = useState<any | null>(null)
  const [editHabit, setEditHabit] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [journalHabit, setJournalHabit] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [dayNote, setDayNote] = useState('')
  const [showDayNoteModal, setShowDayNoteModal] = useState(false)
  const emojiPool = ['💧','💻','🎸','💪','📚','🧘','🧠','🧹','🛌','🥗','🚴','🎮','📝','🧴','🏊','🍎']

  useEffect(() => {
    loadData()
    loadDayNote()
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDate', dayjs(selectedDate).format('YYYY-MM-DD'))
    }
  }, [selectedDate])

  const loadData = async () => {
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')
      const [habitsData, statsData] = await Promise.all([
        habitAPI.getAll(true, dateStr),
        analyticsAPI.getDashboardStats(),
      ])

      const total = habitsData.length
      const completed = habitsData.filter((h: { isCompletedForDate: any }) => h.isCompletedForDate).length
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0

      setCatMood({ completionRate: rate, totalHabits: total, completedHabits: completed })
      setHabits(habitsData)
      setStats(statsData)
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }

  const loadDayNote = async () => {
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')
      const notes = await dayNotesAPI.getRange(dateStr, dateStr)
      console.log('[loadDayNote] Received notes for', dateStr, ':', notes)
      const note = notes.find((n) => n.date === dateStr)?.note || ''
      console.log('[loadDayNote] Setting dayNote to:', note)
      setDayNote(note)
    } catch (error) {
      console.error('[loadDayNote] Error:', error)
      // silent
    }
  }

  const handleToggle = async (habitId: string) => {
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')
      await habitAPI.toggleLog(habitId, dateStr)
      loadData()
    } catch (error) {
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
          <div className="text-6xl mb-4 animate-bounce">🐱</div>
          <p className="text-gray-500">Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 p-4 pb-17">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Purrfect Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily habits with your cute cat companion
          </p>
        </motion.div>

        <div className="flex justify-center sm:justify-start">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {stats && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Overview</div>
                  <button
                    onClick={() => setShowDayNoteModal(true)}
                    className="self-start sm:self-auto px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-200 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                  >
                    🗒️ Day journal
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.todayCompletion?.rate || 0}%
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.activeHabits || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Streak</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.avgStreak || 0} 🔥
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No habits yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create your first habit to get started!
                  </p>
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

          <div>
            <CatMascot
              completionRate={catMood.completionRate}
              totalHabits={catMood.totalHabits}
              completedHabits={catMood.completedHabits}
            />
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
                      console.log('Raw note from editor:', rawNote)
                      
                      // Extract plain text using DOM
                      const tempDiv = document.createElement('div')
                      tempDiv.innerHTML = rawNote
                      const plain = (tempDiv.textContent || tempDiv.innerText || '').trim()
                      
                      console.log('Extracted plain text:', plain, 'length:', plain.length)
                      
                      // Save the original HTML (backend stores it as-is)
                      await dayNotesAPI.upsert(dayjs(selectedDate).format('YYYY-MM-DD'), plain ? rawNote : '')
                      setDayNote(plain ? rawNote : '')
                      setShowDayNoteModal(false)
                      await loadDayNote()
                      
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
