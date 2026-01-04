import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import Challenge from '../models/Challenge.js';
import { generateTokens } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Check if user exists
    // ✅ FIX #8: Return 409 Conflict for duplicates (not 400)
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({
        message: existing.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    // Create user
    const user = new User({ email, username, password });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // ✅ FIX #1, #2: Set refresh token in httpOnly cookie (secure)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      accessToken, // ✅ FIX #1: Return in body, frontend stores in-memory
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username and include password
    const user = await User.findOne({ 
      $or: [{ email }, { username: email }] 
    }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // ✅ FIX #1, #2: Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken, // ✅ FIX #1: Return in body, frontend stores in-memory
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    // ✅ FIX #1: Read refresh token from httpOnly cookie (browser auto-sends)
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const { verifyToken } = await import('../utils/jwt.js');
    const decoded = verifyToken(token, true);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    // ✅ FIX #1: Set new refresh token in cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken: newAccessToken, // Return new access token in body
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, theme, completionGoal, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(username && { username }),
        ...(theme && { theme }),
        ...(completionGoal !== undefined && { completionGoal }),
        ...(avatar && { avatar }),
      },
      { new: true, runValidators: true }
    );

    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const changeUsername = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser && !existingUser._id.equals(req.userId)) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Username changed successfully', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // ✅ FIX #14: Clear refresh token cookie on server
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Expires immediately
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

// ✅ FIX #7, #13: Export user data with password re-confirmation for security
export const exportUserData = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user._id; // From authMiddleware

    // Re-verify password for security
    const user = await User.findById(userId).select('+password');
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Get all user data
    const habits = await Habit.find({ userId });
    const logs = await HabitLog.find({ userId });
    const challenges = await Challenge.find({ userId });

    // Format as CSV
    const csvData = formatAsCSV({ user, habits, logs, challenges });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=habit-tracker-export.csv');
    res.send(csvData);
  } catch (error) {
    next(error);
  }
};

// Helper to format data as CSV
function formatAsCSV({ user, habits, logs, challenges }) {
  let csv = 'Habit Tracker Export\n\n';
  
  csv += 'USER INFO\n';
  csv += `Username,Email,Member Since\n`;
  csv += `"${user.username}","${user.email}","${user.createdAt.toISOString()}"\n\n`;
  
  csv += 'HABITS\n';
  csv += `Name,Emoji,Frequency,Created,Active\n`;
  habits.forEach(h => {
    csv += `"${h.name}","${h.emoji}","${h.frequency}","${h.createdAt.toISOString()}","${h.isActive}"\n`;
  });
  
  csv += '\n\nHABIT LOGS\n';
  csv += `Habit,Date,Completed\n`;
  logs.forEach(l => {
    const habit = habits.find(h => h._id.equals(l.habitId));
    csv += `"${habit.name}","${l.date}","${l.completed}"\n`;
  });
  
  return csv;
}
