import dotenv from 'dotenv'

dotenv.config()

export const config = {
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_change_in_production',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
}
