// backend/models/DailyTask.js
const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskDescription: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
dailyTaskSchema.index({ employeeId: 1, createdAt: -1 });

module.exports = mongoose.model('DailyTask', dailyTaskSchema);