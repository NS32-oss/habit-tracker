'use client'

import { motion } from 'framer-motion'
import { TaskFilterType, TaskSortType } from '@/components/screens/todo-screen'

interface TaskFiltersProps {
  activeFilter: TaskFilterType
  onFilterChange: (filter: TaskFilterType) => void
  activeSort: TaskSortType
  onSortChange: (sort: TaskSortType) => void
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function TaskFilters({
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: TaskFiltersProps) {
  const filterOptions: { id: TaskFilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'today', label: 'Today', icon: '☀️' },
    { id: 'upcoming', label: 'Upcoming', icon: '📅' },
    { id: 'overdue', label: 'Overdue', icon: '⚠️' },
    { id: 'high-priority', label: 'High Priority', icon: '🔥' },
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'pinned', label: 'Pinned', icon: '📌' },
    { id: 'favorites', label: 'Favorites', icon: '⭐' },
  ]

  const sortOptions: { id: TaskSortType; label: string }[] = [
    { id: 'dueDate', label: 'Due Date' },
    { id: 'priority', label: 'Priority' },
    { id: 'created', label: 'Newest' },
    { id: 'alphabetical', label: 'A-Z' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.icon} {filter.label}
          </motion.button>
        ))}
      </div>

      {/* Sort and Category Controls */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as TaskSortType)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm font-medium"
        >
          <option disabled>Sort by...</option>
          {sortOptions.map((sort) => (
            <option key={sort.id} value={sort.id}>
              {sort.label}
            </option>
          ))}
        </select>

        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}
      </div>
    </motion.div>
  )
}
