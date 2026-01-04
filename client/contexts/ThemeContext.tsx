'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check localStorage first
    const stored = localStorage.getItem('theme')
    if (stored) {
      const dark = stored === 'dark'
      setIsDark(dark)
      applyTheme(dark)
    } else {
      // Check system preference
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(dark)
      applyTheme(dark)
    }
  }, [])

  const applyTheme = (dark: boolean) => {
    if (dark) {
      // ✅ FIX #13: Ensure both add and remove are called to toggle properly
      document.documentElement.classList.add('dark')
      // Update CSS variables for dark mode
      document.documentElement.style.setProperty('--bg-primary', '#1f2937')
      document.documentElement.style.setProperty('--bg-secondary', '#111827')
      document.documentElement.style.setProperty('--bg-tertiary', '#0f1419')
      document.documentElement.style.setProperty('--text-primary', '#f3f4f6')
      document.documentElement.style.setProperty('--text-secondary', '#d1d5db')
    } else {
      // ✅ FIX #13: Ensure both add and remove are called to toggle properly
      document.documentElement.classList.remove('dark')
      // Update CSS variables for light mode
      document.documentElement.style.setProperty('--bg-primary', '#fafafa')
      document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5')
      document.documentElement.style.setProperty('--bg-tertiary', '#efefef')
      document.documentElement.style.setProperty('--text-primary', '#1f2937')
      document.documentElement.style.setProperty('--text-secondary', '#6b7280')
    }
  }

  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    applyTheme(newIsDark)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
