const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Secret admin view of all feedback
router.get('/feedback', auth, requireAdmin, async (_req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .select('-user')
      .sort({ createdAt: -1 })
      .lean();
    res.json(
      feedbacks.map((item) => ({
        ...item,
        submitter: 'Anonymous',
      }))
    );
  } catch (err) {
    console.error('Admin feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional helper to see basic stats
router.get('/stats', auth, requireAdmin, async (_req, res) => {
  try {
    const [userCount, feedbackCount, byCategory, byStatus] = await Promise.all([
      User.countDocuments(),
      Feedback.countDocuments(),
      Feedback.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const categoryCounts = {
      classroom: 0,
      food: 0,
      campus: 0,
      facilities: 0,
      technology: 0,
      other: 0,
    };
    byCategory.forEach((row) => {
      if (row._id && categoryCounts[row._id] !== undefined) {
        categoryCounts[row._id] = row.count;
      }
    });

    const statusCounts = { open: 0, in_progress: 0, resolved: 0 };
    byStatus.forEach((row) => {
      if (row._id && statusCounts[row._id] !== undefined) {
        statusCounts[row._id] = row.count;
      }
    });

    res.json({ userCount, feedbackCount, categoryCounts, statusCounts });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Management updates feedback workflow status
router.patch('/feedback/:id/status', auth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['open', 'in_progress', 'resolved'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-user');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ ...feedback.toObject(), submitter: 'Anonymous' });
  } catch (err) {
    console.error('Admin status update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

