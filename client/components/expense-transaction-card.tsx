'use client'

import { motion } from 'framer-motion'
import dayjs from 'dayjs'

export interface ExpenseTransaction {
  _id: string
  type: 'income' | 'expense'
  amount: number
  currency?: string
  category: string
  subcategory?: string
  merchant?: string
  notes?: string
  paymentMethod?: string
  tags?: string[]
  date: string
  time?: string
  recurring?: { enabled?: boolean; frequency?: string }
  attachments?: string[]
  receiptImage?: string
  archived?: boolean
}

interface ExpenseTransactionCardProps {
  transaction: ExpenseTransaction
  selected?: boolean
  onSelect?: (id: string) => void
  onEdit?: (transaction: ExpenseTransaction) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
}

const amountStyles = {
  income: 'text-emerald-600 dark:text-emerald-400',
  expense: 'text-rose-600 dark:text-rose-400',
}

const typeIcons = {
  income: '↗️',
  expense: '↙️',
}

export function ExpenseTransactionCard({
  transaction,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
}: ExpenseTransactionCardProps) {
  const amountPrefix = transaction.type === 'income' ? '+' : '-'

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`rounded-xl border p-4 shadow-sm transition-all ${
        selected
          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/15'
          : 'border-gray-200 bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800'
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: transaction.type === 'income' ? '#10b981' : '#f43f5e' }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onSelect?.(transaction._id)}
          className={`mt-1 h-6 w-6 rounded-md border flex items-center justify-center shrink-0 ${
            selected
              ? 'border-purple-600 bg-purple-600 text-white'
              : 'border-gray-300 dark:border-gray-600 text-transparent'
          }`}
          aria-label={selected ? 'Deselect transaction' : 'Select transaction'}
        >
          ✓
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">{typeIcons[transaction.type]}</span>
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                  {transaction.merchant || transaction.category}
                </h3>
                {transaction.recurring?.enabled && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Recurring
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {transaction.category}
                {transaction.subcategory ? ` · ${transaction.subcategory}` : ''}
              </p>
            </div>

            <div className={`text-right font-bold text-lg ${amountStyles[transaction.type]}`}>
              {amountPrefix}${Number(transaction.amount).toFixed(2)}
            </div>
          </div>

          {(transaction.notes || (transaction.tags && transaction.tags.length > 0)) && (
            <div className="mt-3 space-y-2">
              {transaction.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {transaction.notes}
                </p>
              )}
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {transaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{dayjs(transaction.date).format('MMM D, YYYY')}</span>
            {transaction.time && <span>{transaction.time}</span>}
            {transaction.paymentMethod && <span>{transaction.paymentMethod}</span>}
            {transaction.attachments && transaction.attachments.length > 0 && <span>{transaction.attachments.length} attachment(s)</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 opacity-100 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(transaction)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                Edit
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(transaction._id)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                Duplicate
              </button>
            )}
            {onArchive && (
              <button
                type="button"
                onClick={() => onArchive(transaction._id)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                Archive
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(transaction._id)}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-300"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
