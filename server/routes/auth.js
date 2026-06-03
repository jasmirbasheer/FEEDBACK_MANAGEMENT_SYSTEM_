const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/email');

const router = express.Router();

// Helper to sign JWT
function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Register - step 1: create user and send OTP
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, adminSecret } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let userRole = 'user';
    if (role === 'admin') {
      const expected = process.env.ADMIN_REGISTER_SECRET || 'management2026';
      if (!adminSecret || adminSecret !== expected) {
        return res.status(403).json({
          message: 'Invalid management access code.',
        });
      }
      userRole = 'admin';
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.create({
      email,
      passwordHash,
      role: userRole,
      isVerified: false,
      otpCode,
      otpExpiresAt,
    });

    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: 'Verification code sent. Please check your email.',
      email,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP - step 2: activate account and return token
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: 'Account already verified. Please log in.' });
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'No verification code found' });
    }
    if (user.otpCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: 'Account not verified. Please check your email.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

