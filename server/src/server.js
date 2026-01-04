import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'
import streakRoutes from './routes/streaks.js'
import challengeRoutes from './routes/challenges.js'
import analyticsRoutes from './routes/analytics.js'
import catRoutes from './routes/cat.js'
import dayNoteRoutes from './routes/dayNotes.js'
import { errorHandler } from './middlewares/errorHandler.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // allow non-browser tools
    if (allowedOrigins.includes(origin) || /vercel\.app$/.test(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(cookieParser())

// Connect to MongoDB
await connectDB()

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Routes
// ✅ FIX #17: Add /api/v1 versioning prefix
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/habits', habitRoutes)
app.use('/api/v1/streaks', streakRoutes)
app.use('/api/v1/challenges', challengeRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/cat', catRoutes)
app.use('/api/v1/day-notes', dayNoteRoutes)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
