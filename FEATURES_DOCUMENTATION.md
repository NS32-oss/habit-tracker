# 🐱 **Habbit Tracker - Comprehensive Feature Documentation**

> **Version:** 1.0.0 | **Last Updated:** January 2, 2026 | **Status:** Production Ready

---

## **TABLE OF CONTENTS**
1. [Authentication System](#1-authentication-system)
2. [Habit Creation & Management](#2-habit-creation--management)
3. [Daily Habit Tracking](#3-daily-habit-tracking)
4. [Home Dashboard](#4-home-dashboard)
5. [Grid View Calendar](#5-grid-view-monthly-calendar)
6. [Journey & Milestones](#6-journey-view-milestone-timeline)
7. [Challenge System](#7-challenge-system)
8. [Analytics Dashboard](#8-analytics-screen)
9. [Habit Detail Modal](#9-habit-detail-modal)
10. [Cat Mascot](#10-cat-mascot-dynamic-companion)
11. [Dark Mode](#11-dark-mode-toggle)
12. [Streak Tracking](#12-streak-tracking-system)
13. [User Profile](#13-user-profile-screen)
14. [Navigation](#14-navigation-system)
15. [Performance & Optimization](#15-performance--optimization)
16. [Security Features](#16-security-features)
17. [Data Models](#17-data-models)
18. [API Specifications](#18-api-specifications)
19. [Error Handling](#19-error-handling)
20. [Testing & Validation](#20-testing--validation)

---

## **1. AUTHENTICATION SYSTEM**

**Dual-token JWT strategy**: Access token (60m, in-memory) + Refresh token (7d, httpOnly cookie)

**Registration/Login Flow:**
1. User submits credentials
2. Password hashed with bcrypt (10 rounds)
3. Server generates access token + refresh token
4. Access token returned in response body → stored in React state
5. Refresh token returned via httpOnly cookie (XSS safe)
6. On token expiry, axios interceptor auto-refreshes

**Key Security:**
- ✅ Access tokens never in localStorage (XSS protected)
- ✅ Refresh tokens in httpOnly cookies (CSRF safe)
- ✅ Automatic token rotation
- ✅ Passwords never sent in responses

---

## **2. HABIT CREATION & MANAGEMENT**

**3-Step Wizard Modal:**
1. **Name & Description** - Max 50 chars
2. **Appearance** - Pick emoji (12 options) + color (8 pastels)
3. **Frequency** - Daily or Custom (specific days)

**Data Model:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  emoji: String,
  color: String (#hex),
  frequency: "daily" | "custom",
  customDays: Array<Number>, // [0-6] = Sun-Sat
  isActive: Boolean,
  createdAt: Date (UTC),
  updatedAt: Date (UTC)
}
```

**Frequency Validation:**
- **Daily**: Can toggle any day
- **Custom Days**: Only selected weekdays can be toggled (server-side validation returns 400 if off-schedule)

**Features:**
- ✅ Edit habit details after creation
- ✅ Toggle active/inactive status
- ✅ Delete habit with all logs
- ✅ Reorder habits via drag-and-drop

---

## **3. DAILY HABIT TRACKING**

**Toggle Flow:**
1. Click checkbox → Optimistic UI update (immediate visual feedback)
2. API POST with date (YYYY-MM-DD string, UTC)
3. Server validates: date scheduled? Not in future? 
4. Updates HabitLog in MongoDB
5. Recalculates streak → Returns success/error
6. Frontend confirms or rolls back

**HabitLog Schema:**
```javascript
{
  userId: ObjectId,
  habitId: ObjectId,
  date: String, // "YYYY-MM-DD" (regex validated)
  completed: Boolean,
  createdAt: Date (UTC)
}
// Index: { userId, habitId, date } - UNIQUE
```

**Timezone-Safe Dates:**
```javascript
// Use UTC string format everywhere
import dayjs from 'dayjs'
const date = dayjs.utc().format('YYYY-MM-DD') // "2026-01-02"
// Never use raw Date objects (timezone dependent)
```

**Optimistic UI Rollback:**
- Backup state before API call
- If error: restore previous state + show error toast
- Error scenarios: habit not scheduled, date in future, etc.

**Real-time Updates:**
- ✅ Checkbox state changes
- ✅ Heatmap color updates
- ✅ Streak counter updates
- ✅ Dashboard stats recalculate
- ✅ Cat mood changes

---

## **4. HOME DASHBOARD**

### 4.1 **Overview**
The home dashboard is the primary screen users see after login. It displays today's progress, habit cards, and real-time statistics. The dashboard updates in real-time as habits are completed.

### 4.2 **Dashboard Layout**

```
┌─────────────────────────────────────────┐
│        HABBIT TRACKER (Header)          │
├─────────────────────────────────────────┤
│                                         │
│     TODAY'S STATS (Sticky Top)          │
│  ┌─────────────────────────────────┐   │
│  │ 📅 Wednesday, January 2         │   │
│  │ ✓ Completion: 75% (6 of 8)      │   │
│  │ 📊 Active Habits: 8             │   │
│  │ 🔥 Avg Streak: 12 days         │   │
│  └─────────────────────────────────┘   │
│                                         │
│     CAT MASCOT (Center)                │
│  ┌─────────────────────────────────┐   │
│  │         😸 Happy Cat!           │   │
│  │       Happiness: ████░ 80%      │   │
│  │   "Keep up the good work! ✨"   │   │
│  └─────────────────────────────────┘   │
│                                         │
│     HABIT CARDS (Scrollable)           │
│  ┌─────────────────────────────────┐   │
│  │ 🏃 Morning Jog                  │   │
│  │ ☑ ┬─────────────────────┐ 7🔥  │   │
│  │   │ Sun Mon Tue Wed Thu │       │   │
│  │   │  ○   ●   ●   ●   ●  │       │   │
│  │   └─────────────────────┘       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 💧 Drink Water                  │   │
│  │ ☑ ┬─────────────────────┐ 23🔥 │   │
│  │   │ Sun Mon Tue Wed Thu │       │   │
│  │   │  ●   ●   ●   ●   ●  │       │   │
│  │   └─────────────────────┘       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📚 Read 30 Minutes              │   │
│  │ ○ ┬─────────────────────┐ 0    │   │
│  │   │ Sun Mon Tue Wed Thu │       │   │
│  │   │  ●   ●   ○   ●   ○  │       │   │
│  │   └─────────────────────┘       │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  [+] Floating Action Button             │
│  (Creates new habit)                    │
└─────────────────────────────────────────┘

BOTTOM NAVIGATION BAR
┌──────┬──────┬──────┬──────┬──────┐
│🏠   │📅   │🗺️   │🏆   │📊   │
│Home │Grid │Map  │Chal │Stats │
└──────┴──────┴──────┴──────┴──────┘
```

### 4.3 **Today's Stats Component**

#### **Data Source**
```
GET /api/v1/analytics/today
Response:
{
  completedCount: 6,
  totalScheduled: 8,
  completionPercentage: 75,
  activeHabits: 8,
  averageStreak: 12.4
}
```

#### **Calculation Details**
```javascript
// Completion Rate
completionPercentage = (completedCount / totalScheduled) * 100

// Total Scheduled = habits with today in frequency
// Example: Mon-Fri habit on Wednesday = 1 scheduled

// Average Streak
averageStreak = (sum of all streaks) / (count of active habits)

// Active Habits = isActive === true
```

#### **Update Frequency**
- Recalculates every time habit is toggled
- Cached for 1 minute (performance optimization)
- Refetched when app returns to foreground

### 4.4 **Habit Card Component**

#### **Visual Structure**
```
┌────────────────────────────────┐
│ 🏃 Morning Jog                │
│ Checkbox: ☑                   │
│                               │
│ Mini Heatmap (14 days):      │
│ ○ ● ● ● ● ● ○ ○ ● ● ● ● ● ○│
│ T W T F S S M T W T F S S M T│
│                               │
│ Streak: 7 🔥                  │
│ Completion: 87%              │
└────────────────────────────────┘
```

#### **Card Data**
```javascript
{
  id: "507f1f77bcf86cd799439011",
  emoji: "🏃",
  name: "Morning Jog",
  isCompletedToday: true,
  currentStreak: 7,
  completionPercentage: 87,
  recentLogs: [
    { date: "2026-01-02", completed: true },
    { date: "2026-01-01", completed: true },
    { date: "2025-12-31", completed: false },
    ...
  ]
}
```

#### **Interactions**
- **Click checkbox**: Toggle completion
- **Long press card**: Edit habit
- **Swipe right**: Delete habit
- **Click heatmap**: View habit details

### 4.5 **Mini Heatmap (14-day)**

#### **Calculation**
```javascript
// Get last 14 days of logs
const today = dayjs.utc().format('YYYY-MM-DD')
const fourteenDaysAgo = dayjs.utc().subtract(13, 'days').format('YYYY-MM-DD')

const logs = await HabitLog.find({
  habitId,
  userId,
  date: { $gte: fourteenDaysAgo, $lte: today }
})

// Create array of last 14 days
const heatmapData = Array.from({ length: 14 }, (_, i) => {
  const date = dayjs.utc().subtract(13 - i, 'days')
  const log = logs.find(l => l.date === date.format('YYYY-MM-DD'))
  
  return {
    date: date.format('YYYY-MM-DD'),
    completed: log?.completed ?? null,
    scheduled: isDateScheduled(date)
  }
})
```

#### **Color Scheme**
- **Green** (#86efac): Day completed
- **Light Gray** (#e5e7eb): Day not completed but scheduled
- **Lighter Gray** (#f3f4f6): Unscheduled day
- **Transparent**: Future date

### 4.6 **Floating Action Button (FAB)**

#### **Behavior**
```
┌─────────────────────┐
│ [+] FAB (bottom-right)
│ • Always visible on home
│ • Pulses animation
│ • Scale on hover
│ • Click → Open habit creation modal
│ • 60px diameter circle
│ • Gradient background (lavender → mint)
└─────────────────────┘
```

#### **CSS Implementation**
```css
.fab {
  position: fixed;
  bottom: 80px; /* Above nav bar */
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c4b5fd, #99f6e4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.fab:active {
  transform: scale(0.95);
}
```

### 4.7 **Empty State**

When user has no habits:

```
┌─────────────────────────────────┐
│                                 │
│        No habits yet! 🌱        │
│                                 │
│   Create your first habit to   │
│   start tracking your goals     │
│                                 │
│          [+ New Habit]          │
│                                 │
└─────────────────────────────────┘
```

### 4.8 **Performance Optimizations**

- **Lazy loading**: Cards load as user scrolls
- **Memoization**: Habit card doesn't re-render unnecessarily
- **Debounced updates**: Stats update on 1-second debounce
- **Virtual scrolling**: For 100+ habits
- **Image optimization**: Emojis pre-cached

---

## **5. GRID VIEW (MONTHLY CALENDAR)**

### 5.1 **Overview**
The grid view displays a bird's-eye view of all habits across an entire month. Users can navigate between months and see patterns in their habit completion at a glance.

### 5.2 **Layout**

```
┌──────────────────────────────────────────┐
│      GRID VIEW - January 2026            │
├──────────────────────────────────────────┤
│                                          │
│  ← January 2026 →                       │
│                                          │
│  Sun Mon Tue Wed Thu Fri Sat            │
│   28  29  30  31   1   2   3            │
│                                          │
│  🏃 Morning Jog                          │
│  [●] [●] [ ] [●] [●] [●] [ ] ...       │
│                                          │
│  💧 Drink Water                          │
│  [●] [●] [●] [●] [●] [●] [●] ...       │
│                                          │
│  📚 Read 30min                          │
│  [●] [ ] [●] [ ] [●] [ ] [●] ...       │
│                                          │
│  🧘 Meditate                            │
│  [ ] [ ] [ ] [●] [●] [●] [ ] ...       │
│                                          │
│  💪 Gym                                 │
│  [●] [●] [●] [ ] [ ] [●] [●] ...       │
│                                          │
└──────────────────────────────────────────┘
```

### 5.3 **Navigation**

#### **Month Navigation**
```javascript
// State
const [viewingMonth, setViewingMonth] = useState(dayjs().startOf('month'))

// Previous month
const handlePrevMonth = () => {
  setViewingMonth(viewingMonth.subtract(1, 'month'))
}

// Next month (but not into future)
const handleNextMonth = () => {
  if (viewingMonth.isBefore(dayjs(), 'month')) {
    setViewingMonth(viewingMonth.add(1, 'month'))
  }
}

// Jump to today
const handleToday = () => {
  setViewingMonth(dayjs().startOf('month'))
}
```

#### **Month Display**
```
January 2026 (clickable → calendar picker)
↙️ Previous      Today      Next ➡️
(disabled if future)
```

### 5.4 **Grid Cell Formatting**

#### **Cell Types**
```javascript
// Completed day
<div className="bg-green-200 text-green-900">●</div>

// Incomplete day (scheduled)
<div className="bg-gray-100 text-gray-400">○</div>

// Unscheduled day (custom frequency)
<div className="bg-gray-50 text-gray-300">·</div>

// Future date
<div className="bg-white text-gray-200">◯</div>

// Previous month (faded)
<div className="bg-gray-50 text-gray-200 opacity-50">28</div>
```

#### **Responsive Grid**
```css
/* Desktop */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  
  .cell {
    font-size: 12px;
    padding: 4px;
  }
}
```

### 5.5 **Data Fetching**

#### **API Call**
```
GET /api/v1/analytics/habits/month?month=2026-01&habitId=xxx
```

#### **Response Structure**
```javascript
{
  year: 2026,
  month: 1,
  days: [
    {
      date: "2026-01-01",
      dayOfWeek: 4, // 0=Sun, 6=Sat
      habits: [
        {
          habitId: "xxx",
          name: "Morning Jog",
          completed: true,
          scheduled: true
        },
        {
          habitId: "yyy",
          name: "Drink Water",
          completed: true,
          scheduled: true
        }
      ]
    },
    ...
  ]
}
```

### 5.6 **Interactions**

- **Click cell**: Toggle habit for that day
- **Long press**: Show day details popup
- **Habit name click**: Filter/highlight that habit only
- **Swipe left/right**: Navigate months

### 5.7 **Performance Considerations**

- **Pre-load**: Load ±3 months of data on initial view
- **Virtual scrolling**: Habits list (for 100+ habits)
- **Memoization**: Grid cells don't re-render unnecessarily
- **Pagination**: Show 20 habits per page

---

## **6. JOURNEY VIEW (MILESTONE TIMELINE)**

### 6.1 **Purpose**
The journey view gamifies habit building by displaying milestone achievements. Users see their progress toward major milestones and get motivated to reach the next level.

### 6.2 **Milestone Thresholds**

```
Streak Days → Milestone
7 days       → 🌱 Seedling
14 days      → 🌿 Sprouting
21 days      → 🌳 Growing
30 days      → 🌲 Established
60 days      → 🔥 On Fire
90 days      → 💎 Diamond
100 days     → 👑 Legend
```

### 6.3 **Visual Timeline**

```
Your Journey So Far:
🌱  🌿  🌳  🌲  🔥  💎  👑
│   │   │   │   │   │   │
✓   ✓   ✓   ✓   ✓   ○   ○
1   2   3   4   5   6   7
7d  14d 21d 30d 60d 90d 100d

                ↑
            You are here!
            Currently: 47 day streak
            
Progress to next milestone: 60 days
Days remaining: 13 days 🎯
Motivation: "You're 78% of the way there!"
```

### 6.4 **Data Calculation**

```javascript
async function getMilestoneProgress(habitId, userId) {
  // Calculate current streak
  const currentStreak = await calculateCurrentStreak(habitId, userId)
  
  // Define milestones
  const milestones = [7, 14, 21, 30, 60, 90, 100]
  
  // Find current and next milestone
  const unlockedMilestones = milestones.filter(m => currentStreak >= m)
  const nextMilestone = milestones.find(m => m > currentStreak)
  
  const daysUntilNext = nextMilestone ? nextMilestone - currentStreak : null
  const percentToNext = nextMilestone 
    ? ((currentStreak - (milestones[milestones.indexOf(nextMilestone) - 1] || 0)) / (nextMilestone - (milestones[milestones.indexOf(nextMilestone) - 1] || 0))) * 100
    : 100
  
  return {
    currentStreak,
    unlockedMilestones,
    nextMilestone,
    daysUntilNext,
    percentToNext,
    motivationalMessage: generateMessage(currentStreak, nextMilestone)
  }
}
```

### 6.5 **Motivational Messages**

```javascript
const messages = {
  start: "You're just getting started! 🌱",
  quarter: "Great momentum! You're 25% of the way! 💪",
  halfway: "Halfway there! Keep it up! 🔥",
  threequarter: "Almost at the next milestone! 🎯",
  almost: "Just a few more days!",
  milestone: "🎉 Milestone unlocked! Celebrate your progress!",
  legend: "👑 You're a legend! This is an amazing achievement!"
}
```

### 6.6 **Habit-Specific Journeys**

Each habit has its own journey:

```
🏃 Morning Jog Journey:
🌱 ✓ - 🌿 ✓ - 🌳 ✓ - 🌲 ✓ - 🔥 ✓ - 💎 ○ - 👑 ○
Current: 47 days

📚 Reading Journey:
🌱 ✓ - 🌿 ✓ - 🌳 ○ - 🌲 ○ - 🔥 ○ - 💎 ○ - 👑 ○
Current: 16 days
```

### 6.7 **View Toggle**

Users can view:
- **All habits combined** (total completions)
- **Individual habit** (select from dropdown)
- **Category** (morning, evening, health, etc.)

---

## **7. CHALLENGE SYSTEM**

### 7.1 **Overview**
Challenges are time-bound goals for specific habits. Users create challenges with specific durations (7-90 days) and track their progress. Challenges add an element of urgency and gamification.

### 7.2 **Challenge Creation**

```
┌────────────────────────────────┐
│ NEW CHALLENGE                  │
├────────────────────────────────┤
│                                │
│ Select Habit:                  │
│ [Dropdown: Choose habit]        │
│ • 🏃 Morning Jog              │
│ • 💧 Drink Water               │
│ • 📚 Read                       │
│                                │
│ Challenge Duration:            │
│ ○ 7 days  ○ 14 days            │
│ ○ 21 days ◉ 30 days (selected) │
│ ○ 60 days ○ 90 days            │
│                                │
│ Description (optional):        │
│ [Text area]                    │
│ "Complete 30 morning jogs"     │
│                                │
│ [Cancel]  [Create Challenge]   │
│                                │
└────────────────────────────────┘
```

### 7.3 **Challenge Data Model**

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  habitId: ObjectId,
  
  // Details
  description: String,
  duration: Number, // 7, 14, 21, 30, 60, 90
  
  // Dates
  startDate: Date (UTC),
  endDate: Date (UTC),
  
  // Progress Tracking
  completedDaysCount: Number, // days completed in challenge
  expectedDaysCount: Number, // expected days based on frequency
  lastToggleDate: String (YYYY-MM-DD), // prevent same-day double-count
  
  // Status
  isCompleted: Boolean,
  completionPercentage: Number,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  
  // Index: { userId, habitId, status }
}
```

### 7.4 **Progress Tracking**

#### **Calculation**
```javascript
completionPercentage = (completedDaysCount / expectedDaysCount) * 100

// Example:
// Challenge duration: 30 days
// Habit frequency: Mon-Fri (5 days/week)
// expectedDaysCount = 22 days (weekdays in 30-day period)
// completedDaysCount = 18 days
// Percentage = (18 / 22) * 100 = 81.8%
```

#### **Double-Count Prevention**
```javascript
// Prevent same-day double-counting
if (log.date === challenge.lastToggleDate && log.completed) {
  // Don't increment progress again
  return
}

// Update lastToggleDate
challenge.lastToggleDate = log.date
challenge.completedDaysCount += 1
challenge.save()
```

### 7.5 **Challenge Card Display**

```
┌─────────────────────────────────┐
│ 🏃 Morning Jog Challenge        │
├─────────────────────────────────┤
│                                 │
│ Duration: 30 days               │
│ Started: Jan 1, 2026            │
│ Ends: Jan 31, 2026              │
│                                 │
│ Progress: 18/22 days (81%)      │
│ ████████░ 81%                   │
│                                 │
│ Days Remaining: 15 days         │
│ Status: On Track ✓              │
│                                 │
│ [Edit]  [Delete]  [Share]       │
│                                 │
└─────────────────────────────────┘
```

### 7.6 **Status Indicators**

```javascript
const getStatus = (progress, daysRemaining, endDate) => {
  if (isAfter(now(), endDate)) {
    if (progress === 100) return { status: 'Completed! 🎉', color: 'green' }
    return { status: 'Failed', color: 'red' }
  }
  
  if (progress >= 100) return { status: 'Completed ✓', color: 'green' }
  if (progress >= 80) return { status: 'On Track! 🔥', color: 'green' }
  if (progress >= 60) return { status: 'Good Progress', color: 'yellow' }
  if (progress >= 40) return { status: 'Needs Effort', color: 'orange' }
  return { status: 'Behind 😬', color: 'red' }
}
```

### 7.7 **Challenge Completion**

When challenge ends (naturally or by date):

```
┌─────────────────────────────────┐
│ 🎉 CHALLENGE COMPLETE!          │
├─────────────────────────────────┤
│                                 │
│ You completed the Morning Jog   │
│ 30-Day Challenge!               │
│                                 │
│ Final Score: 100%               │
│ Days Completed: 22/22           │
│                                 │
│ 🏆 +50 XP Earned               │
│ 🎖️ Achievement Unlocked        │
│                                 │
│ [Share Result] [New Challenge]  │
│                                 │
└─────────────────────────────────┘
```

### 7.8 **Challenge List View**

```
ACTIVE CHALLENGES (2)
┌─────────────────────┐
│ 🏃 Morning Jog (30d)│
│ Progress: 81%      │
└─────────────────────┘

┌─────────────────────┐
│ 💧 Water (7d)       │
│ Progress: 100% ✓   │
└─────────────────────┘

COMPLETED CHALLENGES (5)
┌─────────────────────┐
│ ✓ 📚 Reading (21d)  │
│ Completed: Jan 21   │
└─────────────────────┘
```

---

## **8. ANALYTICS DASHBOARD**

### 8.1 **Overview**
The analytics dashboard provides deep insights into habit performance. Users can analyze trends, identify patterns, and track overall progress with customizable time periods.

### 8.2 **Period Selector**

```
Time Period: [7 days ▼]

Options:
• 7 days   (last week)
• 14 days  (2 weeks)
• 30 days  (1 month) - DEFAULT
• 60 days  (2 months)
• 90 days  (3 months)
• Custom   (select date range)
```

### 8.3 **Overview Stats**

```
┌────────────────────────────────────┐
│ 📊 OVERVIEW STATS                  │
├────────────────────────────────────┤
│                                    │
│ Completion Rate:                  │
│ █████████░ 78.5%                  │
│ Completed 785 of 1000 scheduled    │
│                                    │
│ Daily Average:                     │
│ 6.2 habits/day                     │
│ (average habits completed daily)   │
│                                    │
│ Longest Streak:                    │
│ 23 days 🔥                         │
│ (across all habits)                │
│                                    │
│ Total Habits:                      │
│ 8 active                           │
│                                    │
│ Streaks Average:                   │
│ 12.4 days                          │
│ (mean of all current streaks)      │
│                                    │
└────────────────────────────────────┘
```

### 8.4 **Activity Chart**

#### **Chart Type**: Line Chart with Area Fill

```
Completion % Over Time (30 days)
100│     ╱╲         ╱╲
 80│    ╱  ╲   ╱╲  ╱  ╲
 60│   ╱    ╲╱  ╲╱    ╲
 40│  ╱                 ╲
 20│ ╱                   ╲
  0└─────────────────────────
    M T W T F S S M T W T F S
    Jan 2    Jan 9   Jan 16  Jan 23
```

#### **Data Points**
- X-axis: Days (past 7/14/30/60/90 days)
- Y-axis: Completion percentage (0-100%)
- Shaded area under line: Daily performance visualization
- Tooltip on hover: Shows exact percentage and date

#### **Calculation**
```javascript
const generateActivityChart = async (userId, period) => {
  const endDate = dayjs.utc()
  const startDate = endDate.subtract(period, 'days')
  
  // Get all habits for user
  const habits = await Habit.find({ userId, isActive: true })
  
  // For each day in period
  const dataPoints = []
  for (let i = period; i >= 0; i--) {
    const date = endDate.subtract(i, 'days')
    const dateStr = date.format('YYYY-MM-DD')
    
    // Count scheduled and completed habits
    let scheduled = 0
    let completed = 0
    
    for (const habit of habits) {
      if (isDateScheduled(habit, date)) {
        scheduled++
        const log = await HabitLog.findOne({ habitId: habit._id, date: dateStr })
        if (log?.completed) completed++
      }
    }
    
    const percentage = scheduled > 0 ? (completed / scheduled) * 100 : 0
    dataPoints.push({
      date: dateStr,
      percentage: Math.round(percentage),
      completed,
      scheduled
    })
  }
  
  return dataPoints
}
```

### 8.5 **Habit Performance Ranking**

```
┌─────────────────────────────────┐
│ 📈 HABIT PERFORMANCE            │
├─────────────────────────────────┤
│                                 │
│ 1. 💧 Drink Water      95% ✨  │
│    ████████████░       38/40   │
│                                 │
│ 2. 🏃 Morning Jog      87% 🔥  │
│    █████████░          26/30   │
│                                 │
│ 3. 📚 Read 30min       72%     │
│    ████████░           21/29   │
│                                 │
│ 4. 🧘 Meditate         65%     │
│    ███████░            19/29   │
│                                 │
│ 5. 💪 Gym              58%     │
│    ██████░             17/29   │
│                                 │
└─────────────────────────────────┘
```

#### **Ranking Calculation**
```javascript
const habitPerformance = habits.map(habit => {
  const completedCount = logs.filter(
    l => l.habitId === habit._id && l.completed
  ).length
  
  const scheduledCount = logs.filter(
    l => l.habitId === habit._id && isDateScheduled(habit, l.date)
  ).length
  
  const percentage = (completedCount / scheduledCount) * 100
  
  return {
    habitId: habit._id,
    name: habit.name,
    emoji: habit.emoji,
    percentage: Math.round(percentage),
    completed: completedCount,
    scheduled: scheduledCount
  }
}).sort((a, b) => b.percentage - a.percentage)
```

### 8.6 **Completion Heatmap**

```
Last 30 Days - Completion Pattern

     W  T  F  S  S  M  T  W  T  F  S  S  M
    ┌───────────────────────────────────┐
    │█  █  █  ░  ░  █  █  █  ░  █  █  █  █│
    │█  █  ░  █  █  █  ░  ░  █  █  █  █  ░│
    │█  █  █  █  █  █  █  █  █  █  ░  █  █│
    │░  █  █  █  ░  ░  █  █  █  █  █  █  █│
    │█  █  █  ░  █  █  █  ░  ░  █  █  ░  █│
    │█  █  █  █  █  █  █  █  █  █  █  █  █│
    └───────────────────────────────────┘

Legend:
█ = All habits completed (100%)
▓ = Most habits completed (75-99%)
▒ = Half completed (50-74%)
░ = Few completed (25-49%)
  = None completed (0-24%)
```

### 8.7 **Trend Analysis**

```
┌─────────────────────────────────┐
│ 📊 TREND ANALYSIS               │
├─────────────────────────────────┤
│                                 │
│ This period vs last period:     │
│ Completion Rate: ↑ +5% (was 73%)│
│ Daily Average: ↑ +0.3 (was 5.9)│
│ Streaks: ↑ +2 days avg          │
│                                 │
│ Best Day This Week:             │
│ Thursday (100% completion)      │
│                                 │
│ Worst Day This Week:            │
│ Sunday (42% completion)         │
│                                 │
└─────────────────────────────────┘
```

### 8.8 **Server-Side Period Validation**

```javascript
// Validate period parameter
const VALID_PERIODS = [7, 14, 30, 60, 90]

if (!VALID_PERIODS.includes(period)) {
  return res.status(400).json({
    error: 'Invalid period. Must be one of: 7, 14, 30, 60, 90'
  })
}
```

---

## **9. HABIT DETAIL MODAL**

### 9.1 **When It Opens**
- Click on habit card
- Click "View Details" button
- From analytics ranking

### 9.2 **Layout**

```
┌─────────────────────────────────────┐
│ 🏃 Morning Jog              [✕]    │
├─────────────────────────────────────┤
│                                     │
│ Status: Active ✓                    │
│ Frequency: Mon-Fri                  │
│ Color: Light Teal                   │
│                                     │
│ QUICK STATS                        │
│ ┌───────┬───────┬───────┬───────┐  │
│ │Current│ Last  │ Best  │Total  │  │
│ │Streak │Logged │Streak │Days   │  │
│ │  14 🔥│ Today │  23 🔥│ 142   │  │
│ └───────┴───────┴───────┴───────┘  │
│                                     │
│ PERFORMANCE METRICS                 │
│ Completion Rate: 87%               │
│ ████████░ Excellent                 │
│                                     │
│ Days Since Start: 52                │
│ Created: Dec 11, 2025               │
│                                     │
│ FREQUENCY BREAKDOWN                 │
│ Scheduled: 37 days                 │
│ Completed: 32 days (86%)           │
│ Missed: 5 days (14%)               │
│                                     │
│ RECENT ACTIVITY (Last 7 Days)      │
│ ┌──────────────────────────────┐   │
│ │ W T F S S M T                 │   │
│ │ ● ● ● ● ● ● ○                │   │
│ └──────────────────────────────┘   │
│                                     │
│ MILESTONES PROGRESS                 │
│ ✓ 7 day    ✓ 14 day   ✓ 21 day    │
│ ✓ 30 day   ○ 60 day   ○ 90 day    │
│                                     │
│ ACTIONS                             │
│ [Edit Habit]  [Delete]  [Export]   │
│                                     │
└─────────────────────────────────────┘
```

### 9.3 **Data Fetching**

```
GET /api/v1/habits/{habitId}
GET /api/v1/analytics/habit/{habitId}?period=90

// Fetches:
// - Habit details (name, emoji, color, frequency)
// - Streak information
// - Performance metrics
// - Recent logs (last 30 days)
// - Milestone progress
```

### 9.4 **Modal Interactions**

- **Edit**: Opens edit wizard
- **Delete**: Shows confirmation
- **Export**: Downloads CSV of habit data
- **Close**: Click × or outside modal
- **Share**: Copy link to habit (if shared feature enabled)

---

## **10. CAT MASCOT (Dynamic Companion)**

### 10.1 **Purpose**
The cat mascot provides emotional feedback and motivation. Its mood changes based on overall habit completion rate, encouraging users to maintain consistency.

### 10.2 **Mood States**

```
Completion % → Mood & Emoji → Animation
─────────────────────────────────────────

0-19%    → 😿 Very Sad (crying)
          • Lying down
          • Drooping ears
          • Sad eyes
          • Slow blink
          Quote: "Don't give up! You can do this. 💪"

20-39%   → 😕 Sad (neutral)
          • Standing still
          • Drooping ears
          • Medium eyes
          Quote: "Getting started! Keep going! 🌱"

40-59%   → 😐 Neutral (indifferent)
          • Standing normally
          • Perked ears
          • Forward looking
          Quote: "You're on your way! 🚀"

60-79%   → 😺 Excited (happy)
          • Bouncing
          • Perked ears
          • Eyes bright
          • Tail wagging
          Quote: "Great progress! You're amazing! ⭐"

80-100%  → 😸 Happy (very happy)
          • Jumping up and down
          • Ears up, big eyes
          • Tail wagging fast
          • Purring animation
          Quote: "You're perfect! Keep it up! 🔥"
```

### 10.3 **Happiness Meter**

```
Completion Rate: 87%

       🐱
      😸
    🐾 🐾
    ━━━━━━━━ ← Meter bar
    ████████░ ← Filled to 87%
    Happiness Level
```

### 10.4 **Animations**

#### **Real-time Updates**
```javascript
// When completion rate changes
const catMood = {
  emoji: getMoodEmoji(completionRate), // 😸, 😺, etc.
  mood: getMoodName(completionRate),    // "Happy", "Excited", etc.
  quote: getMotivationalQuote(completionRate)
}

// Animate meter fill
const animateMeterFill = async (fromPercent, toPercent) => {
  // Smooth animation from current to new percentage
  for (let i = 0; i <= 10; i++) {
    const percent = fromPercent + ((toPercent - fromPercent) * (i / 10))
    setHappinessPercent(percent)
    await sleep(50)
  }
}
```

#### **Idle Animations** (when no interaction for 5 seconds)
```
- Tail wags left-right (1 second interval)
- Eyes blink periodically (3-5 second interval)
- Head sway side-to-side (2 second interval)
- Occasional animation "jump" (10 second interval)
```

### 10.5 **Interactive Elements**

- **Click cat**: Shows encouraging message
- **Touch/Tap on mobile**: Cat reacts with animation
- **Hover**: Cat looks at cursor
- **Mobile device tilt**: Cat tilts head

### 10.6 **Real-time Calculation**

```javascript
const calculateCatMood = async (userId) => {
  // Get all active habits for today
  const today = dayjs.utc().format('YYYY-MM-DD')
  
  const habits = await Habit.find({ 
    userId, 
    isActive: true,
    // Check if scheduled for today
  })
  
  // Count completed
  const logs = await HabitLog.find({
    userId,
    date: today,
    habitId: { $in: habits.map(h => h._id) }
  })
  
  const completed = logs.filter(l => l.completed).length
  const scheduled = habits.filter(h => 
    isDateScheduled(h, dayjs.utc())
  ).length
  
  const percentage = (completed / scheduled) * 100
  
  return {
    percentage,
    mood: getMoodEmoji(percentage),
    quote: getMotivationalQuote(percentage)
  }
}
```

---

## **11. DARK MODE**

### 11.1 **Purpose**
Dark mode provides a comfortable viewing experience in low-light environments and reduces eye strain. The app automatically detects system preferences and respects user choices.

### 11.2 **Theme Context**

```javascript
// ThemeContext.tsx
interface ThemeContextType {
  isDark: boolean
  toggle: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType>()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)
  
  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      const isDarkMode = saved === 'dark'
      setIsDark(isDarkMode)
      applyTheme(isDarkMode)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      applyTheme(prefersDark)
    }
  }, [])
  
  const toggle = () => {
    setIsDark(!isDark)
    applyTheme(!isDark)
    localStorage.setItem('theme', !isDark ? 'dark' : 'light')
  }
  
  const applyTheme = (dark: boolean) => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  return (
    <ThemeContext.Provider value={{ isDark, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### 11.3 **Color Scheme**

#### **Light Mode**
```
Background:   #fafafa (off-white)
Surface:      #ffffff (pure white)
Text Primary: #1f2937 (dark gray)
Text Secondary: #6b7280 (medium gray)
Accent:       #c4b5fd (lavender)
Success:      #86efac (green)
Error:        #f87171 (red)
```

#### **Dark Mode**
```
Background:   #0f172a (dark blue)
Surface:      #1e293b (darker blue)
Text Primary: #f1f5f9 (light gray)
Text Secondary: #cbd5e1 (medium gray)
Accent:       #a78bfa (purple)
Success:      #4ade80 (bright green)
Error:        #ef4444 (bright red)
```

### 11.4 **CSS Variables**

```css
:root {
  /* Light mode (default) */
  --bg-primary: #fafafa;
  --bg-secondary: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent: #c4b5fd;
  --success: #86efac;
  --error: #f87171;
}

:root.dark {
  /* Dark mode */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --border-color: #334155;
  --accent: #a78bfa;
  --success: #4ade80;
  --error: #ef4444;
}
```

### 11.5 **Toggle Location**

```
Profile Screen
├── Account
│   ├── Username
│   ├── Email
│   └── Member Since
├── Preferences
│   ├── Dark Mode [Toggle Switch]
│   └── Theme Status
└── Actions
    └── Logout
```

### 11.6 **Smooth Transitions**

```css
body {
  transition: background-color 0.3s ease;
  transition: color 0.3s ease;
}

.card {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}
```

### 11.7 **System Preference Detection**

```javascript
// Detect system preference changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

mediaQuery.addEventListener('change', (e) => {
  if (e.matches) {
    setIsDark(true)
    applyTheme(true)
  } else {
    setIsDark(false)
    applyTheme(false)
  }
})
```

---

## **12. STREAK TRACKING SYSTEM**

### 12.1 **How Streaks Work**

A streak is a count of **consecutive days** where a habit was completed. The streak breaks if a user misses a scheduled day.

### 12.2 **Streak Calculation Algorithm**

```
┌─────────────────────────────────────────┐
│ STREAK CALCULATION ALGORITHM            │
├─────────────────────────────────────────┤
│                                         │
│ 1. Get all HabitLogs for habit          │
│    Sort by date (DESCENDING)           │
│                                         │
│ 2. Start from TODAY                     │
│    count = 0                            │
│    currentDate = TODAY                  │
│                                         │
│ 3. For each HabitLog (backward):        │
│    IF currentDate is NOT scheduled      │
│      Skip this day (don't break streak) │
│      Go to previous day                 │
│    ELSE IF day is completed            │
│      count++                            │
│      Go to previous day                 │
│    ELSE (day scheduled but not done)   │
│      BREAK - streak broken             │
│                                         │
│ 4. Return count as current streak       │
│                                         │
└─────────────────────────────────────────┘
```

### 12.3 **Code Implementation**

```javascript
async function calculateCorrectStreak(habitId, userId) {
  const habit = await Habit.findById(habitId)
  
  // Get all logs, sorted by date descending
  const logs = await HabitLog.find({ habitId, userId })
    .sort({ date: -1 })
    .lean()
  
  // Create a map for O(1) lookup
  const logMap = new Map()
  logs.forEach(log => {
    logMap.set(log.date, log.completed)
  })
  
  // Calculate streak
  let streak = 0
  let currentDate = dayjs.utc()
  
  while (true) {
    const dateStr = currentDate.format('YYYY-MM-DD')
    
    // Check if this day should be counted
    const isScheduled = isDateScheduled(habit, currentDate)
    
    if (!isScheduled) {
      // Skip unscheduled days without breaking streak
      currentDate = currentDate.subtract(1, 'day')
      continue
    }
    
    // This is a scheduled day
    const isCompleted = logMap.get(dateStr) ?? false
    
    if (isCompleted) {
      streak++
      currentDate = currentDate.subtract(1, 'day')
    } else {
      // Scheduled day not completed - streak breaks
      break
    }
  }
  
  return streak
}
```

### 12.4 **Example Scenarios**

#### **Scenario 1: Daily Habit, Perfect Streak**
```
Jan 5: ✓ completed
Jan 4: ✓ completed
Jan 3: ✓ completed
Jan 2: ✓ completed
Jan 1: ✓ completed

Current Streak: 5 days 🔥
```

#### **Scenario 2: Daily Habit with Break**
```
Jan 5: ✓ completed
Jan 4: ✓ completed
Jan 3: ○ NOT completed ← BREAK HERE
Jan 2: ✓ completed
Jan 1: ✓ completed

Current Streak: 2 days
```

#### **Scenario 3: Mon-Fri Habit (Skip Weekends)**
```
Habit scheduled: Mon-Fri only

Jan 13 (Mon): ✓ completed
Jan 10 (Fri): ✓ completed ← Previous weekday
Jan  9 (Thu): ✓ completed
Jan  8 (Wed): ✓ completed

Jan 11 (Sat): (not scheduled - skip!)
Jan 12 (Sun): (not scheduled - skip!)

Current Streak: 4 scheduled days
(weekend days don't count, no break)
```

### 12.5 **Streak Display**

```
Habit Card:
🏃 Morning Jog
☑
7 🔥        ← Streak display

Habit Details:
Current Streak: 7 days 🔥
Longest Streak: 23 days 🔥 (All-time record)
```

### 12.6 **Streak Recalculation Triggers**

Streaks are recalculated:
- When user toggles a habit (immediate)
- Every 24 hours (cron job)
- When habit frequency changes (reset if applicable)
- On dashboard load (cached for 5 minutes)

---

## **13. USER PROFILE SCREEN**

### 13.1 **Profile Layout**

```
┌─────────────────────────────────────┐
│        👤 MY PROFILE                │
├─────────────────────────────────────┤
│                                     │
│  ACCOUNT INFORMATION                │
│  ┌─────────────────────────────┐   │
│  │ Username: john_doe          │   │
│  │ Email: na***@gmail.com      │   │
│  │ Member Since: Jan 1, 2026   │   │
│  │ Account Status: Active ✓    │   │
│  │ Joined for: 2 days          │   │
│  └─────────────────────────────┘   │
│                                     │
│  QUICK STATS                        │
│  ┌───────────────┬───────────────┐ │
│  │ Total Habits  │ All-Time Max  │ │
│  │ 8             │ 23 day streak │ │
│  └───────────────┴───────────────┘ │
│                                     │
│  PREFERENCES                        │
│  ┌─────────────────────────────┐   │
│  │ 🌙 Dark Mode      [ON/OFF]   │   │
│  │ 🔔 Notifications  [ON/OFF]   │   │
│  │ 📊 Analytics      [On]       │   │
│  │ 🎨 Theme         [Default]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ACTIONS                            │
│  ┌─────────────────────────────┐   │
│  │ [Edit Profile]              │   │
│  │ [Change Password]           │   │
│  │ [Export Data]               │   │
│  │ [Privacy Settings]          │   │
│  │ [Help & Support]            │   │
│  │ [About]                     │   │
│  │ [LOGOUT]                    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 13.2 **Email Masking**

For privacy, emails are partially hidden:

```
Format: first2chars***@domain.com

Examples:
john.doe@gmail.com    → jo***@gmail.com
a.b.c@company.co.uk   → a.***@company.co.uk
```

### 13.3 **Edit Profile**

Users can update:
- ✓ Username
- ✗ Email (immutable for security)
- ✓ Password
- ✓ Theme preference
- ✓ Notification settings

### 13.4 **Export Data**

Users can download their data as CSV:

```
Endpoint: GET /api/v1/user/export
Response: CSV file with:
- All habits created
- All habit logs
- All challenge records
- Statistics summary
```

### 13.5 **Account Deletion**

```
┌─────────────────────────────────────┐
│ DELETE ACCOUNT                      │
├─────────────────────────────────────┤
│                                     │
│ ⚠️  WARNING                         │
│                                     │
│ This action cannot be undone!       │
│ All data will be permanently        │
│ deleted including:                  │
│ • All habits                        │
│ • All logs                          │
│ • All challenges                    │
│ • All statistics                    │
│                                     │
│ Type your password to confirm:      │
│ [Password input field]              │
│                                     │
│ [Cancel]  [Delete Account]          │
│                                     │
└─────────────────────────────────────┘
```

---

## **14. NAVIGATION SYSTEM**

### 14.1 **Bottom Tab Navigation**

```
┌───────────────────────────────────────────┐
│  Main Content Area                        │
│  (Tab-specific content)                   │
│                                           │
│                                           │
│                                           │
│                                           │
├───────────────────────────────────────────┤
│ 🏠     📅     🗺️      🏆      📊     👤   │
│Home   Grid   Journey  Challenge Stats  Profile
│(active icon highlighted, others faded)
└───────────────────────────────────────────┘
```

### 14.2 **Tab Details**

#### **Tab 1: 🏠 Home**
- Dashboard with habit cards
- Today's stats
- Cat mascot
- Floating action button

#### **Tab 2: 📅 Grid**
- Monthly calendar view
- All habits in grid format
- Month navigation

#### **Tab 3: 🗺️ Journey**
- Milestone timeline
- Progress visualization
- Motivational messages

#### **Tab 4: 🏆 Challenge**
- Active challenges list
- Challenge creation
- Progress tracking
- Completed challenges

#### **Tab 5: 📊 Stats**
- Analytics dashboard
- Period selector
- Performance charts
- Habit rankings
- Heatmaps

#### **Tab 6: 👤 Profile**
- Account information
- Preferences
- Dark mode toggle
- Logout

### 14.3 **Tab Switching Animation**

```javascript
// Framer Motion animation
const tabVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
}

<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    variants={tabVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {renderTabContent()}
  </motion.div>
</AnimatePresence>
```

### 14.4 **Mobile Optimization**

- **Fixed bottom navigation**: Always visible
- **Safe area padding**: Accounts for notches/home buttons
- **Large touch targets**: Minimum 48px height
- **Visual feedback**: Ripple/scale on tap

### 14.5 **Badge Notifications**

Tabs can show notification badges:

```
🏠₃        ← 3 uncompleted habits
🏆¹        ← 1 challenge expiring soon

Badges are red with white text,
positioned at top-right of icon
```

---

## **15. PERFORMANCE & OPTIMIZATION**

### 15.1 **Frontend Optimizations**

- **Code Splitting**: Each tab loaded on-demand
- **Memoization**: Components memoized with React.memo
- **Virtual Scrolling**: For lists 100+ items
- **Lazy Loading**: Images and components
- **Debouncing**: API calls (500ms debounce)
- **Caching**: Analytics data cached for 5 minutes

### 15.2 **Backend Optimizations**

- **MongoDB Indexes**: On frequently queried fields
  ```
  HabitLog: { userId, habitId, date }
  Habit: { userId, isActive }
  Challenge: { userId, habitId, status }
  ```
- **Query Optimization**: Only fetch needed fields
- **Pagination**: Limits API response size
- **Compression**: gzip compression enabled
- **CDN**: Static assets served from CDN

### 15.3 **Database Indexes**

```javascript
// HabitLog collection
db.habitlogs.createIndex({ userId: 1, habitId: 1, date: 1 }, { unique: true })

// Habit collection
db.habits.createIndex({ userId: 1, isActive: 1 })

// Challenge collection
db.challenges.createIndex({ userId: 1, habitId: 1 })
db.challenges.createIndex({ userId: 1, status: 1 })
```

---

## **16. SECURITY FEATURES**

### 16.1 **Authentication**
- ✅ JWT with dual-token strategy
- ✅ httpOnly cookies for refresh tokens
- ✅ Access tokens in memory (XSS safe)
- ✅ Automatic token refresh
- ✅ Token expiration (60m access, 7d refresh)

### 16.2 **Data Protection**
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ HTTPS enforced in production
- ✅ SQL injection prevented (using ODM)
- ✅ CORS configured properly
- ✅ Rate limiting on auth endpoints

### 16.3 **Privacy**
- ✅ Email addresses masked in UI
- ✅ User data isolated by userId
- ✅ No logs stored permanently
- ✅ Data export available
- ✅ Account deletion supported

### 16.4 **Validation**
- ✅ Server-side validation (Zod)
- ✅ Date format validation (YYYY-MM-DD)
- ✅ Period validation (7,14,30,60,90)
- ✅ Frequency validation (custom days)
- ✅ Input sanitization

---

## **17. DATA MODELS**

### 17.1 **User Model**
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  username: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date (UTC),
  updatedAt: Date (UTC)
}
```

### 17.2 **Habit Model** (see section 2.3)

### 17.3 **HabitLog Model** (see section 3.4)

### 17.4 **Challenge Model** (see section 7.3)

### 17.5 **Streak Model** (cached, not stored)
```javascript
{
  habitId: ObjectId,
  userId: ObjectId,
  currentStreak: Number,
  longestStreak: Number,
  lastCalculated: Date
}
```

---

## **18. API SPECIFICATIONS**

### 18.1 **Authentication Endpoints**

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/profile
```

### 18.2 **Habit Endpoints**

```
GET    /api/v1/habits              - Get all user habits
GET    /api/v1/habits/{id}         - Get specific habit
POST   /api/v1/habits              - Create habit
PUT    /api/v1/habits/{id}         - Update habit
DELETE /api/v1/habits/{id}         - Delete habit
POST   /api/v1/habits/{id}/logs/toggle - Toggle completion
GET    /api/v1/habits/{id}/logs    - Get habit logs
```

### 18.3 **Analytics Endpoints**

```
GET /api/v1/analytics/summary      - Dashboard summary
GET /api/v1/analytics/today        - Today's stats
GET /api/v1/analytics/habit/{id}   - Habit analytics
```

### 18.4 **Challenge Endpoints**

```
GET    /api/v1/challenges          - Get all challenges
GET    /api/v1/challenges/{id}     - Get specific challenge
POST   /api/v1/challenges          - Create challenge
PUT    /api/v1/challenges/{id}     - Update challenge
DELETE /api/v1/challenges/{id}     - Delete challenge
```

---

## **19. ERROR HANDLING**

### 19.1 **HTTP Status Codes**

```
200 - OK (success)
201 - Created (resource created)
400 - Bad Request (invalid input)
401 - Unauthorized (auth required)
403 - Forbidden (no permission)
404 - Not Found (resource missing)
409 - Conflict (duplicate email/username)
429 - Too Many Requests (rate limited)
500 - Server Error (something broke)
```

### 19.2 **Error Response Format**

```json
{
  "error": "Habit not scheduled for this day",
  "code": "FREQUENCY_VALIDATION_FAILED",
  "details": {
    "habitId": "xxx",
    "date": "2026-01-02",
    "scheduledDays": [1, 2, 3, 4, 5]
  }
}
```

### 19.3 **Frontend Error Handling**

- Toast notifications for user feedback
- Optimistic UI rollback on errors
- Error logging for debugging
- Graceful degradation

---

## **20. TESTING & VALIDATION**

### 20.1 **Unit Tests**
- JWT token generation/validation
- Streak calculation algorithm
- Date formatting utilities
- Period validation

### 20.2 **Integration Tests**
- Habit creation workflow
- Complete toggle → update → display flow
- Challenge progress tracking
- Analytics calculation

### 20.3 **E2E Tests**
- Full user journey
- Multi-tab navigation
- Dark mode toggle
- Challenge completion

### 20.4 **Performance Tests**
- API response times (< 200ms)
- Bundle size (< 500kb)
- Lighthouse score (> 90)
- Database query times (< 100ms)

---

## **TECH STACK SUMMARY**

**Frontend:**
- Next.js 16.0.10
- React 19.2.0
- TypeScript 5.7.2
- Tailwind CSS 4.1.9
- Framer Motion 12.23.26
- Axios 1.7.7
- Dayjs 1.11.11

**Backend:**
- Node.js 20
- Express.js 4.18.2
- MongoDB 8.0.0
- Mongoose 8.1.3
- jsonwebtoken 9.1.2
- bcryptjs 2.4.3
- Zod 3.25.76

**Deployment:**
- Vercel (Frontend)
- Railway (Backend)
- MongoDB Atlas (Database)

---

**🎉 HABBIT TRACKER - Your Companion for Building Great Habits! 🐱✨**
