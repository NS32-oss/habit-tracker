"use client"

import { useState, useEffect } from "react"
import { MobileNav, type TabType } from "@/components/mobile-nav"
import { HomeScreen } from "@/components/screens/home-screen"
import { AnalyticsScreen } from "@/components/screens/analytics-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"
import { JourneyView } from "@/components/screens/journey-view"
import { DailyHabitsScreen } from "@/components/screens/daily-habits-screen"
import { AddHabitFlow } from "@/components/add-habit-flow"
import { AuthScreen } from "@/components/auth-screen"
import { AnimatePresence, motion } from "framer-motion"
import { habitAPI, isAuthenticated } from "@/lib/api"
import { AppHeader } from "@/components/app-header"

export default function HabitTracker() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window === 'undefined') return 'home'
    const saved = localStorage.getItem('activeTab')
    return (saved as TabType) || 'home'
  })
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isAuth, setIsAuth] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Save active tab to localStorage whenever it changes
    localStorage.setItem('activeTab', activeTab)
  }, [activeTab])

  useEffect(() => {
    // Check authentication on mount (client-side only)
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated()
        setIsAuth(authenticated)
        
        // If authenticated, optionally verify with server in background
        if (authenticated) {
          try {
            await habitAPI.getAll()
          } catch (error) {
            // If verification fails, clear tokens
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setIsAuth(false)
          }
        }
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleAddHabit = async () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setIsAuth(false)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐱</div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <AuthScreen onSuccess={() => setIsAuth(true)} />
  }

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/20">
      <AppHeader />
      <div className="max-w-7xl mx-auto pb-20 lg:pb-8 relative">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HomeScreen key={refreshKey} />
            </motion.div>
          )}
          {activeTab === "journey" && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <JourneyView />
            </motion.div>
          )}
          {activeTab === "daily" && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DailyHabitsScreen />
            </motion.div>
          )}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsScreen />
            </motion.div>
          )}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileScreen />
            </motion.div>
          )}
          {activeTab === "habits" && (
            <motion.div
              key="habits"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[80vh] px-10 text-center"
            >
              <div className="glass p-10 rounded-[3rem]">
                <div className="text-6xl mb-4">💤</div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Habits List</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">Sorting your habits into cute piles...</p>
              </div>
            </motion.div>
          )}
          {!['home', 'journey', 'analytics', 'profile', 'habits', 'daily'].includes(activeTab) && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[80vh] px-10 text-center"
            >
              <div className="glass p-10 rounded-[3rem]">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Coming Soon!</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">Still napping... Check back soon!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Add Button */}
        {activeTab === 'home' && (
          <motion.button
            onClick={() => setIsAddOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-linear-to-br from-purple-400 to-pink-400 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-40 hover:scale-110 transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            +
          </motion.button>
        )}

        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence>
          {isAddOpen && <AddHabitFlow isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={handleAddHabit} />}
        </AnimatePresence>
      </div>
    </main>
  )
}
