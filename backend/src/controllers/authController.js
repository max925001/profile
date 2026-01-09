import User from '../models/User.js';
import axios from 'axios';
import { fetchAndStoreGitHubData } from '../services/githubService.js';


const cookieOptions = {
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite:'None',
    secure: true

}
export const signup = async (req, res) => {
  try {
    const { name, email, githubUsername, password } = req.body;

    if (!name || !email || !githubUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields required: name, email, githubUsername, password'
      });
    }

    // Check email exists
    if (await User.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate GitHub username exists
    try {
      await axios.get(`https://api.github.com/users/${githubUsername}`, {
        headers: { 'User-Agent': 'Profile-Playground-App' }
      });
    } catch (err) {
      if (err.response?.status === 404) {
        return res.status(400).json({
          success: false,
          message: 'GitHub username does not exist'
        });
      }
      return res.status(503).json({
        success: false,
        message: 'Cannot verify GitHub right now (API issue)'
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      githubUsername,
      password,
    });

    await user.save();

    // IMPORTANT: Fetch and store GitHub data right after signup
    try {
      await fetchAndStoreGitHubData(user._id);
    } catch (githubErr) {
      console.warn('GitHub data fetch failed during signup (user still created):', githubErr.message);
      // Do NOT fail signup because of this
    }
    const userData = await User.findById(user._id).select('-password');

    // Generate token & set cookie
    const token = user.generateJWT();

    res.cookie('jwt', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
     user: {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        githubUsername: userData.githubUsername,
        profile: userData.profile || {}, // contains githubData, links, etc.
        createdAt: userData.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = user.generateJWT();

    res.cookie('jwt', token, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
        profile: user.profile || {}, // contains githubData, links, etc.
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const logout = async (req, res) => {
  try{
    res.clearCookie('jwt', cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};