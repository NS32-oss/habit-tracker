import React from 'react'
import { Logo } from './logo'

interface AppHeaderProps {
  title?: string
  showLogo?: boolean
}

export function AppHeader({ title = 'Purrfect Habits', showLogo = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
        {showLogo && <Logo size="md" />}
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
    </header>
  )
}
