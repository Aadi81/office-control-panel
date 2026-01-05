// backend/models/WorkingDay.js
const mongoose = require('mongoose');

const workingDaySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
workingDaySchema.index({ employeeId: 1, date: -1 });

module.exports = mongoose.model('WorkingDay', workingDaySchema);