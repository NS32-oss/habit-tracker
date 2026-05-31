'use client'

import { motion } from 'framer-motion'

export type ExpenseSortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category'
export type ExpenseTypeFilter = 'all' | 'income' | 'expense' | 'recurring'

interface ExpenseFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: ExpenseTypeFilter
  onTypeFilterChange: (value: ExpenseTypeFilter) => void
  sortBy: ExpenseSortType
  onSortChange: (value: ExpenseSortType) => void
  category: string
  onCategoryChange: (value: string) => void
  paymentMethod: string
  onPaymentMethodChange: (value: string) => void
  categories: string[]
  paymentMethods: string[]
}

export function ExpenseFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortChange,
  category,
  onCategoryChange,
  paymentMethod,
  onPaymentMethodChange,
  categories,
  paymentMethods,
}: ExpenseFiltersProps) {
  const typeOptions: { id: ExpenseTypeFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🧾' },
    { id: 'income', label: 'Income', icon: '↗️' },
    { id: 'expense', label: 'Expense', icon: '↙️' },
    { id: 'recurring', label: 'Recurring', icon: '🔁' },
  ]

  const sortOptions: { id: ExpenseSortType; label: string }[] = [
    { id: 'date-desc', label: 'Newest' },
    { id: 'date-asc', label: 'Oldest' },
    { id: 'amount-desc', label: 'Highest Amount' },
    { id: 'amount-asc', label: 'Lowest Amount' },
    { id: 'category', label: 'Category' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex gap-3 flex-col lg:flex-row">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search amount, category, merchant, notes, tags..."
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-900/40"
        />
        <div className="grid grid-cols-2 gap-3 lg:w-[360px]">
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as ExpenseSortType)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={paymentMethod}
            onChange={(event) => onPaymentMethodChange(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Payment Methods</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <motion.button
            key={option.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onTypeFilterChange(option.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              typeFilter === option.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  )
}
