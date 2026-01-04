export const API_BASE_URL = "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
  },
  HABITS: {
    BASE: "/habits",
    BY_ID: (id: string) => `/habits/${id}`,
    COMPLETE: (id: string) => `/habits/${id}/complete`,
    UNCOMPLETE: (id: string) => `/habits/${id}/uncomplete`,
  },
  STREAKS: {
    BASE: "/streaks",
    BY_HABIT: (habitId: string) => `/streaks/habit/${habitId}`,
  },
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    HEATMAP: "/analytics/heatmap",
  },
  CHALLENGES: {
    BASE: "/challenges",
    BY_ID: (id: string) => `/challenges/${id}`,
    JOIN: (id: string) => `/challenges/${id}/join`,
    LEAVE: (id: string) => `/challenges/${id}/leave`,
  },
  CAT: {
    STATUS: "/cat/status",
    FEED: "/cat/feed",
    PLAY: "/cat/play",
  },
};

export const COLORS = {
  purple: {
    light: "#E9D5FF",
    DEFAULT: "#A855F7",
    dark: "#7E22CE",
  },
  pink: {
    light: "#FCE7F3",
    DEFAULT: "#EC4899",
    dark: "#BE185D",
  },
  mint: {
    light: "#D1FAE5",
    DEFAULT: "#10B981",
    dark: "#047857",
  },
  peach: {
    light: "#FED7AA",
    DEFAULT: "#FB923C",
    dark: "#EA580C",
  },
  blue: {
    light: "#DBEAFE",
    DEFAULT: "#3B82F6",
    dark: "#1D4ED8",
  },
  rose: {
    light: "#FFE4E6",
    DEFAULT: "#F43F5E",
    dark: "#BE123C",
  },
  emerald: {
    light: "#D1FAE5",
    DEFAULT: "#10B981",
    dark: "#047857",
  },
  amber: {
    light: "#FEF3C7",
    DEFAULT: "#F59E0B",
    dark: "#D97706",
  },
};

export const HABIT_COLORS = [
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Mint", value: "mint" },
  { name: "Peach", value: "peach" },
  { name: "Blue", value: "blue" },
  { name: "Rose", value: "rose" },
  { name: "Emerald", value: "emerald" },
  { name: "Amber", value: "amber" },
];

export const HABIT_EMOJIS = [
  "💪", "🏃", "📚", "💧", "🧘", "🎯", "✍️", "🎨",
  "🎵", "🌱", "🔥", "⭐", "💝", "🌈", "☀️", "🌙",
  "📝", "🍎", "🧠", "💻", "🎓", "🏆", "🌟", "✨",
];

export const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Custom", value: "custom" },
];

export const DAYS_OF_WEEK = [
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
];

export const DEFAULT_HABIT = {
  name: "",
  description: "",
  icon: "🎯",
  color: "purple",
  frequency: "daily",
  reminderTime: "",
  targetDays: [],
};

export const DEFAULT_CHALLENGE = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  targetDays: 30,
  category: "health",
};

export const CHALLENGE_CATEGORIES = [
  { label: "Health & Fitness", value: "health" },
  { label: "Learning", value: "learning" },
  { label: "Productivity", value: "productivity" },
  { label: "Mindfulness", value: "mindfulness" },
  { label: "Creative", value: "creative" },
  { label: "Social", value: "social" },
];

export const STREAK_MILESTONES = [
  { days: 7, label: "Week Warrior", emoji: "🔥" },
  { days: 30, label: "Month Master", emoji: "💪" },
  { days: 60, label: "Consistency King", emoji: "👑" },
  { days: 100, label: "Century Champion", emoji: "🏆" },
  { days: 365, label: "Year Legend", emoji: "🌟" },
];

export const CAT_MOODS = {
  happy: { emoji: "😸", label: "Happy" },
  normal: { emoji: "😺", label: "Normal" },
  hungry: { emoji: "😿", label: "Hungry" },
  sleepy: { emoji: "😴", label: "Sleepy" },
  playful: { emoji: "😻", label: "Playful" },
  sick: { emoji: "🙀", label: "Sick" },
};

export const THEME_COLORS = {
  light: {
    background: "#FFFFFF",
    foreground: "#0F172A",
    card: "#F8FAFC",
    cardForeground: "#0F172A",
    primary: "#A855F7",
    primaryForeground: "#FFFFFF",
    secondary: "#EC4899",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    border: "#E2E8F0",
  },
  dark: {
    background: "#0F172A",
    foreground: "#F8FAFC",
    card: "#1E293B",
    cardForeground: "#F8FAFC",
    primary: "#A855F7",
    primaryForeground: "#FFFFFF",
    secondary: "#EC4899",
    muted: "#334155",
    mutedForeground: "#94A3B8",
    border: "#334155",
  },
};
