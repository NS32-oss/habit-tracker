'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { habitAPI } from '@/lib/api'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { RichTextEditor, htmlToPlainText, normalizeToHtml, sanitizeBasicHtml } from '@/components/ui/rich-text-editor'

interface HabitJournalProps {
  habitId: string
  habitName: string
  habitEmoji: string
  habitColor: string
  selectedDate: Date
  isOpen: boolean
  onClose: () => void
}

export function HabitJournal({ 
  habitId, 
  habitName, 
  habitEmoji, 
  habitColor,
  selectedDate, 
  isOpen, 
  onClose 
}: HabitJournalProps) {
  const [note, setNote] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && habitId) {
      loadJournalEntry()
    }
  }, [isOpen, habitId, selectedDate])

  const loadJournalEntry = async () => {
    setLoading(true)
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')
      const logs = await habitAPI.getLogs(habitId, dateStr, dateStr)
      
      if (logs && logs.length > 0) {
        const log = logs[0]
        setNote(log.notes || '')
        setIsCompleted(log.completed || false)
      } else {
        setNote('')
        setIsCompleted(false)
      }
    } catch (error) {
      console.error('Failed to load journal entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD')
      
      const rawNote = note || ''
      
      // Extract plain text using DOM
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = rawNote
      const plainText = (tempDiv.textContent || tempDiv.innerText || '').trim()

      // Save the original HTML content if there's text, otherwise undefined
      const noteToSave = plainText ? rawNote : undefined
      
      const response = await habitAPI.logHabit(habitId, dateStr, isCompleted, noteToSave)
      
      toast.success(plainText ? 'Journal entry saved!' : 'Habit updated!')
      onClose()
    } catch (error) {
      console.error('Failed to save journal entry:', error)
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4 pb-40 sm:items-center sm:pb-4">
        <motion.div
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[calc(100vh-5rem)]"
        >
          {/* Header */}
          <div 
            className="p-4 pb-3 border-b border-gray-200 dark:border-gray-700 shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${habitColor}15, ${habitColor}05)` 
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{habitEmoji}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {habitName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg font-semibold text-white text-sm transition shadow-lg"
                  style={{
                    backgroundColor: habitColor,
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Notes are for reflection; they do not mark completion.
            </p>
          </div>

          {/* Journal Content */}
          <div className="overflow-y-auto flex-1">
            <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-bounce">📝</div>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📝 Today's Journal
                  </label>
                  <RichTextEditor
                    value={note}
                    onChange={(val) => setNote(val)}
                    placeholder="How did it go? What did you learn? Any challenges or wins?"
                    minHeight={140}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {htmlToPlainText(note).length} characters
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    💡 Journal Prompts
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <button
                      onClick={() => setNote(normalizeToHtml(`${htmlToPlainText(note)}\n• What went well: `))}
                      className="text-left p-2 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition"
                    >
                      ✨ What went well?
                    </button>
                    <button
                      onClick={() => setNote(normalizeToHtml(`${htmlToPlainText(note)}\n• Challenges faced: `))}
                      className="text-left p-2 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition"
                    >
                      🚧 Any challenges?
                    </button>
                    <button
                      onClick={() => setNote(normalizeToHtml(`${htmlToPlainText(note)}\n• How I felt: `))}
                      className="text-left p-2 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition"
                    >
                      😊 How did I feel?
                    </button>
                    <button
                      onClick={() => setNote(normalizeToHtml(`${htmlToPlainText(note)}\n• Tomorrow I will: `))}
                      className="text-left p-2 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition"
                    >
                      🎯 Tomorrow's goal
                    </button>
                    <button
                      onClick={() => setNote(normalizeToHtml(`${htmlToPlainText(note)}\n• Why didn’t it happen today: `))}
                      className="text-left p-2 rounded bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition"
                    >
                      🤔 Why didn’t it happen?
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                    Notes do not mark completion. Toggle above only if you finished the habit.
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
