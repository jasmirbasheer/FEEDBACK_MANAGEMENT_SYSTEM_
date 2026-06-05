const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['classroom', 'food', 'campus', 'facilities', 'technology', 'other'],
      default: 'other',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);

