import jwt from 'jsonwebtoken';

// ✅ FIX #2, #3: Updated token lifetimes
// Access token: 60 minutes (30-60 min range)
// Refresh token: 7 days (7-14 day range)
export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '60m', // ✅ FIX #3: 15m → 60m
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // ✅ FIX #2: 7 days (in 7-14 day range)
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
