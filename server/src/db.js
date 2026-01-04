import mongoose from 'mongoose'
import { config } from './config.js'

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri)
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}
