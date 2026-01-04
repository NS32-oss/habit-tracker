'use client'

import { useState } from 'react'
import { authAPI } from '@/lib/api'
import { motion } from 'framer-motion'

interface AuthScreenProps {
  onSuccess: () => void
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const result = await authAPI.login(email, password)
      } else {
        const result = await authAPI.register(email, username, password)
      }
      // Wait a moment before calling onSuccess to allow state updates
      setTimeout(() => {
        onSuccess()
      }, 100)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Authentication failed'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🐱
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Purrfect Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Build better habits with your cute cat companion
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isLogin ? 'Email or Username' : 'Email'}
              </label>
              <input
                type={isLogin ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={isLogin ? 'email or username' : 'your@email.com'}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="username"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
