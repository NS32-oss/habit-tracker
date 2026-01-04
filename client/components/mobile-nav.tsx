'use client'

import { motion } from 'framer-motion'

export type TabType = 'home' | 'journey' | 'analytics' | 'profile' | 'habits' | 'daily'

interface MobileNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const mainTabs = [
    { id: 'home' as TabType, icon: '🏠', label: 'Home' },
    { id: 'daily' as TabType, icon: '📅', label: 'Daily' },
    { id: 'journey' as TabType, icon: '🗺️', label: 'Journey' },
    { id: 'analytics' as TabType, icon: '📊', label: 'Stats' },
    { id: 'profile' as TabType, icon: '👤', label: 'Profile' },
  ]

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="flex justify-around items-center relative">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
