"use client"

import { JSX, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { analyticsAPI, dayNotesAPI } from '@/lib/api'
import { RichTextEditor, sanitizeBasicHtml, htmlToPlainText } from '@/components/ui/rich-text-editor'
import { toast } from 'sonner'

// ensure consistent dates
dayjs.extend(utc)

export function DailyHabitsScreen() {
  const [stats, setStats] = useState<any>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [noteModal, setNoteModal] = useState<{ date: string; notes: { habitId: string; habitName: string; habitEmoji: string; note: string }[] } | null>(null)
  const [generalNotes, setGeneralNotes] = useState<Record<string, string>>({})
  const [generalModal, setGeneralModal] = useState<{ date: string; note: string } | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoize month range calculations
  const monthRange = useMemo(() => ({
    start: dayjs(calendarMonth).startOf('month').format('YYYY-MM-DD'),
    end: dayjs(calendarMonth).endOf('month').format('YYYY-MM-DD'),
    key: dayjs(calendarMonth).format('YYYY-MM')
  }), [calendarMonth])

  const calendarCells = useMemo(() => {
    if (!stats?.weeklyData || stats.weeklyData.length === 0) return []

    const firstDay = dayjs(calendarMonth).startOf('month')
    const lastDay = dayjs(calendarMonth).endOf('month')
    const daysInMonth = lastDay.date()
    const startingDayOfWeek = firstDay.day()

    const dataMap = new Map(stats.weeklyData.map((d: any) => [d.date, d]))
    const cells: JSX.Element[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="flex flex-col items-center" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = dayjs(calendarMonth).date(day).format('YYYY-MM-DD')
      const dayData = dataMap.get(dateStr) as any
      const hasNotes = (dayData?.notes || []).length > 0
      const hasGeneralNote = (generalNotes[dateStr] || '').trim().length > 0
      const rate = (dayData?.total ?? 0) > 0 ? ((dayData?.completed ?? 0) / (dayData?.total ?? 0)) * 100 : 0
      const isFuture = dayjs(dateStr).isAfter(dayjs(), 'day')
      const isToday = dayjs(dateStr).isSame(dayjs(), 'day')

      const mood = isFuture ? '🤔' : rate < 50 ? '😾' : rate < 80 ? '😺' : '😻'

      const bgColor = isFuture
        ? 'bg-gray-100 dark:bg-gray-700'
        : rate === 0
          ? 'bg-gray-300 dark:bg-gray-600'
          : rate < 50
            ? 'bg-red-400 dark:bg-red-500/80'
            : rate < 80
              ? 'bg-yellow-400 dark:bg-yellow-500/80'
              : 'bg-emerald-400 dark:bg-emerald-500/80'

      const handleDateClick = () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedDate', dateStr)
          window.location.href = '/'
        }
      }

      cells.push(
        <div key={day} className="flex flex-col items-center">
          <button
            onClick={handleDateClick}
            className={`
              w-full h-20 rounded-lg border-2 transition-all relative
              grid grid-rows-[auto_1fr_auto] items-center justify-items-center p-1 gap-0.5
              md:flex md:flex-col md:items-center md:justify-center md:gap-2
              ${bgColor} hover:scale-105 hover:shadow-lg cursor-pointer
              ${isToday ? 'ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-gray-800' : 'border-transparent'}
            `}
            title={isFuture ? 'Coming up...' : `${dayData?.completed ?? 0}/${dayData?.total ?? 0} completed`}
          >
            <div className="h-5 w-full flex items-start justify-start md:absolute md:top-1 md:left-1 md:w-auto md:h-auto">
              {hasGeneralNote && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    const noteContent = generalNotes[dateStr] || ''
                    setGeneralModal({ date: dateStr, note: noteContent })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setGeneralModal({ date: dateStr, note: generalNotes[dateStr] || '' })
                    }
                  }}
                  className="h-4 w-4 md:h-5 md:w-5 rounded-full text-[8px] md:text-[9px] shadow-sm hover:shadow-md transition border flex items-center justify-center cursor-pointer bg-amber-300 text-white border-amber-300"
                  title="View day journal"
                >
                  ✉️
                </span>
              )}
            </div>
            <span className="text-lg md:text-2xl">{mood}</span>
            <div className="h-4 flex items-center">
              {!isFuture && dayData && (
                <span className="text-[10px] md:text-xs font-bold text-white/90">
                  {(dayData?.completed ?? 0)}/{(dayData?.total ?? 0)}
                </span>
              )}
            </div>
          </button>
          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mt-1">
            {dayjs(dateStr).format('MMM D')}
          </span>
        </div>
      )
    }

    return cells
  }, [calendarMonth, stats?.weeklyData, generalNotes])

  // Optimized data loading with parallel API calls
  const loadData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    try {
      // Parallel API calls for faster loading
      const [statsData, notesData] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        dayNotesAPI.getRange(monthRange.start, monthRange.end)
      ])

      // Process notes efficiently
      const map: Record<string, string> = {}
      notesData.forEach((n) => {
        const noteContent = n.note || ''
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = noteContent
        const plain = (tempDiv.textContent || tempDiv.innerText || '').trim()
        if (plain.length > 0) {
          map[n.date] = noteContent
        }
      })

      setStats(statsData)
      setGeneralNotes(map)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // fail silently for non-abort errors
      }
    } finally {
      setLoading(false)
    }
  }, [monthRange])

  useEffect(() => {
    loadData()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadData])

  // Reload only when user returns (debounced)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleVisibility = () => {
      if (!document.hidden && dayjs(calendarMonth).isSame(dayjs(), 'month')) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => loadData(), 300)
      }
    }
    window.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility)
      clearTimeout(timeoutId)
    }
  }, [calendarMonth, loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📅</div>
          <p className="text-gray-500">Loading daily habits...</p>
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
          className="flex items-center justify-between gap-3 pt-2 sm:pt-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">Daily Habits</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">Month view of completions</p>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            <button
              onClick={() => setCalendarMonth(dayjs(calendarMonth).subtract(1, 'month').toDate())}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ←
            </button>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-32 text-center">
              {dayjs(calendarMonth).format('MMMM YYYY')}
            </span>
            <button
              onClick={() => setCalendarMonth(dayjs(calendarMonth).add(1, 'month').toDate())}
              disabled={dayjs(calendarMonth).isAfter(dayjs(), 'month')}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              →
            </button>
          </div>
        </motion.div>

        <div className="dashboard-grid items-start">
          <div className="space-y-4 sm:space-y-6">
            {stats?.weeklyData && stats.weeklyData.length > 0 && (
              <div className="card-surface p-4 sm:p-6">
                {/* Legend */}
                <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-gray-200 pb-4 text-xs dark:border-gray-700 sm:mb-5 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded bg-red-400" />
                    <span>Struggle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded bg-yellow-400" />
                    <span>Mixed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded bg-emerald-400" />
                    <span>Victory</span>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="mb-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 sm:text-xs">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarCells}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 self-start xl:sticky xl:top-6">
            <div className="card-surface p-4 sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Journal</p>
              <h3 className="mt-1 text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">Daily notes</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Open today&apos;s entry, review recent notes, and keep your month in view.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setGeneralModal({ date: dayjs().format('YYYY-MM-DD'), note: generalNotes[dayjs().format('YYYY-MM-DD')] || '' })} className="rounded-full bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-lg sm:px-4 sm:text-sm">
                  Open today
                </button>
                <button onClick={() => setNoteModal({ date: dayjs().format('YYYY-MM-DD'), notes: [] })} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:px-4 sm:text-sm">
                  Habit notes
                </button>
              </div>
            </div>

            <div className="card-surface p-4 sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Recent notes</p>
              <div className="mt-3 space-y-3 max-h-112 overflow-auto pr-1">
                {Object.entries(generalNotes).slice(-5).reverse().map(([date, note]) => (
                  <button key={date} onClick={() => setGeneralModal({ date, note })} className="w-full rounded-2xl bg-gray-50 p-4 text-left ring-1 ring-gray-200 transition hover:bg-purple-50 dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-purple-900/20">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{dayjs(date).format('MMM D, YYYY')}</p>
                    <p className="mt-1 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">{htmlToPlainText(note || '') || 'No note'}</p>
                  </button>
                ))}
                {Object.keys(generalNotes).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No journal entries yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes for</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{dayjs(noteModal.date).format('MMM D, YYYY')}</h3>
              </div>
              <button
                onClick={() => setNoteModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {noteModal.notes.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-6">No notes saved for this day.</div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {noteModal.notes.map((n, idx) => (
                  <div key={`${n.habitId}-${idx}`} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/60">
                    <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-800 dark:text-white">
                      <span>{n.habitEmoji || '📝'}</span>
                      <span>{n.habitName || 'Habit'}</span>
                    </div>
                    <p
                      className="text-sm text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: sanitizeBasicHtml(n.note || '').replace(/\n/g, '<br>') || 'No note' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  localStorage.setItem('selectedDate', noteModal.date)
                  window.location.href = '/'
                }}
                className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/60"
              >
                Go to day
              </button>
              <button
                onClick={() => setNoteModal(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {generalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Day journal</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{dayjs(generalModal.date).format('MMM D, YYYY')}</h3>
              </div>
              <button
                onClick={() => setGeneralModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Journal note</label>
              <RichTextEditor
                value={generalModal.note}
                onChange={(val) => setGeneralModal({ ...generalModal, note: val })}
                placeholder="Write about your day..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">This note is for the day (not tied to a habit).</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setGeneralModal(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!generalModal) return
                  try {
                    const rawNote = generalModal.note || ''
                    
                    // Extract plain text using DOM
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = rawNote
                    const plain = (tempDiv.textContent || tempDiv.innerText || '').trim()
                    
                    // Save the original HTML (backend stores it as-is)
                    await dayNotesAPI.upsert(generalModal.date, plain ? rawNote : '')
                    
                    setGeneralNotes((prev) => {
                      const next = { ...prev }
                      if (plain) {
                        next[generalModal.date] = rawNote
                      } else {
                        delete next[generalModal.date]
                      }
                      return next
                    })
                    
                    setGeneralModal(null)
                    await loadData()
                    
                    if (plain) {
                      toast.success('Day journal saved!')
                    } else {
                      toast.success('Day journal cleared')
                    }
                  } catch (error) {
                    console.error('Failed to save day note:', error)
                    toast.error('Failed to save day journal')
                  }
                }}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
