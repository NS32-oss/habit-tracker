import axios from 'axios'

// ✅ FIX #17: Updated API base URL to use /api/v1/ versioning
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false
  }
  return !!localStorage.getItem('accessToken')
}

export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post('/auth/register', { email, username, password })
    const { user, accessToken, refreshToken } = response.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { user, accessToken, refreshToken } = response.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword })
    return response.data
  },

  changeUsername: async (username: string) => {
    const response = await api.post('/auth/change-username', { username })
    return response.data
  },
}

export const habitAPI = {
  getAll: async (activeOnly = true, date?: string) => {
    const response = await api.get('/habits', { params: { isActive: activeOnly, date } })
    return response.data
  },

  getById: async (habitId: string) => {
    const response = await api.get(`/habits/${habitId}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/habits', data)
    return response.data
  },

  update: async (habitId: string, updates: any) => {
    const response = await api.put(`/habits/${habitId}`, updates)
    return response.data
  },

  delete: async (habitId: string) => {
    const response = await api.delete(`/habits/${habitId}`)
    return response.data
  },

  getLogs: async (habitId: string, startDate: string, endDate: string) => {
    const response = await api.get(`/habits/${habitId}/logs`, { params: { startDate, endDate } })
    return response.data
  },

  toggleLog: async (habitId: string, date: string) => {
    const response = await api.post(`/habits/${habitId}/logs/toggle`, { date })
    return response.data
  },

  logHabit: async (habitId: string, date: string, completed: boolean, notes?: string) => {
    const response = await api.put(`/habits/${habitId}/logs`, { 
      date, 
      completed,
      notes: notes || ''
    })
    return response.data
  },

  complete: async (habitId: string, date?: string) => {
    const response = await api.post(`/habits/${habitId}/logs`, { date, completed: true })
    return response.data
  },
}

export const challengeAPI = {
  getAll: async () => {
    const response = await api.get('/challenges')
    return response.data
  },

  getById: async (challengeId: string) => {
    const response = await api.get(`/challenges/${challengeId}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/challenges', data)
    return response.data
  },

  update: async (challengeId: string, updates: any) => {
    const response = await api.put(`/challenges/${challengeId}`, updates)
    return response.data
  },

  delete: async (challengeId: string) => {
    const response = await api.delete(`/challenges/${challengeId}`)
    return response.data
  },
}

export const analyticsAPI = {
  // ✅ FIX #9: Updated endpoints to match new split analytics endpoints
  getDashboardSummary: async () => {
    const response = await api.get('/analytics/summary')
    return response.data
  },

  getTodayStats: async () => {
    const response = await api.get('/analytics/today')
    return response.data
  },

  getAnalytics: async (period = 30) => {
    const response = await api.get('/analytics', { params: { period } })
    return response.data
  },

  getHabitAnalytics: async (habitId: string, period = 30) => {
    const response = await api.get(`/analytics/habit/${habitId}`, { params: { period } })
    return response.data
  },

  getDashboardStats: async () => {
    const response = await api.get('/analytics')
    return response.data
  },
}

export const dayNotesAPI = {
  getRange: async (start: string, end: string) => {
    const response = await api.get('/day-notes', { params: { start, end } })
    return response.data as { date: string; note: string }[]
  },
  upsert: async (date: string, note: string) => {
    const response = await api.put('/day-notes', { date, note })
    return response.data as { date: string; note: string }
  },
}

export const catAPI = {
  getMood: async () => {
    const response = await api.get('/cat/mood')
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/cat/stats')
    return response.data
  },
}

export default api
