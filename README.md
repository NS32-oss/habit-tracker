# 🐱 HabbitTracker - Purrfect Habit Tracking

A full-stack habit tracking application with a cute cat mascot companion. Build better habits while your digital cat keeps you motivated!

## 🎯 Features

- **Habit Management** - Create, track, and manage daily habits with customizable schedules
- **Smart Streaks** - Automatic streak calculation that skips non-scheduled days
- **Challenges** - Create time-based challenges with progress tracking
- **Analytics** - Comprehensive analytics with completion rates and mood tracking
- **Cat Companion** - Interactive cat mascot that changes mood based on your progress
- **Dark Mode** - Beautiful dark theme support
- **Responsive Design** - Works seamlessly on mobile and desktop

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with httpOnly cookies
- **Validation**: Zod validation framework
- **Date Handling**: Dayjs with UTC normalization

### Frontend
- **Framework**: Next.js 16.0.10 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom React components

## 📋 Architecture

### API Versioning
All endpoints use `/api/v1/` prefix for future versioning support.

**Available Routes:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/habits` - Get all habits
- `POST /api/v1/habits` - Create habit
- `PUT /api/v1/habits/:id` - Update habit
- `DELETE /api/v1/habits/:id` - Delete habit
- `POST /api/v1/habits/:id/logs/toggle` - Toggle habit completion
- `GET /api/v1/analytics/summary` - Dashboard summary stats
- `GET /api/v1/analytics/today` - Today's stats
- `GET /api/v1/analytics/habit/:id` - Habit analytics with period validation
- `GET /api/v1/challenges` - Get challenges
- `POST /api/v1/challenges` - Create challenge
- `GET /api/v1/cat/mood` - Get cat mood (active habits only)
- `GET /api/v1/cat/stats` - Get cat statistics

### Data Models

**Habit**
```javascript
{
  userId: ObjectId,
  name: String,
  description: String,
  emoji: String,
  color: String,
  frequency: 'daily' | 'weekly' | 'custom',
  customDays: [Number], // 0-6 (Sun-Sat)
  skipNonScheduledDays: Boolean,
  targetPerWeek: Number,
  isActive: Boolean,
  createdAt: Date
}
```

**HabitLog**
```javascript
{
  userId: ObjectId,
  habitId: ObjectId,
  date: String, // YYYY-MM-DD format (UTC)
  completed: Boolean,
  mood: String,
  notes: String,
  createdAt: Date
}
```

**Challenge**
```javascript
{
  userId: ObjectId,
  habitId: ObjectId,
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  expectedDaysCount: Number,
  completedDaysCount: Number,
  lastToggleDate: String, // Prevents double-counting
  completionRate: Number,
  status: 'active' | 'completed' | 'failed',
  createdAt: Date
}
```

## 🔐 Security Features

- **JWT Tokens**
  - Access Token: 60 minutes (in-memory in React)
  - Refresh Token: 7 days (secure httpOnly cookies)
- **httpOnly Cookies** - Refresh tokens stored securely, inaccessible to XSS
- **Server-Side Validation** - All inputs validated on backend
- **Password Hashing** - Bcrypt password hashing
- **CORS Protection** - Configured for secure cross-origin requests

## 🗄 Database Indexes

Optimized MongoDB queries with these compound indexes:
- `{userId, habitId, date}` - Fast habit log lookups
- `{userId, isActive}` - Quick active habits retrieval
- `{userId, habitId}` - Challenge progress updates

## 📊 Recent Improvements (21 Fixes Applied)

### Security & Authentication
✅ JWT storage using httpOnly cookies for refresh tokens
✅ Access token lifetime increased to 60 minutes
✅ Secure logout flow with cookie clearing

### Data Integrity
✅ All dates standardized to YYYY-MM-DD UTC format
✅ Proper database schema validation
✅ MongoDB indexes for performance

### Business Logic
✅ Correct streak calculation (skips non-scheduled days)
✅ Habit frequency validation (prevents off-schedule toggles)
✅ Challenge double-count prevention (one completion per day)
✅ Smart period validation for analytics (7/14/30/60/90 days)

### API Design
✅ API versioning with /api/v1/ prefix
✅ Split analytics endpoints (summary, today, habit-specific)
✅ Server-side period validation
✅ Proper error handling and HTTP status codes

### User Experience
✅ Optimistic UI updates with rollback on error
✅ Dark mode toggle fix
✅ Email masking in profile
✅ Navigation tabs optimized (5 main + overflow menu)
✅ Cat mood based on active habits only

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/HabbitTracker.git
cd HabbitTracker
```

2. **Set up environment variables**

**Server (.env)**
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Client (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

3. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

4. **Start the development servers**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

5. **Open the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1

## 📁 Project Structure

```
HabbitTracker/
├── server/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middlewares/       # Auth & error handling
│   │   ├── utils/             # JWT, helpers
│   │   └── server.js          # Express setup
│   ├── package.json
│   └── .env
├── client/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── lib/                   # Utilities & API client
│   ├── public/                # Static assets
│   ├── package.json
│   └── .env.local
├── FEATURES_DOCUMENTATION.md  # Detailed feature guide
└── README.md                  # This file
```

## 🧪 Testing

To test the application:

1. Create a user account (register screen)
2. Add habits with different frequencies (daily, custom days)
3. Toggle habit completion for today
4. Check streak calculation on the journey view
5. Create challenges and complete habits
6. View analytics with different time periods
7. Observe cat mood changes based on completion rate

## 🐛 Known Issues & Solutions

### Issue: API 404 errors
**Solution**: Ensure backend is running on port 5000 and frontend API URL is set to `http://localhost:5000/api/v1`

### Issue: MongoDB connection errors
**Solution**: Verify MongoDB URI in server .env file and ensure network access is allowed

### Issue: Dark mode not toggling
**Solution**: Ensure ThemeContext provider is wrapping the app and cookies/localStorage are enabled

## 📈 Future Enhancements

- [ ] Social features (friend challenges, leaderboards)
- [ ] Advanced analytics with charts
- [ ] Habit templates & recommendations
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Custom habit icons
- [ ] Backup & export functionality
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created with 💜 by the HabbitTracker Team

## 📧 Support

For support, email support@habbittracker.com or open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: January 2, 2026  
**Status**: Production Ready ✅
