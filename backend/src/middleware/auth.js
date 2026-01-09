// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // From httpOnly cookie
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided - please login' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default protect;