'use client'

import { motion } from 'framer-motion'

export type TabType = 'home' | 'todo' | 'finance' | 'profile' | 'habits' | 'daily'

interface MobileNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const mainTabs = [
    { id: 'home' as TabType, icon: '🏠', label: 'Home' },
    { id: 'daily' as TabType, icon: '📅', label: 'Daily' },
    { id: 'todo' as TabType, icon: '✅', label: 'To-Do' },
    { id: 'finance' as TabType, icon: '💳', label: 'Finance' },
    { id: 'profile' as TabType, icon: '👤', label: 'Profile' },
  ]

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/80 bg-white/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur dark:border-gray-700/80 dark:bg-gray-900/95"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-7xl px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <div className="grid grid-cols-5 items-end gap-1">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-2xl px-1.5 py-2 text-center transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-lg leading-none sm:text-xl">{tab.icon}</span>
              <span className="truncate text-[10px] font-semibold leading-none sm:text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
