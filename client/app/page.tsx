"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MobileNav, type TabType } from "@/components/mobile-nav"
import { HomeScreen } from "@/components/screens/home-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"
import { ToDoScreen } from "@/components/screens/todo-screen"
import { ExpenseTrackerScreen as FinanceScreen } from "@/components/screens/expense-tracker-screen"
import { DailyHabitsScreen } from "@/components/screens/daily-habits-screen"
import { AddHabitFlow } from "@/components/add-habit-flow"
import { AuthScreen } from "@/components/auth-screen"
import { AnimatePresence, motion } from "framer-motion"
import { habitAPI, isAuthenticated } from "@/lib/api"

export default function HabitTracker() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isAuth, setIsAuth] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    // Save active tab to localStorage whenever it changes
    localStorage.setItem('activeTab', activeTab)
  }, [activeTab])

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab')
    if (savedTab === 'analytics' || savedTab === 'expense') {
      setActiveTab('finance')
      return
    }
    if (savedTab && ['home', 'todo', 'daily', 'finance', 'profile', 'habits'].includes(savedTab)) {
      setActiveTab(savedTab as TabType)
    }
  }, [])

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

  if (!hasMounted) {
    return null
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl shadow-lg">
            <Image src="/logo.png" alt="Orbit logo" width={64} height={64} className="h-full w-full object-cover" />
          </div>
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
      <div className="page-shell min-h-screen pb-20 lg:pb-8 relative">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HomeScreen key={refreshKey} onNavigate={setActiveTab} />
            </motion.div>
          )}
          {activeTab === "todo" && (
            <motion.div
              key="todo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ToDoScreen key={refreshKey} />
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
          {activeTab === "finance" && (
            <motion.div
              key="finance"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <FinanceScreen />
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
                <div className="text-6xl mb-4">🗂️</div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Habit Archive</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">This section is reserved for legacy habit organization.</p>
              </div>
            </motion.div>
          )}
          {!['home', 'todo', 'finance', 'profile', 'habits', 'daily'].includes(activeTab) && (
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
