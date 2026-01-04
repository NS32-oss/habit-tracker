# 🚀 Quick Start Guide - HabbitTracker

Get HabbitTracker up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Git installed

## Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/HabbitTracker.git
cd HabbitTracker
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habbittracker?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development" > .env

# Start backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Setup Frontend (New Terminal)

```bash
cd client

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the App

Open your browser and go to: **http://localhost:3000**

## First Time Usage

1. **Register a new account**
   - Enter username, email, and password
   - Click "Sign Up"

2. **Create your first habit**
   - Click the "+" button
   - Fill in habit name, emoji, and frequency
   - Choose color
   - Click "Create Habit"

3. **Track your habit**
   - Click the checkbox on the habit card
   - Watch your streak grow!

4. **Explore features**
   - **Grid View**: See your habits in a grid
   - **Journey**: Timeline view of your progress
   - **Challenges**: Create time-based challenges
   - **Analytics**: View detailed statistics
   - **Profile**: Edit preferences and enable dark mode

## API Endpoints

All endpoints require authentication (JWT token in Authorization header).

### Auth
```
POST   /api/v1/auth/register      - Register new user
POST   /api/v1/auth/login         - Login user
POST   /api/v1/auth/logout        - Logout
GET    /api/v1/auth/profile       - Get user profile
POST   /api/v1/auth/refresh       - Refresh token
```

### Habits
```
GET    /api/v1/habits             - Get all habits
POST   /api/v1/habits             - Create habit
PUT    /api/v1/habits/:id         - Update habit
DELETE /api/v1/habits/:id         - Delete habit
POST   /api/v1/habits/:id/logs/toggle  - Toggle completion
```

### Analytics
```
GET    /api/v1/analytics/summary  - Dashboard summary
GET    /api/v1/analytics/today    - Today's stats
GET    /api/v1/analytics/habit/:id - Habit analytics
```

### Cat
```
GET    /api/v1/cat/mood           - Get cat mood
GET    /api/v1/cat/stats          - Get cat stats
```

## Testing with Postman

1. Import the provided Postman collection (if available)
2. Or create requests manually:

```json
POST http://localhost:5000/api/v1/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

## Troubleshooting

### Backend won't start
- Check MongoDB URI is correct
- Ensure port 5000 is available
- Check Node.js version: `node --version`

### Frontend shows 404 errors
- Ensure backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache and restart

### Can't login
- Check MongoDB connection
- Verify user was created successfully
- Check JWT_SECRET is set

### Dark mode not working
- Clear browser cache
- Check localStorage is enabled
- Try a different browser

## Environment Variables

### Backend (.env)
```
MONGODB_URI=     # MongoDB connection string (required)
JWT_SECRET=      # Secret key for JWT tokens (required)
PORT=            # Server port (default: 5000)
NODE_ENV=        # development or production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=  # Backend API URL (required)
```

## Development Tips

### Enable Debug Logging
```javascript
// In backend: add console.logs in controllers
// In frontend: use React DevTools extension
```

### Use MongoDB Compass
- Connect to your MongoDB URI
- View and edit data directly
- Test queries

### Test API Endpoints
```bash
# Using curl
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Using Postman
# Create a new request and set token in Authorization tab
```

## File Structure Reminder

```
HabbitTracker/
├── server/          # Express.js backend
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── server.js
├── client/          # Next.js frontend
│   ├── app/
│   ├── components/
│   └── lib/
└── docs/           # Documentation
    ├── README.md
    ├── GITHUB_SETUP.md
    └── DEPLOYMENT.md
```

## Next Steps

1. **Customize the app**
   - Change colors in `client/tailwind.config.js`
   - Modify habit frequencies
   - Add new habit fields

2. **Deploy to production**
   - Follow `DEPLOYMENT.md`
   - Setup MongoDB Atlas
   - Deploy to Vercel + Railway

3. **Add features**
   - Friend challenges
   - Email notifications
   - Habit templates
   - Advanced analytics

4. **Join the community**
   - Star the repository
   - Open issues for bugs
   - Submit pull requests

## Performance Tips

- Backend runs on port 5000
- Frontend runs on port 3000
- MongoDB should be in the same region as backend
- Use Chrome DevTools to profile frontend

## Security Reminders

- ❌ Never commit `.env` files
- ❌ Never share JWT_SECRET
- ❌ Never commit passwords or API keys
- ✅ Use strong passwords
- ✅ Enable CORS only for your domain
- ✅ Use HTTPS in production

## Support

Need help? Check these files:
- **README.md** - Full documentation
- **DEPLOYMENT.md** - Production setup
- **GITHUB_SETUP.md** - GitHub guide
- **PROJECT_SUMMARY.md** - Technical overview
- **FEATURES_DOCUMENTATION.md** - Feature details

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**That's it!** You now have HabbitTracker running locally. 🎉

Start building better habits today! 🐱
