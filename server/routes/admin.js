const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Secret admin view of all feedback
router.get('/feedback', auth, requireAdmin, async (_req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('user', 'email role')
      .sort({ createdAt: -1 })
      .lean();
    res.json(feedbacks);
  } catch (err) {
    console.error('Admin feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional helper to see basic stats
router.get('/stats', auth, requireAdmin, async (_req, res) => {
  try {
    const [userCount, feedbackCount] = await Promise.all([
      User.countDocuments(),
      Feedback.countDocuments(),
    ]);
    res.json({ userCount, feedbackCount });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

