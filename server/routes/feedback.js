const express = require('express');
const Feedback = require('../models/Feedback');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create feedback
router.post('/', auth, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      title,
      message,
    });

    res.status(201).json(feedback);
  } catch (err) {
    console.error('Create feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's feedback
router.get('/', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(feedbacks);
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update feedback with 15-minute rule
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, message } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to edit this feedback' });
    }

    const createdAt = feedback.createdAt.getTime();
    const now = Date.now();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    if (now - createdAt > FIFTEEN_MINUTES) {
      return res.status(403).json({
        message: 'Edit window expired. Feedback is locked after 15 minutes.',
      });
    }

    if (title !== undefined) feedback.title = title;
    if (message !== undefined) feedback.message = message;

    await feedback.save();
    res.json(feedback);
  } catch (err) {
    console.error('Update feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

